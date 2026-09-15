import type {
  QueuedOperation,
  SyncAdapter,
  SyncEntity,
  SyncOperation,
} from './types.js';

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `op_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export class SyncQueue {
  constructor(private readonly adapter: SyncAdapter) {}

  async enqueue(
    entity: SyncEntity,
    operation: SyncOperation,
    payload: Record<string, unknown>,
  ): Promise<QueuedOperation> {
    const op: QueuedOperation = {
      id: newId(),
      entity,
      operation,
      payload,
      status: 'PENDING',
      attempts: 0,
      createdAt: new Date().toISOString(),
    };
    await this.adapter.put(op);
    return op;
  }

  async list(): Promise<QueuedOperation[]> {
    const all = await this.adapter.all();
    return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async pending(): Promise<QueuedOperation[]> {
    return (await this.list()).filter(
      (o) => o.status === 'PENDING' || o.status === 'FAILED',
    );
  }

  async pendingCount(): Promise<number> {
    return (await this.pending()).length;
  }

  async markSyncing(id: string): Promise<void> {
    const op = await this.get(id);
    if (!op) return;
    await this.adapter.put({ ...op, status: 'SYNCING', attempts: op.attempts + 1 });
  }

  async markSynced(id: string, serverId: string): Promise<void> {
    const op = await this.get(id);
    if (!op) return;
    await this.adapter.put({
      ...op,
      status: 'SYNCED',
      serverId,
      syncedAt: new Date().toISOString(),
      lastError: undefined,
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    const op = await this.get(id);
    if (!op) return;
    await this.adapter.put({ ...op, status: 'FAILED', lastError: error });
  }

  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  async clearSynced(): Promise<void> {
    const all = await this.adapter.all();
    for (const op of all) {
      if (op.status === 'SYNCED') await this.adapter.delete(op.id);
    }
  }

  private async get(id: string): Promise<QueuedOperation | undefined> {
    const all = await this.adapter.all();
    return all.find((o) => o.id === id);
  }
}
