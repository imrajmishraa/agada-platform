import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPatient } from '@agada/shared/api';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';

interface FormState {
  fullName: string;
  age: string;
  gender: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  address: string;
  emergencyContact: string;
}

const initial: FormState = {
  fullName: '',
  age: '',
  gender: '',
  phone: '',
  village: '',
  district: '',
  state: 'Maharashtra',
  pincode: '',
  address: '',
  emergencyContact: '',
};

export function NewPatientPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const patient = await createPatient(supabase, {
        fullName: form.fullName,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        phone: form.phone || undefined,
        village: form.village || undefined,
        district: form.district || undefined,
        state: form.state || undefined,
        pincode: form.pincode || undefined,
        address: form.address || undefined,
        emergencyContact: form.emergencyContact || undefined,
      });
      navigate(`/asha/patients/${patient.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save patient');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="New Patient"
        subtitle="Register a patient for the first time"
        backTo="/asha/patients"
        backLabel="Patients"
      />

      <main className="mx-auto max-w-2xl px-6 py-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl bg-white p-6 ring-1 ring-slate-200"
        >
          <Field label="Full name" required>
            <input
              required
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              className={inputCls}
              placeholder="e.g. Rahul Kumar"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Age">
              <input
                type="number"
                min={0}
                max={130}
                value={form.age}
                onChange={(e) => set('age', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Gender">
              <select
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
                className={inputCls}
              >
                <option value="">—</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className={inputCls}
                placeholder="+91…"
              />
            </Field>
            <Field label="Emergency contact">
              <input
                value={form.emergencyContact}
                onChange={(e) => set('emergencyContact', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Village">
            <input
              value={form.village}
              onChange={(e) => set('village', e.target.value)}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="District">
              <input
                value={form.district}
                onChange={(e) => set('district', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="State">
              <input
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Pincode">
              <input
                value={form.pincode}
                onChange={(e) => set('pincode', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Address">
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              className={inputCls}
            />
          </Field>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/asha/patients')}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Patient'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

const inputCls =
  'block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
