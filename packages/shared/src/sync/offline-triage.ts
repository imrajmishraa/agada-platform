import { assessTriage } from '../triage/index.js';
import type { TriageInput, TriageResult } from '../triage/index.js';
import type { SyncQueue } from './queue.js';

export interface OfflineTriageInput {
  encounterId: string;
  patientId: string;
  assessedBy: string;
  triageInput: TriageInput;
}

/**
 * Compute triage locally, queue the batched write.
 * Returns the same TriageResult shape the online path returns.
 */
export async function recordTriageOffline(
  queue: SyncQueue,
  input: OfflineTriageInput,
): Promise<TriageResult> {
  const result = assessTriage(input.triageInput);

  const reasoning = result.reasons
    .map((r) => r.detail ?? r.description)
    .join('; ');

  await queue.enqueue('triage_assessments', 'INSERT', {
    __batch: true,
    encounterId: input.encounterId,
    assessedBy: input.assessedBy,
    riskLevel: result.riskLevel,
    carePathway: result.carePathway,
    reasoning,
    vitals: {
      temperature_c: input.triageInput.vitals.temperatureC ?? null,
      heart_rate: input.triageInput.vitals.heartRate ?? null,
      bp_systolic: input.triageInput.vitals.bpSystolic ?? null,
      bp_diastolic: input.triageInput.vitals.bpDiastolic ?? null,
      spo2: input.triageInput.vitals.spo2 ?? null,
      respiratory_rate: input.triageInput.vitals.respiratoryRate ?? null,
    },
    symptoms: input.triageInput.symptoms,
  });

  return result;
}
