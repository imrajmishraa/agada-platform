// SERVER-ONLY ENVIRONMENT

import { z } from 'zod';
import { clientSchema, type ClientEnv } from './client.env.js';

const optionalString = z.string().min(1).optional();
const optionalUrl = z.string().url().optional();


// Local dev databases (optional — prototype uses Supabase)

const localDatabasesSchema = z.object({
  MONGO_URI: optionalString,
  POSTGRES_URI: optionalString,
  REDIS_URL: optionalString,
});


// Supabase secrets

const supabaseServerSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_DB_URL: optionalUrl,
});


// JWT (optional for prototype)

const jwtSchema = z.object({
  JWT_SECRET: optionalString,
  JWT_EXPIRY: optionalString,
  REFRESH_TOKEN_SECRET: optionalString,
  REFRESH_TOKEN_EXPIRY: optionalString,
});


// External integrations (all optional in prototype — placeholders)

const integrationsSchema = z.object({
  // ABDM
  ABDM_SANDBOX_URL: optionalUrl,
  ABDM_CLIENT_ID: optionalString,
  ABDM_CLIENT_SECRET: optionalString,
  ABDM_FHIR_URL: optionalUrl,

  // eSanjeevani
  ESANJEEVANI_API_URL: optionalUrl,
  ESANJEEVANI_API_KEY: optionalString,

  // RCH
  RCH_API_URL: optionalUrl,
  RCH_API_KEY: optionalString,

  // HMIS
  HMIS_API_URL: optionalUrl,
  HMIS_API_KEY: optionalString,

  // SMS
  SMS_GATEWAY_URL: optionalUrl,
  SMS_GATEWAY_API_KEY: optionalString,
  SMS_SENDER_ID: optionalString,

  // AWS
  AWS_ACCESS_KEY_ID: optionalString,
  AWS_SECRET_ACCESS_KEY: optionalString,
  AWS_REGION: optionalString,
  S3_BUCKET: optionalString,
});


// HTTP / CORS

const httpSchema = z.object({
  PORT: z.coerce.number().int().positive().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});


// Internal service mesh — all optional during prototype

const serviceUrlsSchema = z.object({
  AUTH_SERVICE_URL: optionalUrl,
  PATIENT_SERVICE_URL: optionalUrl,
  TRIAGE_SERVICE_URL: optionalUrl,
  REFERRAL_SERVICE_URL: optionalUrl,
  TELEMED_SERVICE_URL: optionalUrl,
  MEDICINE_SERVICE_URL: optionalUrl,
  DIAGNOSTIC_SERVICE_URL: optionalUrl,
  QUEUE_SERVICE_URL: optionalUrl,
  NOTIFICATION_SERVICE_URL: optionalUrl,
  ANALYTICS_SERVICE_URL: optionalUrl,
  CARE_GRAPH_SERVICE_URL: optionalUrl,
  SYNC_SERVICE_URL: optionalUrl,
  INTEGRATION_GATEWAY_URL: optionalUrl,

  AUTH_SERVICE_PORT: z.coerce.number().int().optional(),
  PATIENT_SERVICE_PORT: z.coerce.number().int().optional(),
  TRIAGE_SERVICE_PORT: z.coerce.number().int().optional(),
  REFERRAL_SERVICE_PORT: z.coerce.number().int().optional(),
  TELEMED_SERVICE_PORT: z.coerce.number().int().optional(),
  MEDICINE_SERVICE_PORT: z.coerce.number().int().optional(),
  DIAGNOSTIC_SERVICE_PORT: z.coerce.number().int().optional(),
  QUEUE_SERVICE_PORT: z.coerce.number().int().optional(),
  NOTIFICATION_SERVICE_PORT: z.coerce.number().int().optional(),
  ANALYTICS_SERVICE_PORT: z.coerce.number().int().optional(),
  CARE_GRAPH_SERVICE_PORT: z.coerce.number().int().optional(),
  SYNC_SERVICE_PORT: z.coerce.number().int().optional(),
  INTEGRATION_GATEWAY_PORT: z.coerce.number().int().optional(),
});


// Compose the full server schema

export const serverSchema = clientSchema
  .merge(supabaseServerSchema)
  .merge(localDatabasesSchema)
  .merge(jwtSchema)
  .merge(integrationsSchema)
  .merge(httpSchema)
  .merge(serviceUrlsSchema);

export type ServerEnv = z.infer<typeof serverSchema> & ClientEnv;

function format(error: z.ZodError): string {
  return error.errors.map(e => `  • ${e.path.join('.')}: ${e.message}`).join('\n');
}

/**
 * Validate full server environment.
 * Call once at the entry point of each backend service.
 */
export function loadServerEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  const result = serverSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`❌ Invalid server environment:\n${format(result.error)}`);
  }
  return result.data;
}
