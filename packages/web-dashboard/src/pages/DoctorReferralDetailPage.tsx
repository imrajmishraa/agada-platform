import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  getReferral,
  getPatient,
  getFacility,
  getEncounter,
  listVitalsForEncounter,
  listTriageForEncounter,
  listClinicalNotesForReferral,
  listDiagnosesForEncounter,
  startReview,
  completeReferralWithOutcome,
  facilityTypeLabel,
  type Referral,
  type Patient,
  type Facility,
  type Encounter,
  type Vitals,
  type TriageAssessment,
  type ClinicalNote,
  type Diagnosis,
} from '@agada/shared/api';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

export function DoctorReferralDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [referral, setReferral] = useState<Referral | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [destination, setDestination] = useState<Facility | null>(null);
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [triage, setTriage] = useState<TriageAssessment | null>(null);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [consultNotes, setConsultNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

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

      const [p, e, d, vs, ts, ns, ds] = await Promise.all([
        getPatient(supabase, r.patient_id),
        getEncounter(supabase, r.encounter_id),
        r.destination_facility_id
          ? getFacility(supabase, r.destination_facility_id)
          : Promise.resolve(null),
        listVitalsForEncounter(supabase, r.encounter_id),
        listTriageForEncounter(supabase, r.encounter_id),
        listClinicalNotesForReferral(supabase, id),
        listDiagnosesForEncounter(supabase, r.encounter_id),
      ]);

      setPatient(p);
      setEncounter(e);
      setDestination(d);
      setVitals(vs[0] ?? null);
      setTriage(ts[0] ?? null);
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

  async function handleStartReview() {
    if (!id) return;
    try {
      await startReview(supabase, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start review');
    }
  }

  async function handleComplete(e: FormEvent) {
    e.preventDefault();
    if (!id || !referral) return;
    if (consultNotes.trim().length === 0) {
      setError('Clinical notes are required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await completeReferralWithOutcome(supabase, {
        referralId: id,
        encounterId: referral.encounter_id,
        notes: consultNotes.trim(),
        diagnosis: diagnosis.trim(),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete referral');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (error && !referral) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader title="Referral" backTo="/doctor" backLabel="Referral Queue" />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!referral || !patient) return null;

  const isComplete = referral.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title={patient.full_name}
        subtitle={`${referral.urgency} · ${referral.status}`}
        backTo="/doctor"
        backLabel="Referral Queue"
        actions={
          !isComplete &&
          referral.status === 'CREATED' && (
            <button
              onClick={handleStartReview}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Start Review
            </button>
          )
        }
      />

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-6 pb-16 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Clinical Snapshot</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Age" value={patient.age ? `${patient.age}y` : '—'} />
              <Stat label="Gender" value={patient.gender?.toLowerCase() ?? '—'} />
              <Stat label="Village" value={patient.village ?? '—'} />
            </div>

            {vitals && (
              <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                <Vital label="Temp" value={vitals.temperature_c} unit="°C" />
                <Vital label="HR" value={vitals.heart_rate} unit="bpm" />
                <Vital label="SpO₂" value={vitals.spo2} unit="%" />
                <Vital label="BP" value={vitals.bp_systolic && vitals.bp_diastolic ? `${vitals.bp_systolic}/${vitals.bp_diastolic}` : null} unit="" />
                <Vital label="RR" value={vitals.respiratory_rate} unit="/min" />
              </div>
            )}

            {triage && (
              <div className="mt-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Triage</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      triage.risk_level === 'HIGH' && 'bg-red-100 text-red-700',
                      triage.risk_level === 'MEDIUM' && 'bg-amber-100 text-amber-700',
                      triage.risk_level === 'LOW' && 'bg-emerald-100 text-emerald-700',
                    )}
                  >
                    {triage.risk_level}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{triage.reasoning}</p>
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Referral Reason</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {referral.reason || '—'}
            </p>
          </section>

          {notes.length > 0 && (
            <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Clinical Notes</h2>
              <ul className="space-y-3">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        {n.note_type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-800">{n.content}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {diagnoses.length > 0 && (
            <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Diagnoses</h2>
              <ul className="space-y-2">
                {diagnoses.map((d) => (
                  <li key={d.id} className="text-sm text-slate-800">
                    • {d.description}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Referral Info</h2>
            <dl className="space-y-2 text-sm">
              <Row
                label="Destination"
                value={
                  destination
                    ? `${facilityTypeLabel(destination.type)} · ${destination.name}`
                    : '—'
                }
              />
              <Row label="Encounter" value={encounter?.encounter_type?.replace('_', ' ') ?? '—'} />
              <Row label="Created" value={new Date(referral.created_at).toLocaleString()} />
              <Row label="Status" value={referral.status} />
            </dl>
          </section>

          {!isComplete && (
            <form
              onSubmit={handleComplete}
              className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-slate-200"
            >
              <h2 className="text-sm font-semibold text-slate-900">Consultation</h2>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">
                  Clinical notes <span className="text-red-500">*</span>
                </span>
                <textarea
                  rows={5}
                  value={consultNotes}
                  onChange={(e) => setConsultNotes(e.target.value)}
                  placeholder="Observations, examination findings, treatment given…"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">
                  Diagnosis
                </span>
                <input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute exacerbation of asthma"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </label>

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? 'Completing…' : 'Complete Referral'}
              </button>
            </form>
          )}

          {isComplete && (
            <section className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5">
              <h2 className="text-sm font-semibold text-emerald-900">Referral Completed</h2>
              <p className="mt-1 text-xs text-emerald-800">
                Outcome has been recorded and returned to the ASHA worker.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function Vital({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | null | undefined;
  unit: string;
}) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="font-medium text-slate-900">
        {value ?? '—'}
        {value ? ` ${unit}` : ''}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="truncate text-right text-slate-900">{value}</dd>
    </div>
  );
}
