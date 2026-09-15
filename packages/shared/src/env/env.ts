// AGADA ENVIRONMENT — MAIN ENTRY
//
//   import { loadClientEnv } from '@agada/shared/env';
//   import { loadServerEnv } from '@agada/shared/env';
//
// Use loadClientEnv in browser / mobile entry points.
// Use loadServerEnv in backend service entry points.
// ============================================================================

export { clientSchema, loadClientEnv, type ClientEnv } from './client.env.js';

export { serverSchema, loadServerEnv, type ServerEnv } from './server.env.js';
