import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPatients, type Patient } from '@agada/shared/api';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

export function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await listPatients(supabase, { search });
        if (!cancelled) setPatients(rows);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load patients');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Patients"
        subtitle="Search or register a new patient"
        backTo="/asha"
        backLabel="ASHA Dashboard"
        actions={
          <Link
            to="/asha/patients/new"
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            + New Patient
          </Link>
        }
      />

      <main className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or village…"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading…</div>
          ) : patients.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              {search ? 'No patients match your search.' : 'No patients yet.'}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {patients.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/asha/patients/${p.id}`}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 transition',
                      'hover:bg-slate-50',
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {p.full_name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {[
                          p.age ? `${p.age}y` : null,
                          p.gender?.toLowerCase(),
                          p.village,
                          p.phone,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
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
