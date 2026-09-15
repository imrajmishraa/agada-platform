export {
  createBrowserClient,
  getBrowserClient,
  type AgadaClient,
  type ClientConfig,
} from './client.js';

export {
  createServiceClient,
  createUserScopedClient,
  type AgadaServiceClient,
  type ServerConfig,
} from './server.js';

export type { Database } from './database.types.js';
