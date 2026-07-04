import { app } from '@azure/functions';
import { badRequest, json } from '../lib/http.js';
import { cleanText } from '../lib/security.js';

const systemPrompt = `Eres el asistente virtual oficial de SIJ, una empresa B2B de infraestructura tecnologica. Responde solo sobre redes, cloud, telecomunicaciones, virtualizacion, ciberseguridad y servicios SIJ. Si piden precios, solicita que contacten a ventas@sij.mx o soporte@sij.mx. Usa respuestas breves y profesionales.`;

app.http('chat', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'chat',
  handler: async (request) => {
    const input = await request.json().catch(() => null);
    const message = cleanText(input?.message, 700);
    if (!message) return badRequest('Message is required');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return json({ reply: 'El asistente aun no esta configurado. Escribenos a soporte@sij.mx.' }, 503);
    const history = Array.isArray(input.history) ? input.history.slice(-6).map((item) => ({ role: item.role === 'user' ? 'user' : 'assistant', content: cleanText(item.content, 700) })) : [];
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.4, max_tokens: 300, messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: message }] })
    });
    if (!response.ok) return json({ reply: 'No pude responder en este momento. Escribenos a soporte@sij.mx.' }, 502);
    const data = await response.json();
    return json({ reply: data.choices?.[0]?.message?.content || 'No pude generar una respuesta.' });
  }
});
