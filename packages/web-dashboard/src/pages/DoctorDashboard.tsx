import { useNavigate } from 'react-router-dom';
import { signOut } from '@agada/shared/auth';
import { supabase } from '@/lib/supabase';

export function DoctorDashboard() {
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut(supabase);
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Doctor Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Prototype stub — referral queue comes Day 5
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Sign out
        </button>
      </header>
    </div>
  );
}
