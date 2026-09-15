import type { AgadaClient } from '../supabase/client.js';
import type { Database } from '../supabase/database.types.js';
import {
  assessTriage,
  type TriageInput,
  type TriageResult,
} from '../triage/index.js';
import { recordVitals } from './vitals.js';

type AssessmentRow = Database['public']['Tables']['triage_assessments']['Row'];
type ResponseRow = Database['public']['Tables']['triage_responses']['Row'];

export type TriageAssessment = AssessmentRow;
export type TriageResponse = ResponseRow;

export interface RunTriageInput {
  encounterId: string;
  triageInput: TriageInput;
}

/**
 * One-shot: save vitals, run engine, persist assessment + symptom responses.
 * Returns the computed result (same shape the UI renders).
 */
export async function runTriageAssessment(
  client: AgadaClient,
  input: RunTriageInput,
): Promise<TriageResult> {
  const { encounterId, triageInput } = input;

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Save vitals
  await recordVitals(client, encounterId, triageInput.vitals);

  // 2. Run engine
  const result = assessTriage(triageInput);

  // 3. Persist assessment
  const reasoningText = result.reasons
    .map((r) => r.detail ?? r.description)
    .join('; ');

  const { data: assessment, error: aErr } = await client
    .from('triage_assessments')
    .insert({
      encounter_id: encounterId,
      risk_level: result.riskLevel,
      care_pathway: result.carePathway,
      reasoning: reasoningText,
      assessed_by: user.id,
    })
    .select()
    .single();

  if (aErr) throw aErr;

  // 4. Persist symptom responses
  const symptomEntries = Object.entries(triageInput.symptoms).filter(
    ([, present]) => present === true,
  );

  if (symptomEntries.length > 0) {
    const { error: rErr } = await client.from('triage_responses').insert(
      symptomEntries.map(([code]) => ({
        assessment_id: assessment.id,
        symptom_code: code,
        present: true,
      })),
    );
    if (rErr) throw rErr;
  }

  return result;
}

export async function listTriageForEncounter(
  client: AgadaClient,
  encounterId: string,
): Promise<TriageAssessment[]> {
  const { data, error } = await client
    .from('triage_assessments')
    .select('*')
    .eq('encounter_id', encounterId)
    .order('assessed_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Re-export triage engine types for convenience
export type {
  RiskLevel,
  CarePathway,
  VitalSigns,
  Symptoms,
  TriageRule,
  TriageResult,
  TriageInput,
} from '../triage/index.js';
