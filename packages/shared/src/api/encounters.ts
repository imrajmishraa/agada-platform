import type { AgadaClient } from '../supabase/client.js';
import type { Database } from '../supabase/database.types.js';

type EncounterRow = Database['public']['Tables']['encounters']['Row'];
type EncounterInsert = Database['public']['Tables']['encounters']['Insert'];

export type Encounter = EncounterRow;

export type EncounterType = 'HOME_VISIT' | 'PHC' | 'TELECONSULT' | 'FOLLOWUP';

export interface CreateEncounterInput {
  patientId: string;
  encounterType: EncounterType;
  facilityId?: string;
  notes?: string;
}

export async function listEncountersForPatient(
  client: AgadaClient,
  patientId: string,
): Promise<Encounter[]> {
  const { data, error } = await client
    .from('encounters')
    .select('*')
    .eq('patient_id', patientId)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getEncounter(
  client: AgadaClient,
  id: string,
): Promise<Encounter | null> {
  const { data, error } = await client
    .from('encounters')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createEncounter(
  client: AgadaClient,
  input: CreateEncounterInput,
): Promise<Encounter> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Resolve health_worker.id from profile
  const { data: hw } = await client
    .from('health_workers')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  const insert: EncounterInsert = {
    patient_id: input.patientId,
    health_worker_id: hw?.id ?? null,
    facility_id: input.facilityId ?? null,
    encounter_type: input.encounterType,
    status: 'OPEN',
    notes: input.notes ?? null,
  };

  const { data, error } = await client
    .from('encounters')
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function closeEncounter(
  client: AgadaClient,
  id: string,
  notes?: string,
): Promise<Encounter> {
  const { data, error } = await client
    .from('encounters')
    .update({
      status: 'CLOSED',
      closed_at: new Date().toISOString(),
      ...(notes !== undefined ? { notes } : {}),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
