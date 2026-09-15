import { loadClientEnv } from '@agada/shared/env';

const raw = {
  NODE_ENV: import.meta.env.MODE,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  PUBLIC_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
};

export const env = loadClientEnv(raw);
