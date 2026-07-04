async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    }
  });
  const type = response.headers.get('content-type') || '';
  const body = type.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof body === 'string' ? body : body.error || 'Request failed';
    throw new Error(message);
  }
  return body;
}

export const getSession = () => request('/api/me');
export const listServices = () => request('/api/services');
export const listTickets = () => request('/api/tickets');
export const createTicket = (payload) => request('/api/tickets', { method: 'POST', body: JSON.stringify(payload) });
export const updateTicket = (payload) => request('/api/tickets', { method: 'PATCH', body: JSON.stringify(payload) });
export const listTicketUpdates = (ticketId) => request(`/api/ticket-updates?ticket_id=${encodeURIComponent(ticketId)}`);
export const createTicketUpdate = (payload) => request('/api/ticket-updates', { method: 'POST', body: JSON.stringify(payload) });
export const sendContact = (payload) => request('/api/contact', { method: 'POST', body: JSON.stringify(payload) });
export const sendChat = (payload) => request('/api/chat', { method: 'POST', body: JSON.stringify(payload) });
export const adminConfig = (type) => request(`/api/admin/config/${type}`);
export const addConfig = (type, payload) => request(`/api/admin/config/${type}`, { method: 'POST', body: JSON.stringify(payload) });
export const deleteConfig = (type, id) => request(`/api/admin/config/${type}`, { method: 'DELETE', body: JSON.stringify({ id }) });
