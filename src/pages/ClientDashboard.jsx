import { useEffect, useState } from 'react';
import { LogOut, Plus, Ticket } from 'lucide-react';
import { listTickets } from '../lib/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import TicketForm from '../components/TicketForm.jsx';
import TicketThread from '../components/TicketThread.jsx';

export default function ClientDashboard({ appContext }) {
  const { session } = appContext;
  const [tickets, setTickets] = useState([]);
  const [active, setActive] = useState(null);
  const [creating, setCreating] = useState(false);
  const load = () => listTickets().then(setTickets).catch(() => setTickets([]));
  useEffect(() => { load(); }, []);

  return (
    <main className="dashboard">
      <header className="dash-header"><div><h1>Portal de soporte</h1><p>{session.user.email}</p></div><a className="secondary" href="/logout"><LogOut size={16} /> Salir</a></header>
      <div className="toolbar"><button className="primary" onClick={() => setCreating(!creating)}><Plus size={16} /> Nuevo ticket</button></div>
      {creating && <section className="panel"><TicketForm session={session} onCreated={() => { setCreating(false); load(); }} /></section>}
      <section className="data-layout">
        <div className="ticket-list panel">
          <h2><Ticket size={20} /> Mis tickets</h2>
          {tickets.map((ticket) => <button key={ticket.id} className="ticket-row" onClick={() => setActive(ticket)}><span>{ticket.ticketId}</span><strong>{ticket.issue}</strong><StatusBadge status={ticket.status} /></button>)}
          {tickets.length === 0 && <p>No hay tickets registrados.</p>}
        </div>
        {active && <TicketThread ticket={active} session={session} onChanged={() => { load(); setActive(null); }} />}
      </section>
    </main>
  );
}
