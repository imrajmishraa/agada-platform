import type { AgadaClient } from '../supabase/client.js';
import type { Database } from '../supabase/database.types.js';

type PatientRow = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export type Patient = PatientRow;

export interface CreatePatientInput {
  fullName: string;
  age?: number;
  gender?: string;
  phone?: string;
  village?: string;
  address?: string;
  emergencyContact?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

export interface ListPatientsOptions {
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * List patients. Optional fuzzy search across name, phone, village.
 */
export async function listPatients(
  client: AgadaClient,
  opts: ListPatientsOptions = {},
): Promise<Patient[]> {
  const { search, limit = 50, offset = 0 } = opts;

  let query = client
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search && search.trim().length > 0) {
    const term = search.trim().replace(/[%,]/g, '');
    query = query.or(
      `full_name.ilike.%${term}%,phone.ilike.%${term}%,village.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPatient(
  client: AgadaClient,
  id: string,
): Promise<Patient | null> {
  const { data, error } = await client
    .from('patients')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createPatient(
  client: AgadaClient,
  input: CreatePatientInput,
): Promise<Patient> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const insert: PatientInsert = {
    full_name: input.fullName.trim(),
    age: input.age ?? null,
    gender: input.gender ?? null,
    phone: input.phone ?? null,
    village: input.village ?? null,
    address: input.address ?? null,
    emergency_contact: input.emergencyContact ?? null,
    district: input.district ?? null,
    state: input.state ?? 'Maharashtra',
    pincode: input.pincode ?? null,
    created_by: user.id,
  };

  const { data, error } = await client
    .from('patients')
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePatient(
  client: AgadaClient,
  id: string,
  patch: Partial<CreatePatientInput>,
): Promise<Patient> {
  const update: PatientUpdate = {};
  if (patch.fullName !== undefined) update.full_name = patch.fullName;
  if (patch.age !== undefined) update.age = patch.age;
  if (patch.gender !== undefined) update.gender = patch.gender;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.village !== undefined) update.village = patch.village;
  if (patch.address !== undefined) update.address = patch.address;
  if (patch.emergencyContact !== undefined)
    update.emergency_contact = patch.emergencyContact;
  if (patch.district !== undefined) update.district = patch.district;
  if (patch.state !== undefined) update.state = patch.state;
  if (patch.pincode !== undefined) update.pincode = patch.pincode;

  const { data, error } = await client
    .from('patients')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
