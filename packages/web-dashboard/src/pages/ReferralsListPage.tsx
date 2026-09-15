import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listMyReferrals,
  referralStatusLabel,
  type Referral,
} from '@agada/shared/api';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

export function ReferralsListPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyReferrals(supabase)
      .then((r) => !cancelled && setReferrals(r))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Referrals"
        subtitle="Referrals you have created"
        backTo="/asha"
        backLabel="ASHA Dashboard"
      />

      <main className="mx-auto max-w-5xl px-6 py-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading…</div>
          ) : referrals.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No referrals yet. Create one from a HIGH risk triage.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {referrals.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/asha/referrals/${r.id}`}
                    className="flex items-center justify-between px-4 py-3 transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-semibold',
                            r.urgency === 'EMERGENCY' && 'bg-red-100 text-red-700',
                            r.urgency === 'URGENT' && 'bg-amber-100 text-amber-700',
                            r.urgency === 'ROUTINE' && 'bg-slate-100 text-slate-700',
                          )}
                        >
                          {r.urgency}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {referralStatusLabel(r.status as never)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
