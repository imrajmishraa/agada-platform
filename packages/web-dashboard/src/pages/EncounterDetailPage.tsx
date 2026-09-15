import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  getEncounter,
  getPatient,
  runTriageAssessment,
  listTriageForEncounter,
  listReferralsForPatient,
  type Encounter,
  type Patient,
  type TriageAssessment,
  type TriageResult,
  type VitalSigns,
  type Symptoms,
  type Referral,
} from '@agada/shared/api';
import { CreateReferralModal } from '@/components/CreateReferralModal';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

const SYMPTOM_LABELS: Record<keyof Symptoms, string> = {
  fever: 'Fever',
  cough: 'Cough',
  breathingDifficulty: 'Breathing difficulty',
  chestPain: 'Chest pain',
  vomiting: 'Vomiting',
  weakness: 'Weakness',
  convulsions: 'Convulsions',
  diarrhea: 'Diarrhea',
};

export function EncounterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<TriageAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [referralOpen, setReferralOpen] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const [vitals, setVitals] = useState({
    temperatureC: '',
    heartRate: '',
    bpSystolic: '',
    bpDiastolic: '',
    spo2: '',
    respiratoryRate: '',
  });
  const [symptoms, setSymptoms] = useState<Symptoms>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const e = await getEncounter(supabase, id);
      if (!e) {
        setError('Encounter not found');
        return;
      }
      setEncounter(e);
      const [p, h, r] = await Promise.all([
        getPatient(supabase, e.patient_id),
        listTriageForEncounter(supabase, id),
        listReferralsForPatient(supabase, e.patient_id),
      ]);
      setPatient(p);
      setHistory(h);
      setReferrals(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load encounter');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  function toggleSymptom(key: keyof Symptoms) {
    setSymptoms((s) => ({ ...s, [key]: !s[key] }));
  }

  async function handleRunTriage() {
    if (!id || !patient) return;
    setRunning(true);
    setError(null);
    try {
      const vitalInput: VitalSigns = {
        temperatureC: vitals.temperatureC ? Number(vitals.temperatureC) : undefined,
        heartRate: vitals.heartRate ? Number(vitals.heartRate) : undefined,
        bpSystolic: vitals.bpSystolic ? Number(vitals.bpSystolic) : undefined,
        bpDiastolic: vitals.bpDiastolic ? Number(vitals.bpDiastolic) : undefined,
        spo2: vitals.spo2 ? Number(vitals.spo2) : undefined,
        respiratoryRate: vitals.respiratoryRate ? Number(vitals.respiratoryRate) : undefined,
      };

      const r = await runTriageAssessment(supabase, {
        encounterId: id,
        triageInput: {
          ageYears: patient.age ?? undefined,
          vitals: vitalInput,
          symptoms,
        },
      });
      setResult(r);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run triage');
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (error && !encounter) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader title="Encounter" backTo="/asha/patients" />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title={patient?.full_name ?? 'Encounter'}
        subtitle={`${encounter?.encounter_type?.replace('_', ' ')} · ${new Date(
          encounter?.started_at ?? '',
        ).toLocaleString()}`}
        backTo={patient ? `/asha/patients/${patient.id}` : '/asha/patients'}
        backLabel="Back to patient"
      />

      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-6 pb-16 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Vitals</h2>
            <div className="grid grid-cols-2 gap-4">
              <VitalField
                label="Temperature (°C)"
                value={vitals.temperatureC}
                onChange={(v) => setVitals({ ...vitals, temperatureC: v })}
                placeholder="37.0"
              />
              <VitalField
                label="Heart rate (bpm)"
                value={vitals.heartRate}
                onChange={(v) => setVitals({ ...vitals, heartRate: v })}
                placeholder="80"
              />
              <VitalField
                label="BP systolic (mmHg)"
                value={vitals.bpSystolic}
                onChange={(v) => setVitals({ ...vitals, bpSystolic: v })}
                placeholder="120"
              />
              <VitalField
                label="BP diastolic (mmHg)"
                value={vitals.bpDiastolic}
                onChange={(v) => setVitals({ ...vitals, bpDiastolic: v })}
                placeholder="80"
              />
              <VitalField
                label="SpO₂ (%)"
                value={vitals.spo2}
                onChange={(v) => setVitals({ ...vitals, spo2: v })}
                placeholder="98"
              />
              <VitalField
                label="Respiratory rate"
                value={vitals.respiratoryRate}
                onChange={(v) => setVitals({ ...vitals, respiratoryRate: v })}
                placeholder="18"
              />
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Symptoms</h2>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SYMPTOM_LABELS) as Array<keyof Symptoms>).map((key) => (
                <label
                  key={String(key)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition',
                    symptoms[key]
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={!!symptoms[key]}
                    onChange={() => toggleSymptom(key)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  {SYMPTOM_LABELS[key]}
                </label>
              ))}
            </div>
          </section>

          <button
            onClick={handleRunTriage}
            disabled={running}
            className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {running ? 'Running triage…' : 'Run Triage Assessment'}
          </button>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          {result && (
            <TriageResultCard
              result={result}
              onCreateReferral={() => setReferralOpen(true)}
              canCreateReferral={
                result.riskLevel === 'HIGH' &&
                !referrals.some((r) => r.encounter_id === id && r.status !== 'CANCELLED')
              }
            />
          )}

          {referrals.length > 0 && (
            <section className="rounded-xl bg-white ring-1 ring-slate-200">
              <div className="border-b border-slate-100 px-5 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Referrals</h2>
              </div>
              <ul className="divide-y divide-slate-100">
                {referrals.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/asha/referrals/${r.id}`}
                      className="flex items-center justify-between px-5 py-3 text-sm hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{r.urgency}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(r.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {r.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {history.length > 0 && (
            <section className="rounded-xl bg-white ring-1 ring-slate-200">
              <div className="border-b border-slate-100 px-5 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Assessment History</h2>
              </div>
              <ul className="divide-y divide-slate-100">
                {history.map((h) => (
                  <li key={h.id} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          h.risk_level === 'HIGH' && 'bg-red-100 text-red-700',
                          h.risk_level === 'MEDIUM' && 'bg-amber-100 text-amber-700',
                          h.risk_level === 'LOW' && 'bg-emerald-100 text-emerald-700',
                        )}
                      >
                        {h.risk_level}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(h.assessed_at).toLocaleString()}
                      </span>
                    </div>
                    {h.reasoning && (
                      <p className="mt-2 text-xs text-slate-600">{h.reasoning}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      {result && patient && encounter && (
        <CreateReferralModal
          open={referralOpen}
          onClose={() => setReferralOpen(false)}
          onCreated={() => void load()}
          patientId={patient.id}
          encounterId={encounter.id}
          triageResult={result}
        />
      )}
    </div>
  );
}

function VitalField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </label>
  );
}

function TriageResultCard({
  result,
  onCreateReferral,
  canCreateReferral,
}: {
  result: TriageResult;
  onCreateReferral: () => void;
  canCreateReferral: boolean;
}) {
  const styles = {
    HIGH: 'border-red-300 bg-red-50 text-red-900',
    MEDIUM: 'border-amber-300 bg-amber-50 text-amber-900',
    LOW: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  } as const;

  const badge = {
    HIGH: 'bg-red-600 text-white',
    MEDIUM: 'bg-amber-500 text-white',
    LOW: 'bg-emerald-600 text-white',
  } as const;

  return (
    <section className={cn('rounded-xl border-2 p-5', styles[result.riskLevel])}>
      <div className="mb-3 flex items-center gap-3">
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
            badge[result.riskLevel],
          )}
        >
          {result.riskLevel} RISK
        </span>
        <span className="text-xs font-medium">
          {result.carePathway.replace('_', ' ')}
        </span>
      </div>

      <p className="text-sm">{result.recommendation}</p>

      {result.reasons.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide opacity-70">
            Why
          </h3>
          <ul className="mt-2 space-y-1 text-xs">
            {result.reasons.map((r) => (
              <li key={r.id}>• {r.detail ?? r.description}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide opacity-70">
          Next Steps
        </h3>
        <ul className="mt-2 space-y-1 text-xs">
          {result.nextSteps.map((s, i) => (
            <li key={i}>→ {s}</li>
          ))}
        </ul>
      </div>

      {canCreateReferral && (
        <button
          onClick={onCreateReferral}
          className="mt-5 w-full rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
        >
          Create Referral
        </button>
      )}
    </section>
  );
}
