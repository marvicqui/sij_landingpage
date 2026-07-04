import { app } from '@azure/functions';
import { canViewTicket, getSession, isEngineer } from '../lib/auth.js';
import { badRequest, forbidden, json, readJson, unauthorized } from '../lib/http.js';
import { randomId } from '../lib/ids.js';
import { query, readItem, upsertItem } from '../lib/cosmos.js';
import { cleanText } from '../lib/security.js';
import { sendMail } from '../lib/email.js';

app.http('ticketUpdates', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'ticket-updates',
  handler: async (request) => {
    const session = await getSession(request);
    if (!session.authenticated) return unauthorized();
    if (!session.allowed) return forbidden();

    const ticketId = request.method === 'GET' ? cleanText(request.query.get('ticket_id'), 80) : cleanText((await readJson(request))?.ticketId, 80);
    if (!ticketId) return badRequest('Missing ticket_id');
    const ticket = await readItem(`ticket:${ticketId}`, 'ticket');
    if (!ticket) return badRequest('Ticket not found');
    if (!canViewTicket(session, ticket)) return forbidden();

    if (request.method === 'GET') {
      const rows = await query('SELECT * FROM c WHERE c.pk = @pk AND c.type = @type ORDER BY c.createdAt ASC', [{ name: '@pk', value: `ticket:${ticketId}` }, { name: '@type', value: 'ticketUpdate' }]);
      return json(isEngineer(session) ? rows : rows.filter((row) => !row.internal));
    }

    const input = await readJson(request);
    const message = cleanText(input?.message, 3000);
    const internal = Boolean(input?.internal) && isEngineer(session);
    if (!message) return badRequest('Missing message');
    const update = await upsertItem({ id: randomId('update'), pk: `ticket:${ticketId}`, type: 'ticketUpdate', ticketId, userEmail: session.user.email, message, internal });
    if (!internal) {
      const recipient = session.user.email === ticket.email ? (ticket.assignedTo || process.env.MAIL_SUPPORT_FROM || 'soporte@sij.mx') : ticket.email;
      await sendMail({ from: process.env.MAIL_SUPPORT_FROM || 'soporte@sij.mx', to: recipient, subject: `Actualizacion en ticket ${ticketId}`, text: `${session.user.email} agrego una actualizacion:\n\n${message}` });
    }
    return json(update, 201);
  }
});
