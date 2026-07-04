import { app } from '@azure/functions';
import { json } from '../lib/http.js';
import { query } from '../lib/cosmos.js';

const defaults = [
  { id: 'service:redes', name: 'Redes y Conectividad' },
  { id: 'service:cloud', name: 'Arquitectura Cloud' },
  { id: 'service:infra', name: 'Infraestructura TI' },
  { id: 'service:telecom', name: 'Telecomunicaciones' }
];

app.http('services', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'services',
  handler: async () => {
    try {
      const rows = await query('SELECT * FROM c WHERE c.type = @type ORDER BY c.name', [{ name: '@type', value: 'service' }]);
      return json(rows.length ? rows : defaults);
    } catch {
      return json(defaults);
    }
  }
});
