import type { AgadaClient } from '../supabase/client.js';
import type { Database } from '../supabase/database.types.js';

type ReferralRow = Database['public']['Tables']['referrals']['Row'];
type ReferralEventRow = Database['public']['Tables']['referral_events']['Row'];
type ReferralInsert = Database['public']['Tables']['referrals']['Insert'];

export type Referral = ReferralRow;
export type ReferralEvent = ReferralEventRow;

export type ReferralStatus =
  | 'CREATED'
  | 'ACCEPTED'
  | 'IN_REVIEW'
  | 'CONSULTATION'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type ReferralUrgency = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export interface CreateReferralInput {
  patientId: string;
  encounterId: string;
  destinationFacilityId: string;
  reason: string;
  urgency: ReferralUrgency;
  sourceFacilityId?: string;
}

export interface ReferralWithFacilities extends Referral {
  destinationFacilityName?: string;
  destinationFacilityType?: string;
  patientName?: string;
}

export async function createReferral(
  client: AgadaClient,
  input: CreateReferralInput,
): Promise<Referral> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const insert: ReferralInsert = {
    patient_id: input.patientId,
    encounter_id: input.encounterId,
    source_facility_id: input.sourceFacilityId ?? null,
    destination_facility_id: input.destinationFacilityId,
    reason: input.reason,
    urgency: input.urgency,
    status: 'CREATED',
    created_by: user.id,
  };

  const { data, error } = await client
    .from('referrals')
    .insert(insert)
    .select()
    .single();

  if (error) throw error;

  // Log the initial status event
  await client.from('referral_events').insert({
    referral_id: data.id,
    from_status: null,
    to_status: 'CREATED',
    actor_id: user.id,
    comment: 'Referral created',
  });

  return data;
}

export async function getReferral(
  client: AgadaClient,
  id: string,
): Promise<Referral | null> {
  const { data, error } = await client
    .from('referrals')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listReferralsForPatient(
  client: AgadaClient,
  patientId: string,
): Promise<Referral[]> {
  const { data, error } = await client
    .from('referrals')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Referrals created by the currently authenticated user.
 */
export async function listMyReferrals(client: AgadaClient): Promise<Referral[]> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await client
    .from('referrals')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function listReferralEvents(
  client: AgadaClient,
  referralId: string,
): Promise<ReferralEvent[]> {
  const { data, error } = await client
    .from('referral_events')
    .select('*')
    .eq('referral_id', referralId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export function urgencyFromRiskLevel(level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): ReferralUrgency {
  switch (level) {
    case 'CRITICAL':
    case 'HIGH':
      return 'EMERGENCY';
    case 'MEDIUM':
      return 'URGENT';
    case 'LOW':
      return 'ROUTINE';
  }
}

export function referralStatusLabel(status: ReferralStatus): string {
  switch (status) {
    case 'CREATED':
      return 'Created';
    case 'ACCEPTED':
      return 'Accepted';
    case 'IN_REVIEW':
      return 'In Review';
    case 'CONSULTATION':
      return 'In Consultation';
    case 'COMPLETED':
      return 'Completed';
    case 'REJECTED':
      return 'Rejected';
    case 'CANCELLED':
      return 'Cancelled';
  }
}
