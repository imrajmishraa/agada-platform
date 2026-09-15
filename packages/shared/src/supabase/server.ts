// Server-side Supabase client.
// Uses the service role key — NEVER expose this to the browser.
// Only import this in backend services or Next.js server components.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

export type AgadaServiceClient = SupabaseClient<Database>;

let serviceClient: AgadaServiceClient | undefined;

export interface ServerConfig {
  supabaseUrl: string;
  serviceKey: string;
}

/**
 * Returns a singleton service-role client.
 * Bypasses RLS — use only for trusted backend operations.
 */
export function createServiceClient(config: ServerConfig): AgadaServiceClient {
  if (serviceClient) return serviceClient;

  serviceClient = createClient<Database>(config.supabaseUrl, config.serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceClient;
}

/**
 * Create a client scoped to a user's JWT.
 * RLS applies as that user — use for user-context operations.
 */
export function createUserScopedClient(
  config: ServerConfig,
  accessToken: string
): AgadaServiceClient {
  return createClient<Database>(config.supabaseUrl, config.serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}
