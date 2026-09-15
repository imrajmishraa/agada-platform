import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getReferral,
  getPatient,
  getFacility,
  listReferralEvents,
  listClinicalNotesForReferral,
  listDiagnosesForEncounter,
  referralStatusLabel,
  facilityTypeLabel,
  type Referral,
  type ReferralEvent,
  type Patient,
  type Facility,
  type ClinicalNote,
  type Diagnosis,
} from '@agada/shared/api';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

export function ReferralDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [referral, setReferral] = useState<Referral | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [destination, setDestination] = useState<Facility | null>(null);
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await getReferral(supabase, id);
      if (!r) {
        setError('Referral not found');
        return;
      }
      setReferral(r);

      const [p, d, ev, ns, ds] = await Promise.all([
        getPatient(supabase, r.patient_id),
        r.destination_facility_id
          ? getFacility(supabase, r.destination_facility_id)
          : Promise.resolve(null),
        listReferralEvents(supabase, id),
        listClinicalNotesForReferral(supabase, id),
        listDiagnosesForEncounter(supabase, r.encounter_id),
      ]);
      setPatient(p);
      setDestination(d);
      setEvents(ev);
      setNotes(ns);
      setDiagnoses(ds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader title="Referral" backTo="/asha/referrals" />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error ?? 'Referral not found'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Referral"
        subtitle={referralStatusLabel(referral.status as never)}
        backTo="/asha/referrals"
        backLabel="All Referrals"
      />

      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-6 pb-16 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Referral Details</h2>
            <dl className="space-y-3 text-sm">
              <Row
                label="Urgency"
                value={
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      referral.urgency === 'EMERGENCY' && 'bg-red-100 text-red-700',
                      referral.urgency === 'URGENT' && 'bg-amber-100 text-amber-700',
                      referral.urgency === 'ROUTINE' && 'bg-slate-100 text-slate-700',
                    )}
                  >
                    {referral.urgency}
                  </span>
                }
              />
              <Row label="Patient" value={patient?.full_name ?? '—'} />
              <Row
                label="Destination"
                value={
                  destination
                    ? `${facilityTypeLabel(destination.type)} · ${destination.name}`
                    : '—'
                }
              />
              <Row label="Created" value={new Date(referral.created_at).toLocaleString()} />
            </dl>
          </section>

          <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Reason</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {referral.reason || '—'}
            </p>
          </section>


          {(notes.length > 0 || diagnoses.length > 0) && (
            <section className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5">
              <h2 className="mb-3 text-sm font-semibold text-emerald-900">
                Doctor Outcome
              </h2>

              {diagnoses.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800/70">
                    Diagnosis
                  </p>
                  <ul className="mt-1 space-y-1">
                    {diagnoses.map((d) => (
                      <li key={d.id} className="text-sm text-emerald-900">
                        • {d.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {notes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800/70">
                    Clinical Notes
                  </p>
                  <ul className="mt-1 space-y-2">
                    {notes.map((n) => (
                      <li key={n.id} className="text-sm text-emerald-900">
                        <p className="whitespace-pre-wrap">{n.content}</p>
                        <p className="mt-1 text-xs text-emerald-800/70">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {patient && (
            <Link
              to={`/asha/patients/${patient.id}`}
              className="block rounded-xl bg-white p-5 ring-1 ring-slate-200 hover:ring-brand-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">View Patient</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {patient.full_name} · full clinical history
                  </p>
                </div>
                <span className="text-xs text-slate-400">→</span>
              </div>
            </Link>
          )}
        </div>

        <div className="lg:col-span-1">
          <section className="rounded-xl bg-white ring-1 ring-slate-200">
            <div className="border-b border-slate-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Status Timeline</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {events.map((e) => (
                <li key={e.id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-500" />
                    <span className="text-sm font-medium text-slate-900">
                      {referralStatusLabel(e.to_status as never)}
                    </span>
                  </div>
                  {e.comment && (
                    <p className="mt-1 text-xs text-slate-500">{e.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(e.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{value}</dd>
    </div>
  );
}
