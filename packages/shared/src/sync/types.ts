export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export type SyncEntity =
  | 'patients'
  | 'encounters'
  | 'patient_vitals'
  | 'triage_assessments'
  | 'triage_responses'
  | 'referrals'
  | 'referral_events'
  | 'clinical_notes'
  | 'diagnoses';

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface QueuedOperation {
  id: string;
  entity: SyncEntity;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  status: SyncStatus;
  attempts: number;
  lastError?: string;
  createdAt: string;
  syncedAt?: string;
  serverId?: string;
}

export interface SyncAdapter {
  all(): Promise<QueuedOperation[]>;
  put(op: QueuedOperation): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

export interface SyncResult {
  synced: number;
  failed: number;
  pending: number;
  errors: Array<{ id: string; message: string }>;
}

export interface FlushOptions {
  maxAttempts?: number;
  onProgress?: (op: QueuedOperation) => void;
}
