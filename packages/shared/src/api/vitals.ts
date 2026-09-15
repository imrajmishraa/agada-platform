import type { AgadaClient } from '../supabase/client.js';
import type { Database } from '../supabase/database.types.js';
import type { VitalSigns } from '../triage/types.js';

type VitalRow = Database['public']['Tables']['patient_vitals']['Row'];

export type Vitals = VitalRow;

export async function recordVitals(
  client: AgadaClient,
  encounterId: string,
  v: VitalSigns,
): Promise<Vitals> {
  const { data, error } = await client
    .from('patient_vitals')
    .insert({
      encounter_id: encounterId,
      temperature_c: v.temperatureC ?? null,
      heart_rate: v.heartRate ?? null,
      bp_systolic: v.bpSystolic ?? null,
      bp_diastolic: v.bpDiastolic ?? null,
      spo2: v.spo2 ?? null,
      respiratory_rate: v.respiratoryRate ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listVitalsForEncounter(
  client: AgadaClient,
  encounterId: string,
): Promise<Vitals[]> {
  const { data, error } = await client
    .from('patient_vitals')
    .select('*')
    .eq('encounter_id', encounterId)
    .order('recorded_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
