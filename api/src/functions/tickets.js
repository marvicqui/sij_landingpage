import { app } from '@azure/functions';
import { canViewTicket, getSession, isEngineer } from '../lib/auth.js';
import { badRequest, forbidden, json, readJson, unauthorized } from '../lib/http.js';
import { hashToken, makeTicketId, newApprovalToken, normalizeEmail, randomId } from '../lib/ids.js';
import { query, readItem, upsertItem } from '../lib/cosmos.js';
import { cleanText, safeSeverity, safeStatus } from '../lib/security.js';
import { sendMail } from '../lib/email.js';

async function addAudit(ticketId, message) {
  await upsertItem({ id: randomId('update'), pk: `ticket:${ticketId}`, type: 'ticketUpdate', ticketId, userEmail: 'Sistema Automático', message, internal: true });
}

async function createApproval(ticket) {
  const token = newApprovalToken();
  await upsertItem({ id: randomId('approval'), pk: `ticket:${ticket.ticketId}`, type: 'approvalToken', ticketId: ticket.ticketId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), consumed: false });
  return token;
}

app.http('tickets', {
  methods: ['GET', 'POST', 'PATCH'],
  authLevel: 'anonymous',
  route: 'tickets',
  handler: async (request) => {
    const session = await getSession(request);
    if (!session.authenticated) return unauthorized();
    if (!session.allowed) return forbidden();

    if (request.method === 'GET') {
      const rows = isEngineer(session)
        ? await query('SELECT * FROM c WHERE c.type = @type ORDER BY c.createdAt DESC', [{ name: '@type', value: 'ticket' }])
        : await query('SELECT * FROM c WHERE c.type = @type AND c.normalizedEmail = @email ORDER BY c.createdAt DESC', [{ name: '@type', value: 'ticket' }, { name: '@email', value: session.user.email }]);
      return json(rows);
    }

    const input = await readJson(request);
    if (!input) return badRequest('Invalid JSON');

    if (request.method === 'POST') {
      const email = isEngineer(session) ? normalizeEmail(input.email) : session.user.email;
      const issue = cleanText(input.issue, 3000);
      if (!email || !issue) return badRequest('Missing ticket data');
      const ticketId = makeTicketId();
      const ticket = {
        id: `ticket:${ticketId}`,
        pk: 'ticket',
        type: 'ticket',
        ticketId,
        name: cleanText(input.name, 160),
        company: cleanText(input.company, 160),
        email,
        normalizedEmail: normalizeEmail(email),
        issue,
        severity: safeSeverity(input.severity),
        serviceName: cleanText(input.serviceName, 160),
        status: 'Abierto',
        assignedTo: '',
        parentTicketId: ''
      };
      await upsertItem(ticket);
      await addAudit(ticketId, `[${session.user.email}] creo el ticket.`);
      await sendMail({ from: process.env.MAIL_SUPPORT_FROM || 'soporte@sij.mx', to: [email, process.env.MAIL_SUPPORT_FROM || 'soporte@sij.mx'], subject: `Nuevo ticket SIJ: ${ticketId}`, text: `Ticket ${ticketId}\nCliente: ${email}\nSeveridad: ${ticket.severity}\n\n${issue}` });
      return json(ticket, 201);
    }

    if (request.method === 'PATCH') {
      const ticketId = cleanText(input.ticketId, 80);
      const ticket = await readItem(`ticket:${ticketId}`, 'ticket');
      if (!ticket) return badRequest('Ticket not found');
      if (!canViewTicket(session, ticket)) return forbidden();
      const engineer = isEngineer(session);

      if (engineer) {
        if (input.status) {
          const status = safeStatus(input.status);
          if (status) ticket.status = status;
          if (status === 'Cerrado') ticket.closedAt = new Date().toISOString();
          if (status === 'Pendiente de Aprobación') {
            const token = await createApproval(ticket);
            const link = `${new URL(request.url).origin}/api/approve-ticket?ticket_id=${encodeURIComponent(ticket.ticketId)}&token=${encodeURIComponent(token)}`;
            await sendMail({ from: process.env.MAIL_SUPPORT_FROM || 'soporte@sij.mx', to: ticket.email, subject: `Aprobacion de cierre - ${ticket.ticketId}`, html: `<p>El ticket ${ticket.ticketId} fue marcado como resuelto.</p><p><a href="${link}">Aprobar cierre</a></p>` });
          }
        }
        if (input.severity) ticket.severity = safeSeverity(input.severity);
        if ('assignedTo' in input) ticket.assignedTo = normalizeEmail(input.assignedTo);
        if ('serviceName' in input) ticket.serviceName = cleanText(input.serviceName, 160);
        if ('parentTicketId' in input) ticket.parentTicketId = cleanText(input.parentTicketId, 80);
        await addAudit(ticket.ticketId, `[${session.user.email}] actualizo el ticket.`);
      } else {
        if (input.clientApproved && String(ticket.status).startsWith('Pendiente')) {
          ticket.status = 'Cerrado';
          ticket.closedAt = new Date().toISOString();
          await addAudit(ticket.ticketId, '[Sistema] El cliente aprobo el cierre desde el portal.');
        } else if (input.csatScore) {
          ticket.csatScore = Number(input.csatScore);
          ticket.csatComment = cleanText(input.csatComment, 600);
          await addAudit(ticket.ticketId, `[Sistema] El cliente califico el servicio con ${ticket.csatScore} estrellas.`);
        } else return forbidden();
      }

      const saved = await upsertItem(ticket);
      return json(saved);
    }
  }
});
