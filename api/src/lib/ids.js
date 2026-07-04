import crypto from 'node:crypto';

export function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

export function emailDomain(email = '') {
  const normalized = normalizeEmail(email);
  return normalized.includes('@') ? normalized.split('@').pop() : '';
}

export function makeTicketId() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `TKT-${stamp}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export function randomId(prefix) {
  return `${prefix}:${crypto.randomUUID()}`;
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function newApprovalToken() {
  return crypto.randomBytes(32).toString('base64url');
}
