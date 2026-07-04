import { app } from '@azure/functions';
import { getSession } from '../lib/auth.js';
import { json } from '../lib/http.js';

app.http('me', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'me',
  handler: async (request) => json(await getSession(request))
});
