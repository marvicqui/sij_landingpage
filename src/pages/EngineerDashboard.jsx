import { useEffect, useMemo, useState } from 'react';
import { LogOut, Settings, Ticket, UserPlus } from 'lucide-react';
import { addConfig, adminConfig, deleteConfig, listTickets, updateTicket } from '../lib/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import TicketForm from '../components/TicketForm.jsx';
import TicketThread from '../components/TicketThread.jsx';

export default function EngineerDashboard({ appContext }) {
  const { session } = appContext;
  const [tickets, setTickets] = useState([]);
  const [active, setActive] = useState(null);
  const [creating, setCreating] = useState(false);
  const [configType, setConfigType] = useState('service');
  const [configRows, setConfigRows] = useState([]);
  const [newValue, setNewValue] = useState('');
  const load = () => listTickets().then(setTickets).catch(() => setTickets([]));
  const loadConfig = () => adminConfig(configType).then(setConfigRows).catch(() => setConfigRows([]));
  useEffect(() => { load(); }, []);
  useEffect(() => { loadConfig(); }, [configType]);

  const groups = useMemo(() => ['Abierto', 'En Progreso', 'Pendiente de Aprobación', 'Cerrado'].map((status) => ({ status, items: tickets.filter((t) => String(t.status).startsWith(status.replace('Pendiente de Aprobación', 'Pendiente')) || t.status === status) })), [tickets]);

  const quickStatus = async (ticket, status) => { await updateTicket({ ticketId: ticket.ticketId, status }); load(); };
  const addRow = async (event) => { event.preventDefault(); await addConfig(configType, { value: newValue, name: newValue, email: newValue }); setNewValue(''); loadConfig(); };

  return (
    <main className="dashboard wide">
      <header className="dash-header"><div><h1>NOC Central</h1><p>{session.user.email}</p></div><a className="secondary" href="/logout"><LogOut size={16} /> Salir</a></header>
      <div className="toolbar"><button className="primary" onClick={() => setCreating(!creating)}><UserPlus size={16} /> Ticket delegado</button></div>
      {creating && <section className="panel"><TicketForm session={session} delegated onCreated={() => { setCreating(false); load(); }} /></section>}
      <section className="kanban">
        {groups.map((group) => <div className="panel column" key={group.status}><h2>{group.status}</h2>{group.items.map((ticket) => <article key={ticket.id} className="ticket-card" onClick={() => setActive(ticket)}><strong>{ticket.ticketId}</strong><p>{ticket.issue}</p><small>{ticket.email}</small><StatusBadge status={ticket.status} /><select value={ticket.status} onClick={(e) => e.stopPropagation()} onChange={(e) => quickStatus(ticket, e.target.value)}><option>Abierto</option><option>En Progreso</option><option>Pendiente de Aprobación</option><option>Cerrado</option></select></article>)}</div>)}
      </section>
      <section className="data-layout">
        {active && <TicketThread ticket={active} session={session} onChanged={() => { load(); setActive(null); }} />}
        <aside className="panel config-panel"><h2><Settings size={20} /> Configuracion</h2><select value={configType} onChange={(e) => setConfigType(e.target.value)}><option value="service">Servicios</option><option value="engineer">Ingenieros</option><option value="allowedClient">Clientes permitidos</option><option value="macro">Macros</option><option value="kb">Base de conocimiento</option></select><form onSubmit={addRow}><input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Nuevo valor" /><button>Agregar</button></form>{configRows.map((row) => <div className="config-row" key={row.id}><span>{row.name || row.email || row.value || row.title}</span><button onClick={() => deleteConfig(configType, row.id).then(loadConfig)}>Eliminar</button></div>)}</aside>
      </section>
    </main>
  );
}
