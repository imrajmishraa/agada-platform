import type { QueuedOperation, SyncAdapter } from '@agada/shared/sync';

const STORAGE_KEY = 'agada.sync.queue.v1';

/**
 * localStorage-backed SyncAdapter. Swap for IndexedDB or expo-sqlite later —
 * the SyncQueue and flush logic don't care.
 */
export const localStorageAdapter: SyncAdapter = {
  async all() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as QueuedOperation[];
    } catch {
      return [];
    }
  },

  async put(op) {
    const all = await this.all();
    const next = all.filter((o) => o.id !== op.id).concat(op);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  async delete(id) {
    const all = await this.all();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(all.filter((o) => o.id !== id)),
    );
  },

  async clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
