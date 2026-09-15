import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '@agada/shared/auth';
import { supabase } from '@/lib/supabase';

interface Props {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, backTo, backLabel, actions }: Props) {
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut(supabase);
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="min-w-0">
          {backTo && (
            <Link
              to={backTo}
              className="mb-1 block text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              ← {backLabel ?? 'Back'}
            </Link>
          )}
          <h1 className="truncate text-xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {actions}
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
