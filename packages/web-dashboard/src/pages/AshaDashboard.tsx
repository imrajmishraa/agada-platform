import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';

export function AshaDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title="ASHA Dashboard" subtitle="Prototype build · Agada SIH 2026" />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/asha/patients"
            className="rounded-xl bg-white p-5 ring-1 ring-slate-200 transition hover:ring-brand-500"
          >
            <h2 className="text-base font-semibold text-slate-900">Patients</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search, register, and view patient history
            </p>
          </Link>

          <div className="rounded-xl bg-white/60 p-5 ring-1 ring-slate-200">
            <h2 className="text-base font-semibold text-slate-400">Triage</h2>
            <p className="mt-1 text-sm text-slate-400">Coming Day 4</p>
          </div>
        </div>
      </main>
    </div>
  );
}
