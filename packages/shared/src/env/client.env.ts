// CLIENT-SAFE ENVIRONMENT

import { z } from 'zod';

const optionalUrl = z.string().url().optional();

export const clientSchema = z.object({
  // --- Core ---
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // --- Supabase (client-safe) ---
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_JWKS_URL: optionalUrl,

  // --- Public service endpoints (for browser / mobile to call) ---
  PUBLIC_API_BASE_URL: optionalUrl,
});

export type ClientEnv = z.infer<typeof clientSchema>;

function format(error: z.ZodError): string {
  return error.errors.map(e => `  • ${e.path.join('.')}: ${e.message}`).join('\n');
}

/**
 * Validate client-safe environment.
 * Call once at the entry of mobile / web-dashboard.
 */
export function loadClientEnv(source: Record<string, string | undefined>): ClientEnv {
  const result = clientSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`❌ Invalid client environment:\n${format(result.error)}`);
  }
  return result.data;
}
