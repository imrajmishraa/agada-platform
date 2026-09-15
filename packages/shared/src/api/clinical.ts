import type { AgadaClient } from '../supabase/client.js';
import type { Database } from '../supabase/database.types.js';

type ClinicalNoteRow = Database['public']['Tables']['clinical_notes']['Row'];
type DiagnosisRow = Database['public']['Tables']['diagnoses']['Row'];

export type ClinicalNote = ClinicalNoteRow;
export type Diagnosis = DiagnosisRow;

export interface CompleteReferralInput {
  referralId: string;
  encounterId: string;
  notes: string;
  diagnosis: string;
}

export async function saveClinicalNote(
  client: AgadaClient,
  input: {
    encounterId: string;
    referralId?: string;
    noteType: string;
    content: string;
  },
): Promise<ClinicalNote> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await client
    .from('clinical_notes')
    .insert({
      encounter_id: input.encounterId,
      referral_id: input.referralId ?? null,
      author_id: user.id,
      note_type: input.noteType,
      content: input.content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveDiagnosis(
  client: AgadaClient,
  input: { encounterId: string; description: string; icd10Code?: string },
): Promise<Diagnosis> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await client
    .from('diagnoses')
    .insert({
      encounter_id: input.encounterId,
      description: input.description,
      icd10_code: input.icd10Code ?? null,
      confirmed_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listClinicalNotesForReferral(
  client: AgadaClient,
  referralId: string,
): Promise<ClinicalNote[]> {
  const { data, error } = await client
    .from('clinical_notes')
    .select('*')
    .eq('referral_id', referralId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listDiagnosesForEncounter(
  client: AgadaClient,
  encounterId: string,
): Promise<Diagnosis[]> {
  const { data, error } = await client
    .from('diagnoses')
    .select('*')
    .eq('encounter_id', encounterId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Atomically complete a referral: save notes, save diagnosis,
 * update status, log event.
 */
export async function completeReferralWithOutcome(
  client: AgadaClient,
  input: CompleteReferralInput,
): Promise<void> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Save consultation note
  await saveClinicalNote(client, {
    encounterId: input.encounterId,
    referralId: input.referralId,
    noteType: 'CONSULTATION',
    content: input.notes,
  });

  // 2. Save diagnosis
  if (input.diagnosis.trim().length > 0) {
    await saveDiagnosis(client, {
      encounterId: input.encounterId,
      description: input.diagnosis.trim(),
    });
  }

  // 3. Get current status for event
  const { data: current } = await client
    .from('referrals')
    .select('status')
    .eq('id', input.referralId)
    .single();

  // 4. Update referral
  const { error: updateErr } = await client
    .from('referrals')
    .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
    .eq('id', input.referralId);

  if (updateErr) throw updateErr;

  // 5. Log event
  await client.from('referral_events').insert({
    referral_id: input.referralId,
    from_status: current?.status ?? null,
    to_status: 'COMPLETED',
    actor_id: user.id,
    comment: 'Consultation completed',
  });
}
