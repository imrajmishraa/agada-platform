import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {
  getSessionProfile,
  type SessionProfile,
  type UserRole,
} from '@agada/shared/auth';
import { supabase } from '@/lib/supabase';

interface Props {
  allowedRoles: UserRole[];
}

type State =
  | { status: 'loading' }
  | { status: 'unauth' }
  | { status: 'ok'; profile: SessionProfile };

export function ProtectedRoute({ allowedRoles }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const profile = await getSessionProfile(supabase);
      if (cancelled) return;

      if (!profile || !allowedRoles.includes(profile.role)) {
        setState({ status: 'unauth' });
        return;
      }
      setState({ status: 'ok', profile });
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [allowedRoles]);

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (state.status === 'unauth') return <Navigate to="/login" replace />;

  return <Outlet context={state.profile} />;
}
