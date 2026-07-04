import { app } from '@azure/functions';
import { hashToken } from '../lib/ids.js';
import { html } from '../lib/http.js';
import { query, upsertItem } from '../lib/cosmos.js';
import { sendMail } from '../lib/email.js';

app.http('approveTicket', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'approve-ticket',
  handler: async (request) => {
    const ticketId = request.query.get('ticket_id') || '';
    const token = request.query.get('token') || '';
    if (!ticketId || !token) return html('<h1>Enlace invalido</h1>', 400);
    const [ticket] = await query('SELECT * FROM c WHERE c.type = @type AND c.ticketId = @ticketId', [{ name: '@type', value: 'ticket' }, { name: '@ticketId', value: ticketId }]);
    const [approval] = await query('SELECT * FROM c WHERE c.pk = @pk AND c.type = @type AND c.tokenHash = @hash', [{ name: '@pk', value: `ticket:${ticketId}` }, { name: '@type', value: 'approvalToken' }, { name: '@hash', value: hashToken(token) }]);
    if (!ticket || !approval || approval.consumed || new Date(approval.expiresAt) < new Date()) return html('<h1>Enlace expirado o invalido</h1>', 400);
    ticket.status = 'Cerrado';
    ticket.closedAt = new Date().toISOString();
    approval.consumed = true;
    await upsertItem(ticket);
    await upsertItem(approval);
    await upsertItem({ id: `approval-log:${crypto.randomUUID()}`, pk: `ticket:${ticketId}`, type: 'ticketUpdate', ticketId, userEmail: 'Sistema Automático', message: '[Sistema] El cliente aprobo el cierre por enlace seguro.', internal: true });
    await sendMail({ from: process.env.MAIL_SUPPORT_FROM || 'soporte@sij.mx', to: ticket.email, subject: `Ticket cerrado: ${ticketId}`, text: `Confirmamos el cierre del ticket ${ticketId}. Gracias por confiar en SIJ.` });
    return html(`<main style="font-family:system-ui;padding:48px;text-align:center"><h1>Ticket cerrado</h1><p>Se aprobo el cierre de ${ticketId}.</p><form method="post" action="/api/rate-ticket"><input type="hidden" name="ticket_id" value="${ticketId}"/><input type="hidden" name="token" value="${token}"/><p>Calificacion: <select name="score"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></p><p><textarea name="comment" placeholder="Comentario opcional"></textarea></p><button>Enviar calificacion</button></form></main>`);
  }
});

app.http('rateTicket', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'rate-ticket',
  handler: async (request) => {
    const form = await request.formData();
    const ticketId = String(form.get('ticket_id') || '');
    const score = Number(form.get('score') || 0);
    const comment = String(form.get('comment') || '').slice(0, 600);
    const [ticket] = await query('SELECT * FROM c WHERE c.type = @type AND c.ticketId = @ticketId', [{ name: '@type', value: 'ticket' }, { name: '@ticketId', value: ticketId }]);
    if (!ticket || score < 1 || score > 5) return html('<h1>Datos invalidos</h1>', 400);
    ticket.csatScore = score;
    ticket.csatComment = comment;
    await upsertItem(ticket);
    return html('<main style="font-family:system-ui;padding:48px;text-align:center"><h1>Gracias por tu calificacion</h1><p>Tu opinion nos ayuda a mejorar.</p></main>');
  }
});
