import { useCallback, useEffect, useState } from 'react';
import type { QueuedOperation, SyncStatus } from '@agada/shared/sync';
import { syncQueue } from '@/lib/offline/queue';
import { useOffline } from '@/lib/offline/online';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<SyncStatus, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  SYNCING: 'bg-blue-100 text-blue-700',
  SYNCED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
};

export function SyncPage() {
  const [ops, setOps] = useState<QueuedOperation[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const { online, syncNow, pendingCount } = useOffline();

  const refresh = useCallback(async () => {
    const all = await syncQueue.list();
    // newest first
    setOps([...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 2000);
    return () => clearInterval(t);
  }, [refresh]);

  async function handleRetry(id: string) {
    setBusy(true);
    try {
      await syncQueue.retry(id);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleClearSynced() {
    setBusy(true);
    try {
      await syncQueue.clearSynced();
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleForceFail() {
    setBusy(true);
    try {
      // Enqueue an op that will fail server-side: references a non-existent encounter.
      await syncQueue.enqueue('patient_vitals', 'INSERT', {
        encounter_id: '00000000-0000-0000-0000-000000000000',
        spo2: 88,
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const counts = ops.reduce(
    (acc, op) => {
      acc[op.status] = (acc[op.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<SyncStatus, number>,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Sync Queue"
        subtitle={online ? 'Online' : 'Offline — changes will sync when reconnected'}
        backTo="/asha"
        backLabel="ASHA Dashboard"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleForceFail()}
              disabled={busy}
              className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              title="Enqueue an operation that will fail — for demonstrating retry"
            >
              Force fail
            </button>
            <button
              onClick={() => void syncNow()}
              disabled={busy || !online || pendingCount === 0}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Sync now
            </button>
            <button
              onClick={() => void handleClearSynced()}
              disabled={busy || !counts.SYNCED}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Clear synced
            </button>
          </div>
        }
      />

      <main className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {(['PENDING', 'SYNCING', 'SYNCED', 'FAILED'] as SyncStatus[]).map((s) => (
            <span
              key={s}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium',
                STATUS_STYLES[s],
              )}
            >
              {s}: {counts[s] ?? 0}
            </span>
          ))}
        </div>

        {ops.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200">
            Queue is empty. Run a triage while offline to see entries here.
          </div>
        ) : (
          <ul className="space-y-2">
            {ops.map((op) => (
              <li key={op.id} className="rounded-xl bg-white ring-1 ring-slate-200">
                <button
                  onClick={() => toggle(op.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-semibold',
                          STATUS_STYLES[op.status],
                        )}
                      >
                        {op.status}
                      </span>
                      <span className="text-xs font-medium text-slate-700">
                        {op.entity}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{op.operation}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {new Date(op.createdAt).toLocaleString()} · attempts {op.attempts}
                    </p>
                    {op.lastError && (
                      <p className="mt-1 truncate text-xs text-red-600">{op.lastError}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {expanded.has(op.id) ? '▾' : '▸'}
                  </span>
                </button>

                {expanded.has(op.id) && (
                  <div className="border-t border-slate-100 px-4 py-3">
                    <p className="mb-1 text-xs font-medium text-slate-500">Payload</p>
                    <pre className="max-h-64 overflow-auto rounded bg-slate-50 p-3 text-xs text-slate-700">
                      {JSON.stringify(op.payload, null, 2)}
                    </pre>

                    {op.lastError && (
                      <>
                        <p className="mt-3 mb-1 text-xs font-medium text-red-600">
                          Last error
                        </p>
                        <pre className="overflow-auto rounded bg-red-50 p-3 text-xs text-red-700">
                          {op.lastError}
                        </pre>
                      </>
                    )}

                    {op.status === 'FAILED' && (
                      <button
                        onClick={() => void handleRetry(op.id)}
                        disabled={busy}
                        className="mt-3 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
