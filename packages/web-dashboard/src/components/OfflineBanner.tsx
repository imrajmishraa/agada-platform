import { useOffline } from '@/lib/offline/online';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
  const { online, setSimulatedOffline, pendingCount, syncing, syncNow } = useOffline();

  return (
    <div
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-2 text-xs font-medium',
        online ? 'bg-slate-800 text-slate-100' : 'bg-amber-500 text-amber-950',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            online ? 'bg-emerald-400' : 'bg-amber-900 animate-pulse',
          )}
        />
        <span>
          {online ? 'Online' : 'Offline — changes will sync when reconnected'}
        </span>
        {pendingCount > 0 && (
          <span className="rounded-full bg-black/20 px-2 py-0.5">
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!online && (
          <button
            onClick={() => setSimulatedOffline(false)}
            className="rounded bg-black/20 px-2 py-1 hover:bg-black/30"
          >
            Go online
          </button>
        )}
        {online && pendingCount === 0 && (
          <button
            onClick={() => setSimulatedOffline(true)}
            className="rounded bg-white/10 px-2 py-1 hover:bg-white/20"
            title="Simulate offline for demo"
          >
            Simulate offline
          </button>
        )}
        {online && pendingCount > 0 && (
          <button
            onClick={() => void syncNow()}
            disabled={syncing}
            className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-50"
          >
            {syncing ? 'Syncing…' : 'Sync now'}
          </button>
        )}
      </div>
    </div>
  );
}
