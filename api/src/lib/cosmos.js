import { CosmosClient } from '@azure/cosmos';

let cachedContainer;

export function getContainer() {
  if (cachedContainer) return cachedContainer;
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  const database = process.env.COSMOS_DATABASE || 'sij-helpdesk';
  const container = process.env.COSMOS_CONTAINER || 'helpdesk';
  if (!endpoint || !key) throw new Error('Cosmos DB settings are missing');
  const client = new CosmosClient({ endpoint, key });
  cachedContainer = client.database(database).container(container);
  return cachedContainer;
}

export async function query(queryText, parameters = []) {
  const { resources } = await getContainer().items.query({ query: queryText, parameters }).fetchAll();
  return resources;
}

export async function readItem(id, pk) {
  try {
    const { resource } = await getContainer().item(id, pk).read();
    return resource || null;
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

export async function upsertItem(item) {
  const now = new Date().toISOString();
  const resource = { ...item, updatedAt: now };
  if (!resource.createdAt) resource.createdAt = now;
  const { resource: saved } = await getContainer().items.upsert(resource);
  return saved;
}

export async function deleteItem(id, pk) {
  await getContainer().item(id, pk).delete();
}
