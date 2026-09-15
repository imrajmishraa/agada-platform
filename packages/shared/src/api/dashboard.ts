import type { AgadaClient } from '../supabase/client.js';

export interface AshaDashboardStats {
  todaysVisits: number;
  pendingReferrals: number;
  completedReferrals: number;
  highRiskPatientsLast7d: number;
  totalPatients: number;
}

export interface FacilityDashboardStats {
  totalPatients: number;
  highRiskPatientsLast7d: number;
  pendingReferrals: number;
  completedReferrals: number;
  activeEncounters: number;
  totalTriages: number;
}

function sevenDaysAgoISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
}

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getAshaDashboardStats(
  client: AgadaClient,
): Promise<AshaDashboardStats> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const [encountersRes, pendingRefsRes, completedRefsRes, highRiskRes, patientsRes] =
    await Promise.all([
      client
        .from('encounters')
        .select('id', { count: 'exact', head: true })
        .eq('health_worker_id', user.id)
        .gte('started_at', startOfTodayISO()),

      client
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .in('status', ['CREATED', 'ACCEPTED', 'IN_REVIEW', 'CONSULTATION']),

      client
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .eq('status', 'COMPLETED'),

      client
        .from('triage_assessments')
        .select('id', { count: 'exact', head: true })
        .eq('risk_level', 'HIGH')
        .gte('assessed_at', sevenDaysAgoISO()),

      client
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id),
    ]);

  return {
    todaysVisits: encountersRes.count ?? 0,
    pendingReferrals: pendingRefsRes.count ?? 0,
    completedReferrals: completedRefsRes.count ?? 0,
    highRiskPatientsLast7d: highRiskRes.count ?? 0,
    totalPatients: patientsRes.count ?? 0,
  };
}

export async function getFacilityDashboardStats(
  client: AgadaClient,
): Promise<FacilityDashboardStats> {
  const [patientsRes, highRiskRes, pendingRefsRes, completedRefsRes, activeRes, triageRes] =
    await Promise.all([
      client.from('patients').select('id', { count: 'exact', head: true }),
      client
        .from('triage_assessments')
        .select('id', { count: 'exact', head: true })
        .eq('risk_level', 'HIGH')
        .gte('assessed_at', sevenDaysAgoISO()),
      client
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .in('status', ['CREATED', 'ACCEPTED', 'IN_REVIEW', 'CONSULTATION']),
      client
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'COMPLETED'),
      client
        .from('encounters')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'OPEN'),
      client.from('triage_assessments').select('id', { count: 'exact', head: true }),
    ]);

  return {
    totalPatients: patientsRes.count ?? 0,
    highRiskPatientsLast7d: highRiskRes.count ?? 0,
    pendingReferrals: pendingRefsRes.count ?? 0,
    completedReferrals: completedRefsRes.count ?? 0,
    activeEncounters: activeRes.count ?? 0,
    totalTriages: triageRes.count ?? 0,
  };
}
