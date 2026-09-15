import type { AgadaClient } from '../supabase/client.js';
import type { QueuedOperation, FlushOptions, SyncResult } from './types.js';
import type { SyncQueue } from './queue.js';

export async function flushQueue(
  client: AgadaClient,
  queue: SyncQueue,
  options: FlushOptions = {},
): Promise<SyncResult> {
  const maxAttempts = options.maxAttempts ?? 3;
  const pending = await queue.pending();

  let synced = 0;
  let failed = 0;
  const errors: Array<{ id: string; message: string }> = [];

  for (const op of pending) {
    if (op.attempts >= maxAttempts) {
      failed += 1;
      errors.push({ id: op.id, message: op.lastError ?? 'max attempts reached' });
      continue;
    }

    try {
      await queue.markSyncing(op.id);
      const result = await applyOperation(client, op);
      await queue.markSynced(op.id, (result as { id?: string } | null)?.id ?? '');
      synced += 1;
      options.onProgress?.({ ...op, status: 'SYNCED' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await queue.markFailed(op.id, message);
      failed += 1;
      errors.push({ id: op.id, message });
      options.onProgress?.({ ...op, status: 'FAILED' });
    }
  }

  const remaining = await queue.pendingCount();
  return { synced, failed, pending: remaining, errors };
}

// -----------------------------------------------------------------------------
// Operation dispatch
// -----------------------------------------------------------------------------

async function applyOperation(
  client: AgadaClient,
  op: QueuedOperation,
): Promise<{ id?: string } | null> {
  // Special-case: batched triage insert
  if (op.entity === 'triage_assessments' && op.payload.__batch === true) {
    return applyTriageBatch(client, op.payload);
  }

  const table = client.from(op.entity as never) as unknown as {
    insert: (payload: unknown) => {
      select: () => { single: () => Promise<{ data: { id?: string } | null; error: unknown }> };
    };
    update: (payload: unknown) => {
      eq: (col: string, val: unknown) => {
        select: () => { single: () => Promise<{ data: { id?: string } | null; error: unknown }> };
      };
    };
    delete: () => {
      eq: (col: string, val: unknown) => Promise<{ error: unknown }>;
    };
  };

  switch (op.operation) {
    case 'INSERT': {
      const { data, error } = await table.insert(op.payload).select().single();
      if (error) throw error;
      return data;
    }
    case 'UPDATE': {
      const { id, ...patch } = op.payload as { id: string };
      const { data, error } = await table.update(patch).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    case 'DELETE': {
      const { id } = op.payload as { id: string };
      const { error } = await table.delete().eq('id', id);
      if (error) throw error;
      return null;
    }
  }
}

// -----------------------------------------------------------------------------
// Batched triage insert — resolves foreign keys after each insert
// -----------------------------------------------------------------------------

interface TriageBatchPayload {
  __batch: true;
  encounterId: string;
  assessedBy: string;
  riskLevel: string;
  carePathway: string;
  reasoning: string;
  vitals: Record<string, unknown>;
  symptoms: Record<string, boolean>;
}

async function applyTriageBatch(
  client: AgadaClient,
  payload: Record<string, unknown>,
): Promise<{ id?: string } | null> {
  const p = payload as unknown as TriageBatchPayload;

  // 1. vitals
  const { error: vErr } = await client
    .from('patient_vitals')
    .insert({ encounter_id: p.encounterId, ...p.vitals });
  if (vErr) throw vErr;

  // 2. assessment
  const { data: assessment, error: aErr } = await client
    .from('triage_assessments')
    .insert({
      encounter_id: p.encounterId,
      risk_level: p.riskLevel as never,
      care_pathway: p.carePathway,
      reasoning: p.reasoning,
      assessed_by: p.assessedBy,
    })
    .select()
    .single();
  if (aErr) throw aErr;

  // 3. responses
  const presentSymptoms = Object.entries(p.symptoms).filter(([, v]) => v === true);
  if (presentSymptoms.length > 0) {
    const { error: rErr } = await client.from('triage_responses').insert(
      presentSymptoms.map(([code]) => ({
        assessment_id: assessment.id,
        symptom_code: code,
        present: true,
      })),
    );
    if (rErr) throw rErr;
  }

  return assessment;
}
