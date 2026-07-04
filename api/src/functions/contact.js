import { app } from '@azure/functions';
import { badRequest, json, readJson } from '../lib/http.js';
import { cleanText } from '../lib/security.js';
import { sendMail } from '../lib/email.js';

app.http('contact', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'contact',
  handler: async (request) => {
    const input = await readJson(request);
    const name = cleanText(input?.name, 160);
    const email = cleanText(input?.email, 180).toLowerCase();
    const message = cleanText(input?.message, 3000);
    if (!name || !email || !message) return badRequest('Missing required fields');
    const from = process.env.MAIL_SUPPORT_FROM || 'soporte@sij.mx';
    const to = process.env.MAIL_LEADS_TO || 'ventas@sij.mx';
    await sendMail({
      from,
      to,
      subject: `Nuevo lead desde landing SIJ: ${name}`,
      text: `Nombre: ${name}\nEmpresa: ${cleanText(input.company, 180) || 'N/A'}\nCorreo: ${email}\nServicio: ${cleanText(input.service, 120) || 'General'}\n\n${message}`
    });
    return json({ success: true });
  }
});
