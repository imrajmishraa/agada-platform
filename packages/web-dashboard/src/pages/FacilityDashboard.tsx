import { useEffect, useState } from 'react';
import {
  getFacilityDashboardStats,
  type FacilityDashboardStats,
} from '@agada/shared/api';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';

export function FacilityDashboard() {
  const [stats, setStats] = useState<FacilityDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFacilityDashboardStats(supabase)
      .then((s) => !cancelled && setStats(s))
      .catch((e) =>
        !cancelled && setError(e instanceof Error ? e.message : 'Failed to load'),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Facility Dashboard"
        subtitle="Operational overview across the facility"
      />

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Patient Flow</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total Patients"
              value={loading ? '—' : stats?.totalPatients ?? 0}
              hint="Registered in the system"
            />
            <StatCard
              label="Active Encounters"
              value={loading ? '—' : stats?.activeEncounters ?? 0}
              hint="Currently open"
            />
            <StatCard
              label="Total Triages"
              value={loading ? '—' : stats?.totalTriages ?? 0}
              hint="Assessments run"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Clinical Risk</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="High Risk (7d)"
              value={loading ? '—' : stats?.highRiskPatientsLast7d ?? 0}
              hint="Flagged by triage"
              tone={stats && stats.highRiskPatientsLast7d > 0 ? 'danger' : 'default'}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Referral Pipeline</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Pending Referrals"
              value={loading ? '—' : stats?.pendingReferrals ?? 0}
              hint="In queue or under review"
              tone={stats && stats.pendingReferrals > 0 ? 'warning' : 'default'}
            />
            <StatCard
              label="Completed Referrals"
              value={loading ? '—' : stats?.completedReferrals ?? 0}
              hint="Closed with outcome"
              tone="success"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
