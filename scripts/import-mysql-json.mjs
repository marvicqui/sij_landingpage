import { CosmosClient } from '@azure/cosmos';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const [folder = 'export'] = process.argv.slice(2);
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE || 'sij-helpdesk';
const containerId = process.env.COSMOS_CONTAINER || 'helpdesk';

if (!endpoint || !key) throw new Error('Set COSMOS_ENDPOINT and COSMOS_KEY before importing.');

const container = new CosmosClient({ endpoint, key }).database(databaseId).container(containerId);
const read = async (name) => JSON.parse(await fs.readFile(`${folder}/${name}.json`, 'utf8').catch(() => '[]'));
const norm = (value) => String(value || '').trim().toLowerCase();
const id = (prefix) => `${prefix}:${crypto.randomUUID()}`;

async function upsert(item) {
  await container.items.upsert({ createdAt: new Date().toISOString(), ...item, updatedAt: new Date().toISOString() });
}

for (const row of await read('tickets')) {
  await upsert({ id: `ticket:${row.ticket_id}`, pk: 'ticket', type: 'ticket', ticketId: row.ticket_id, name: row.name, company: row.company, email: norm(row.email), normalizedEmail: norm(row.email), issue: row.issue, severity: row.severity, serviceName: row.service_name, status: row.status, assignedTo: norm(row.assigned_to), parentTicketId: row.parent_ticket_id || '', csatScore: row.csat_score, csatComment: row.csat_comment, createdAt: row.created_at, closedAt: row.closed_at });
}
for (const row of await read('ticket_updates')) {
  await upsert({ id: id('update'), pk: `ticket:${row.ticket_id}`, type: 'ticketUpdate', ticketId: row.ticket_id, userEmail: norm(row.user_email), message: row.message, attachmentUrl: row.attachment_url || '', internal: Number(row.is_internal) === 1, createdAt: row.created_at });
}
for (const row of await read('services_list')) await upsert({ id: id('service'), pk: 'config', type: 'service', name: row.service_name });
for (const row of await read('engineers_list')) await upsert({ id: id('engineer'), pk: 'config', type: 'engineer', email: norm(row.email) });
for (const row of await read('allowed_clients')) await upsert({ id: id('allowedClient'), pk: 'config', type: 'allowedClient', value: norm(row.value).replace(/^@/, '') });
for (const row of await read('kb_articles')) await upsert({ id: id('kb'), pk: 'config', type: 'kb', title: row.title, content: row.content, category: row.category, author: row.author, createdAt: row.created_at });
for (const row of await read('macros_list')) await upsert({ id: id('macro'), pk: 'config', type: 'macro', title: row.title, content: row.content });

console.log('Import completed.');
