import type { AgadaClient } from '../supabase/client.js';
import type { Database } from '../supabase/database.types.js';

type FacilityRow = Database['public']['Tables']['facilities']['Row'];

export type Facility = FacilityRow;

export async function listFacilities(client: AgadaClient): Promise<Facility[]> {
  const { data, error } = await client
    .from('facilities')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getFacility(
  client: AgadaClient,
  id: string,
): Promise<Facility | null> {
  const { data, error } = await client
    .from('facilities')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function facilityTypeLabel(type: string | null): string {
  switch (type) {
    case 'SUBCENTER':
      return 'Sub-Centre';
    case 'PHC':
      return 'PHC';
    case 'CHC':
      return 'CHC';
    case 'DISTRICT_HOSPITAL':
      return 'District Hospital';
    default:
      return type ?? 'Facility';
  }
}
