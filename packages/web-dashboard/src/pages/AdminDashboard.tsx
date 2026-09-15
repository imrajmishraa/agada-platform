import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title="Admin Dashboard" subtitle="Minimal admin stub for prototype" />

      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link
          to="/facility"
          className="block rounded-xl bg-white p-5 ring-1 ring-slate-200 transition hover:ring-brand-500"
        >
          <h2 className="text-base font-semibold text-slate-900">Facility Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            Patient flow, clinical risk, and referral pipeline
          </p>
        </Link>
      </main>
    </div>
  );
}
