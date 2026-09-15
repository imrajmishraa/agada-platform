import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getPatient,
  listEncountersForPatient,
  createEncounter,
  type Patient,
  type Encounter,
  type EncounterType,
} from '@agada/shared/api';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';

export function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [p, es] = await Promise.all([
        getPatient(supabase, id),
        listEncountersForPatient(supabase, id),
      ]);
      if (!p) {
        setError('Patient not found');
      } else {
        setPatient(p);
        setEncounters(es);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function startEncounter(type: EncounterType) {
    if (!id) return;
    setStarting(true);
    try {
      await createEncounter(supabase, { patientId: id, encounterType: type });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start encounter');
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader title="Patient" backTo="/asha/patients" backLabel="Patients" />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error ?? 'Patient not found'}
          </div>
        </main>
      </div>
    );
  }

  const openEncounter = encounters.find((e) => e.status === 'OPEN');

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title={patient.full_name}
        subtitle={[
          patient.age ? `${patient.age}y` : null,
          patient.gender?.toLowerCase(),
          patient.village,
          patient.phone,
        ]
          .filter(Boolean)
          .join(' · ')}
        backTo="/asha/patients"
        backLabel="Patients"
      />

      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Details</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Village" value={patient.village} />
              <Row label="District" value={patient.district} />
              <Row label="State" value={patient.state} />
              <Row label="Pincode" value={patient.pincode} />
              <Row label="Address" value={patient.address} />
              <Row label="Emergency" value={patient.emergency_contact} />
            </dl>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Start Encounter</h2>
              {openEncounter && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Open
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(['HOME_VISIT', 'PHC', 'TELECONSULT', 'FOLLOWUP'] as EncounterType[]).map(
                (t) => (
                  <button
                    key={t}
                    disabled={starting || !!openEncounter}
                    onClick={() => startEncounter(t)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {t.replace('_', ' ')}
                  </button>
                ),
              )}
            </div>
            {openEncounter && (
              <p className="mt-3 text-xs text-slate-500">
                A visit is already open — vitals and triage come Day 4.
              </p>
            )}
          </section>

          <section className="rounded-xl bg-white ring-1 ring-slate-200">
            <div className="border-b border-slate-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Encounter History
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {encounters.length}
                </span>
              </h2>
            </div>
            {encounters.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No encounters yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {encounters.map((e) => (
                  <li key={e.id}>
                    <Link
                      to={`/asha/encounters/${e.id}`}
                      className="flex items-center justify-between px-5 py-3 text-sm hover:bg-slate-50"
                    >
                    <div>
                      <p className="font-medium text-slate-900">
                        {e.encounter_type?.replace('_', ' ') ?? 'Encounter'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(e.started_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={
                        e.status === 'OPEN'
                          ? 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700'
                          : 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700'
                      }
                    >
                      {e.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="truncate text-right text-slate-900">{value}</dd>
    </div>
  );
}
