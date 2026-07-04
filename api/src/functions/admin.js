import { app } from '@azure/functions';
import { getSession, isAdmin, isEngineer } from '../lib/auth.js';
import { badRequest, forbidden, json, readJson, unauthorized } from '../lib/http.js';
import { deleteItem, query, upsertItem } from '../lib/cosmos.js';
import { normalizeEmail, randomId } from '../lib/ids.js';
import { cleanText } from '../lib/security.js';

const allowedTypes = new Set(['service', 'engineer', 'allowedClient', 'kb', 'macro']);

function normalizeConfig(type, input) {
  const id = input.id || randomId(type);
  if (type === 'service') return { id, pk: 'config', type, name: cleanText(input.name || input.value, 160) };
  if (type === 'engineer') return { id, pk: 'config', type, email: normalizeEmail(input.email || input.value) };
  if (type === 'allowedClient') return { id, pk: 'config', type, value: cleanText(input.value || input.email || input.name, 180).toLowerCase().replace(/^@/, '') };
  if (type === 'macro') return { id, pk: 'config', type, title: cleanText(input.title || input.value, 160), content: cleanText(input.content || input.value, 3000) };
  return { id, pk: 'config', type, title: cleanText(input.title || input.value, 160), content: cleanText(input.content || input.value, 5000), category: cleanText(input.category || 'General', 80) };
}

app.http('adminConfig', {
  methods: ['GET', 'POST', 'DELETE'],
  authLevel: 'anonymous',
  route: 'admin/config/{type}',
  handler: async (request) => {
    const session = await getSession(request);
    if (!session.authenticated) return unauthorized();
    if (!session.allowed || !isEngineer(session)) return forbidden();
    const type = request.params.type;
    if (!allowedTypes.has(type)) return badRequest('Invalid config type');
    if ((request.method === 'POST' || request.method === 'DELETE') && !isAdmin(session)) return forbidden();

    if (request.method === 'GET') {
      const rows = await query('SELECT * FROM c WHERE c.pk = @pk AND c.type = @type ORDER BY c.updatedAt DESC', [{ name: '@pk', value: 'config' }, { name: '@type', value: type }]);
      return json(rows);
    }

    const input = await readJson(request);
    if (request.method === 'POST') return json(await upsertItem(normalizeConfig(type, input || {})), 201);
    if (!input?.id) return badRequest('Missing id');
    await deleteItem(input.id, 'config');
    return json({ success: true });
  }
});
