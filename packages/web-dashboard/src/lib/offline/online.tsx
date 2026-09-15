import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { flushQueue } from '@agada/shared/sync';
import { supabase } from '@/lib/supabase';
import { syncQueue } from './queue';

interface OfflineContextValue {
  online: boolean;
  simulatedOffline: boolean;
  setSimulatedOffline: (v: boolean) => void;
  pendingCount: number;
  syncing: boolean;
  refreshPending: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [browserOnline, setBrowserOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const online = browserOnline && !simulatedOffline;

  const refreshPending = useCallback(async () => {
    const n = await syncQueue.pendingCount();
    setPendingCount(n);
  }, []);

  const syncNow = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await flushQueue(supabase, syncQueue);
      await syncQueue.clearSynced();
      await refreshPending();
    } finally {
      setSyncing(false);
    }
  }, [syncing, refreshPending]);

  useEffect(() => {
    function goOnline() {
      setBrowserOnline(true);
    }
    function goOffline() {
      setBrowserOnline(false);
    }
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    void refreshPending();
  }, [refreshPending]);

  // Auto-flush when connectivity returns and there's work queued
  useEffect(() => {
    if (online && pendingCount > 0 && !syncing) {
      void syncNow();
    }
  }, [online, pendingCount, syncing, syncNow]);

  const value = useMemo(
    () => ({
      online,
      simulatedOffline,
      setSimulatedOffline,
      pendingCount,
      syncing,
      refreshPending,
      syncNow,
    }),
    [online, simulatedOffline, pendingCount, syncing, refreshPending, syncNow],
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used inside OfflineProvider');
  return ctx;
}
