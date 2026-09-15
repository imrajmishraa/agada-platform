import { useEffect, useState, type FormEvent } from 'react';
import {
  listFacilities,
  createReferral,
  urgencyFromRiskLevel,
  facilityTypeLabel,
  type Facility,
  type Referral,
  type TriageResult,
} from '@agada/shared/api';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (referral: Referral) => void;
  patientId: string;
  encounterId: string;
  triageResult: TriageResult;
}

export function CreateReferralModal({
  open,
  onClose,
  onCreated,
  patientId,
  encounterId,
  triageResult,
}: Props) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urgency = urgencyFromRiskLevel(triageResult.riskLevel);

  useEffect(() => {
    if (!open) return;
    listFacilities(supabase)
      .then((f) => setFacilities(f))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load facilities'));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Auto-fill reason from triage reasoning
    const summary = triageResult.reasons
      .map((r) => r.detail ?? r.description)
      .join('; ');
    setReason(`${triageResult.recommendation}\n\nFindings: ${summary}`);
  }, [open, triageResult]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!destination) {
      setError('Select a destination facility');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const ref = await createReferral(supabase, {
        patientId,
        encounterId,
        destinationFacilityId: destination,
        reason,
        urgency,
      });
      onCreated(ref);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create referral');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Create Referral</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2 rounded-lg bg-slate-50 p-3 text-xs">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 font-semibold',
                triageResult.riskLevel === 'HIGH' && 'bg-red-600 text-white',
                triageResult.riskLevel === 'MEDIUM' && 'bg-amber-500 text-white',
                triageResult.riskLevel === 'LOW' && 'bg-emerald-600 text-white',
              )}
            >
              {triageResult.riskLevel} RISK
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 font-medium text-slate-700">
              Urgency: {urgency}
            </span>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Destination facility <span className="text-red-500">*</span>
            </span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select facility…</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {facilityTypeLabel(f.type)} · {f.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Reason for referral
            </span>
            <textarea
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Auto-filled from triage. Edit if needed.
            </span>
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
