// Browser / mobile Supabase client.
// Safe to use in the browser and in Expo apps.
// Uses the publishable key — NEVER the secret key.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

export type AgadaClient = SupabaseClient<Database>;

let browserClient: AgadaClient | undefined;

export interface ClientConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

/**
 * Returns a singleton Supabase client for browser/mobile.
 * Safe to call multiple times — returns the same instance.
 */
export function createBrowserClient(config: ClientConfig): AgadaClient {
  if (browserClient) return browserClient;

  browserClient = createClient<Database>(config.supabaseUrl, config.supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'agada.auth',
    },
  });

  return browserClient;
}

export function getBrowserClient(): AgadaClient {
  if (!browserClient) {
    throw new Error(
      'Supabase browser client not initialized. ' +
        'Call createBrowserClient() at your app entry point first.'
    );
  }
  return browserClient;
}
