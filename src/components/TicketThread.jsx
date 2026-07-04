import { useEffect, useState } from 'react';
import { createTicketUpdate, listTicketUpdates, updateTicket } from '../lib/api.js';
import StatusBadge from './StatusBadge.jsx';

export default function TicketThread({ ticket, session, onChanged }) {
  const [updates, setUpdates] = useState([]);
  const [message, setMessage] = useState('');
  const [internal, setInternal] = useState(false);
  const isEngineer = session.role === 'engineer' || session.role === 'admin';

  const load = () => listTicketUpdates(ticket.ticketId).then(setUpdates).catch(() => setUpdates([]));
  useEffect(() => { load(); }, [ticket.ticketId]);

  const send = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    await createTicketUpdate({ ticketId: ticket.ticketId, message, internal });
    setMessage('');
    setInternal(false);
    load();
    onChanged?.();
  };

  const changeStatus = async (status) => {
    await updateTicket({ ticketId: ticket.ticketId, status });
    onChanged?.();
  };

  return (
    <section className="thread">
      <div className="thread-header">
        <div>
          <strong>{ticket.ticketId}</strong>
          <h3>{ticket.issue}</h3>
          <p>{ticket.email} · {ticket.serviceName || 'Sin servicio'}</p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      {isEngineer && ticket.status !== 'Cerrado' && (
        <div className="toolbar compact">
          {['Abierto', 'En Progreso', 'Pendiente de Aprobación'].map((status) => <button key={status} onClick={() => changeStatus(status)}>{status}</button>)}
        </div>
      )}
      <div className="messages">
        <article className="message"><span>{ticket.email}</span><p>{ticket.issue}</p></article>
        {updates.map((update) => <article key={update.id} className={update.internal ? 'message internal' : 'message'}><span>{update.userEmail} · {new Date(update.createdAt).toLocaleString('es-MX')}</span><p>{update.message}</p></article>)}
      </div>
      {ticket.status !== 'Cerrado' && !String(ticket.status).startsWith('Pendiente') && (
        <form className="reply" onSubmit={send}>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe una actualización" />
          {isEngineer && <label><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Nota interna</label>}
          <button className="primary">Enviar</button>
        </form>
      )}
      {!isEngineer && String(ticket.status).startsWith('Pendiente') && <button className="primary" onClick={() => updateTicket({ ticketId: ticket.ticketId, status: 'Cerrado', clientApproved: true }).then(onChanged)}>Aprobar cierre</button>}
    </section>
  );
}
