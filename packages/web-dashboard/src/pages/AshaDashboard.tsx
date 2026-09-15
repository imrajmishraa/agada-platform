import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAshaDashboardStats, type AshaDashboardStats } from '@agada/shared/api';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';

export function AshaDashboard() {
  const [stats, setStats] = useState<AshaDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAshaDashboardStats(supabase)
      .then((s) => !cancelled && setStats(s))
      .catch(() => !cancelled && setStats(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title="ASHA Dashboard" subtitle="Prototype build · Agada SIH 2026" />

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-6">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Today</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Today's Visits"
              value={loading ? '—' : stats?.todaysVisits ?? 0}
              hint="Encounters started today"
            />
            <StatCard
              label="Pending Referrals"
              value={loading ? '—' : stats?.pendingReferrals ?? 0}
              hint="Awaiting doctor review"
              to="/asha/referrals"
              tone={stats && stats.pendingReferrals > 0 ? 'warning' : 'default'}
            />
            <StatCard
              label="High Risk (7d)"
              value={loading ? '—' : stats?.highRiskPatientsLast7d ?? 0}
              hint="Triage assessments marked HIGH"
              tone={stats && stats.highRiskPatientsLast7d > 0 ? 'danger' : 'default'}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/asha/patients"
              className="rounded-xl bg-white p-5 ring-1 ring-slate-200 transition hover:ring-brand-500"
            >
              <h3 className="text-base font-semibold text-slate-900">Patients</h3>
              <p className="mt-1 text-sm text-slate-500">
                Search, register, and view patient history
              </p>
            </Link>

            <Link
              to="/asha/referrals"
              className="rounded-xl bg-white p-5 ring-1 ring-slate-200 transition hover:ring-brand-500"
            >
              <h3 className="text-base font-semibold text-slate-900">Referrals</h3>
              <p className="mt-1 text-sm text-slate-500">
                Track referrals you have created
              </p>
            </Link>

            <Link
              to="/asha/sync"
              className="rounded-xl bg-white p-5 ring-1 ring-slate-200 transition hover:ring-brand-500"
            >
              <h3 className="text-base font-semibold text-slate-900">Sync Queue</h3>
              <p className="mt-1 text-sm text-slate-500">
                Offline capture status and retry
              </p>
            </Link>

            <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-semibold text-slate-400">Total Patients</h3>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {loading ? '—' : stats?.totalPatients ?? 0}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
