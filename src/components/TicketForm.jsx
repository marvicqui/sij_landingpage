import { useEffect, useState } from 'react';
import { createTicket, listServices } from '../lib/api.js';

export default function TicketForm({ session, delegated = false, onCreated }) {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: '', company: '', email: session?.user?.email || '', serviceName: '', severity: 'Media', issue: '' });
  const [state, setState] = useState('idle');

  useEffect(() => { listServices().then(setServices).catch(() => setServices([])); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setState('saving');
    try {
      await createTicket(form);
      setForm({ name: '', company: '', email: delegated ? '' : session?.user?.email || '', serviceName: '', severity: 'Media', issue: '' });
      setState('saved');
      onCreated?.();
    } catch (error) {
      setState(error.message || 'error');
    }
  };

  return (
    <form className="form-grid" onSubmit={submit}>
      <input required placeholder="Nombre del solicitante" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      <input required type="email" readOnly={!delegated} placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <select required value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })}>
        <option value="">Servicio afectado</option>
        {services.map((service) => <option key={service.id} value={service.name}>{service.name}</option>)}
      </select>
      <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
        <option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option>
      </select>
      <textarea required className="span-2" placeholder="Describe la incidencia" value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} />
      <button className="primary span-2" disabled={state === 'saving'}>{state === 'saving' ? 'Guardando...' : 'Levantar ticket'}</button>
      {state !== 'idle' && state !== 'saving' && <p className="form-state span-2">{state === 'saved' ? 'Ticket creado correctamente.' : state}</p>}
    </form>
  );
}
