import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listIncomingReferrals,
  listCompletedReferrals,
  type Referral,
} from '@agada/shared/api';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

export function DoctorDashboard() {
  const [incoming, setIncoming] = useState<Referral[]>([]);
  const [completed, setCompleted] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [inc, comp] = await Promise.all([
          listIncomingReferrals(supabase),
          listCompletedReferrals(supabase),
        ]);
        if (!cancelled) {
          setIncoming(inc);
          setCompleted(comp);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load referrals');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Doctor Dashboard"
        subtitle="Referrals awaiting your review"
      />

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Referral Queue
              {!loading && (
                <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                  {incoming.length}
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              Loading…
            </div>
          ) : incoming.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              No pending referrals.
            </div>
          ) : (
            <ul className="space-y-2">
              {incoming.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/doctor/referrals/${r.id}`}
                    className={cn(
                      'block rounded-xl border-l-4 bg-white px-5 py-4 ring-1 ring-slate-200 transition',
                      'hover:ring-brand-500',
                      r.urgency === 'EMERGENCY' && 'border-l-red-500',
                      r.urgency === 'URGENT' && 'border-l-amber-500',
                      r.urgency === 'ROUTINE' && 'border-l-slate-300',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-bold uppercase',
                              r.urgency === 'EMERGENCY' && 'bg-red-100 text-red-700',
                              r.urgency === 'URGENT' && 'bg-amber-100 text-amber-700',
                              r.urgency === 'ROUTINE' && 'bg-slate-100 text-slate-700',
                            )}
                          >
                            {r.urgency}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {r.status}
                          </span>
                        </div>
                        <p className="truncate text-sm text-slate-700">
                          {r.reason?.split('\n')[0] ?? 'Referral'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Created {new Date(r.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">→</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Recently Completed</h2>
          {completed.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              No completed referrals yet.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl bg-white ring-1 ring-slate-200">
              {completed.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/doctor/referrals/${r.id}`}
                    className="flex items-center justify-between px-5 py-3 text-sm hover:bg-slate-50"
                  >
                    <span className="truncate text-slate-700">
                      {r.reason?.split('\n')[0] ?? 'Referral'}
                    </span>
                    <span className="ml-3 shrink-0 text-xs text-slate-400">
                      {new Date(r.updated_at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
