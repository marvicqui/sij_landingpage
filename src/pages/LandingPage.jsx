import { useState } from 'react';
import { Cloud, Cpu, Headphones, Mail, Network, ShieldCheck, TowerControl } from 'lucide-react';
import TopNav from '../components/TopNav.jsx';
import { sendChat, sendContact } from '../lib/api.js';

export default function LandingPage({ session }) {
  const [lead, setLead] = useState({ name: '', company: '', email: '', service: '', message: '' });
  const [leadState, setLeadState] = useState('idle');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hola, soy el asistente de SIJ. Puedo orientarte sobre infraestructura, cloud y soporte B2B.' }]);

  const submitLead = async (event) => {
    event.preventDefault();
    setLeadState('sending');
    try {
      await sendContact(lead);
      setLead({ name: '', company: '', email: '', service: '', message: '' });
      setLeadState('sent');
    } catch {
      setLeadState('error');
    }
  };

  const ask = async () => {
    if (!chatInput.trim()) return;
    const next = [...messages, { role: 'user', content: chatInput.trim() }];
    setMessages(next);
    setChatInput('');
    try {
      const answer = await sendChat({ message: next[next.length - 1].content, history: next.slice(-6) });
      setMessages([...next, { role: 'assistant', content: answer.reply }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'No pude responder en este momento. Escríbenos a soporte@sij.mx.' }]);
    }
  };

  return (
    <>
      <TopNav session={session} />
      <main>
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <p className="eyebrow">Infraestructura, cloud y soporte B2B</p>
            <h1>SIJ</h1>
            <p className="hero-copy">Diseñamos, operamos y protegemos redes, centros de datos y plataformas cloud para empresas que necesitan continuidad real.</p>
            <div className="hero-actions"><a className="primary" href="#contacto">Agendar consulta</a><a className="secondary" href="/login">Portal de soporte</a></div>
          </div>
        </section>

        <section id="soluciones" className="section split-band">
          <div><p className="eyebrow">Soluciones</p><h2>Ingenieria lista para operacion critica</h2></div>
          <div className="solution-grid">
            <article><Network /><h3>Redes robustas</h3><p>Fibra, enlaces PtP/PtMP, LAN/WAN y videovigilancia IP.</p></article>
            <article><Cloud /><h3>Arquitectura cloud</h3><p>Migraciones a Azure, nube hibrida, continuidad y FinOps.</p></article>
            <article><Cpu /><h3>TI y virtualizacion</h3><p>Datacenter, VMware, Microsoft, Fortinet y alta disponibilidad.</p></article>
            <article><TowerControl /><h3>Telecom</h3><p>Torres, enlaces, tierra fisica y mantenimiento en alturas.</p></article>
          </div>
        </section>

        <section id="soporte" className="section support-band">
          <div><Headphones size={40} /><h2>Portal privado de soporte</h2><p>Clientes autorizados pueden levantar tickets, conversar con ingenieros y aprobar cierres desde Microsoft Entra ID.</p></div>
          <a className="primary" href="/login">Ingresar con Microsoft</a>
        </section>

        <section id="contacto" className="section contact-layout">
          <div><p className="eyebrow">Contacto</p><h2>Eleva tu infraestructura hoy</h2><p><Mail size={16} /> ventas@sij.mx</p><p><ShieldCheck size={16} /> soporte@sij.mx</p></div>
          <form className="contact-form" onSubmit={submitLead}>
            <input required placeholder="Nombre" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
            <input placeholder="Empresa" value={lead.company} onChange={(e) => setLead({ ...lead, company: e.target.value })} />
            <input required type="email" placeholder="Correo" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
            <select value={lead.service} onChange={(e) => setLead({ ...lead, service: e.target.value })}><option value="">Servicio</option><option>Redes</option><option>Cloud</option><option>Infraestructura TI</option><option>Telecom</option></select>
            <textarea required placeholder="Mensaje" value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} />
            <button className="primary">{leadState === 'sending' ? 'Enviando...' : 'Solicitar cotizacion'}</button>
            {leadState === 'sent' && <p className="ok">Mensaje enviado.</p>}
            {leadState === 'error' && <p className="error">No fue posible enviar el mensaje.</p>}
          </form>
        </section>
      </main>
      <button className="chat-launcher" onClick={() => setChatOpen(!chatOpen)}>Chat</button>
      {chatOpen && <aside className="chat"><div className="chat-log">{messages.map((m, i) => <p key={i} className={m.role}>{m.content}</p>)}</div><div className="chat-input"><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()} placeholder="Consulta breve" /><button onClick={ask}>Enviar</button></div></aside>}
      <footer>SIJ · Sistemas Informaticos JVP · Coatzacoalcos, Veracruz</footer>
    </>
  );
}
