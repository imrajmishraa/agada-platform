import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: number | string;
  hint?: string;
  to?: string;
  tone?: 'default' | 'warning' | 'danger' | 'success';
}

const TONES = {
  default: 'bg-white text-slate-900 ring-slate-200',
  warning: 'bg-amber-50 text-amber-900 ring-amber-200',
  danger: 'bg-red-50 text-red-900 ring-red-200',
  success: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
} as const;

export function StatCard({ label, value, hint, to, tone = 'default' }: Props) {
  const inner = (
    <div
      className={cn(
        'rounded-xl p-5 ring-1 transition',
        TONES[tone],
        to && 'hover:ring-brand-500',
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-70">{hint}</p>}
    </div>
  );

  return to ? <Link to={to}>{inner}</Link> : inner;
}
