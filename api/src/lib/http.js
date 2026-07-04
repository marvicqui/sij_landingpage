export function json(body, status = 200, headers = {}) {
  return { status, jsonBody: body, headers: { 'Cache-Control': 'no-store', ...headers } };
}

export function html(body, status = 200) {
  return { status, body, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } };
}

export const badRequest = (error) => json({ error }, 400);
export const unauthorized = () => json({ error: 'Authentication required' }, 401);
export const forbidden = () => json({ error: 'Not allowed' }, 403);
export const serverError = () => json({ error: 'Server error' }, 500);

export async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}
