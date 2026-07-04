let graphToken;
let graphTokenExpiresAt = 0;

async function getGraphToken() {
  const tenantId = process.env.GRAPH_TENANT_ID;
  const clientId = process.env.GRAPH_CLIENT_ID;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) return null;
  if (graphToken && Date.now() < graphTokenExpiresAt) return graphToken;
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' });
  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, { method: 'POST', body });
  if (!response.ok) return null;
  const data = await response.json();
  graphToken = data.access_token;
  graphTokenExpiresAt = Date.now() + Math.max(60, data.expires_in - 120) * 1000;
  return graphToken;
}

export async function sendMail({ from, to, subject, text, html }) {
  const token = await getGraphToken();
  if (!token) return false;
  const recipients = Array.isArray(to) ? to : [to];
  const body = {
    message: {
      subject,
      body: { contentType: html ? 'HTML' : 'Text', content: html || text || '' },
      toRecipients: recipients.filter(Boolean).map((address) => ({ emailAddress: { address } }))
    },
    saveToSentItems: false
  };
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response.ok;
}
