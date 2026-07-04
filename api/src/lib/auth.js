import { emailDomain, normalizeEmail } from './ids.js';
import { query } from './cosmos.js';

function csv(name) {
  return (process.env[name] || '').split(',').map((value) => normalizeEmail(value)).filter(Boolean);
}

function decodePrincipal(request) {
  const encoded = request.headers.get('x-ms-client-principal');
  if (!encoded) return null;
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function principalEmail(principal) {
  const claims = principal?.claims || [];
  const claim = claims.find((item) => ['emails', 'email', 'preferred_username', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'].includes(item.typ));
  return normalizeEmail(claim?.val || principal?.userDetails || '');
}

async function isConfiguredEngineer(email) {
  try {
    const rows = await query('SELECT VALUE c FROM c WHERE c.type = @type AND c.email = @email', [
      { name: '@type', value: 'engineer' },
      { name: '@email', value: email }
    ]);
    return rows.length > 0;
  } catch {
    return false;
  }
}

async function isAllowedClient(email) {
  const domain = emailDomain(email);
  const envDomains = csv('ALLOWED_CLIENT_DOMAINS');
  if (envDomains.includes(domain)) return true;
  try {
    const rows = await query('SELECT VALUE c FROM c WHERE c.type = @type AND (c.value = @email OR c.value = @domain)', [
      { name: '@type', value: 'allowedClient' },
      { name: '@email', value: email },
      { name: '@domain', value: domain }
    ]);
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function getSession(request) {
  const principal = decodePrincipal(request);
  if (!principal) return { authenticated: false, allowed: false, role: 'anonymous', user: null };
  const email = principalEmail(principal);
  const adminEmails = csv('ADMIN_EMAILS');
  const engineerEmails = csv('ENGINEER_EMAILS');
  let role = 'client';
  if (adminEmails.includes(email)) role = 'admin';
  else if (engineerEmails.includes(email) || await isConfiguredEngineer(email)) role = 'engineer';
  else if (!(await isAllowedClient(email))) return { authenticated: true, allowed: false, role: 'none', user: { email } };
  return { authenticated: true, allowed: true, role, user: { email, provider: principal.identityProvider, name: principal.userDetails } };
}

export function isEngineer(session) {
  return session.role === 'engineer' || session.role === 'admin';
}

export function isAdmin(session) {
  return session.role === 'admin';
}

export function canViewTicket(session, ticket) {
  return isEngineer(session) || normalizeEmail(ticket.email) === session.user?.email;
}
