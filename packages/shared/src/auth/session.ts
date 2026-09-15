// ============================================================================
// Auth helpers — resolve current user and role from Supabase.
// ============================================================================

import type { AgadaClient } from '../supabase/client.js';

export type UserRole = 'ADMIN' | 'HEALTH_WORKER' | 'DOCTOR';

export interface SessionProfile {
  userId: string;
  email: string | undefined;
  role: UserRole;
  fullName: string | null;
}

/**
 * Fetch the current authenticated user + their profile role.
 * Returns null if no session.
 */
export async function getSessionProfile(client: AgadaClient): Promise<SessionProfile | null> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    userId: user.id,
    email: user.email ?? undefined,
    role: profile.role as UserRole,
    fullName: profile.full_name,
  };
}

/**
 * Sign in and return the resulting profile.
 * Throws on invalid credentials or missing profile row.
 */
export async function signIn(
  client: AgadaClient,
  email: string,
  password: string
): Promise<SessionProfile> {
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) throw signInError;

  const profile = await getSessionProfile(client);
  if (!profile) {
    throw new Error('Signed in but no profile row found for this user.');
  }

  return profile;
}

export async function signOut(client: AgadaClient): Promise<void> {
  await client.auth.signOut();
}

/**
 * Route helper — where to send a user after login.
 */
export function dashboardPathFor(role: UserRole): string {
  switch (role) {
    case 'HEALTH_WORKER':
      return '/asha';
    case 'DOCTOR':
      return '/doctor';
    case 'ADMIN':
      return '/admin';
  }
}
