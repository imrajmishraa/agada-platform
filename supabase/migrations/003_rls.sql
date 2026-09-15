-- =====================================================
-- Agada Prototype — Row Level Security
-- Migration: 003_rls
-- =====================================================

-- Enable RLS on all application tables
alter table public.profiles            enable row level security;
alter table public.facilities          enable row level security;
alter table public.health_workers      enable row level security;
alter table public.doctors             enable row level security;
alter table public.patients            enable row level security;
alter table public.encounters          enable row level security;
alter table public.patient_vitals      enable row level security;
alter table public.triage_assessments  enable row level security;
alter table public.triage_responses    enable row level security;
alter table public.referrals           enable row level security;
alter table public.referral_events     enable row level security;
alter table public.clinical_notes      enable row level security;
alter table public.diagnoses           enable row level security;
alter table public.sync_records        enable row level security;
alter table public.audit_logs          enable row level security;

-- ---------- Helper: current user's role ----------
create or replace function public.current_role()
returns public.user_role
language sql stable security definer
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ---------- profiles ----------
create policy "profiles self read"
  on public.profiles for select
  using (id = auth.uid() or public.current_role() = 'ADMIN');

create policy "profiles self update"
  on public.profiles for update
  using (id = auth.uid() or public.current_role() = 'ADMIN');

-- ---------- patients ----------
create policy "staff read patients"
  on public.patients for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

create policy "health workers create patients"
  on public.patients for insert
  with check (public.current_role() in ('HEALTH_WORKER','ADMIN'));

create policy "staff update patients"
  on public.patients for update
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

-- ---------- encounters + clinical data ----------
create policy "staff read encounters"
  on public.encounters for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

create policy "health workers write encounters"
  on public.encounters for insert
  with check (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

create policy "health workers update encounters"
  on public.encounters for update
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

-- Repeat the same access pattern for the child tables
create policy "staff read vitals" on public.patient_vitals for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));
create policy "staff write vitals" on public.patient_vitals for insert
  with check (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

create policy "staff read triage" on public.triage_assessments for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));
create policy "staff write triage" on public.triage_assessments for insert
  with check (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

create policy "staff read triage responses" on public.triage_responses for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));
create policy "staff write triage responses" on public.triage_responses for insert
  with check (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

create policy "staff read referrals" on public.referrals for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));
create policy "staff write referrals" on public.referrals for insert
  with check (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));
create policy "staff update referrals" on public.referrals for update
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

create policy "staff read referral events" on public.referral_events for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));
create policy "staff write referral events" on public.referral_events for insert
  with check (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

create policy "staff read clinical notes" on public.clinical_notes for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));
create policy "doctors write clinical notes" on public.clinical_notes for insert
  with check (public.current_role() in ('DOCTOR','ADMIN'));

create policy "staff read diagnoses" on public.diagnoses for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));
create policy "doctors write diagnoses" on public.diagnoses for insert
  with check (public.current_role() in ('DOCTOR','ADMIN'));

-- ---------- facilities + workers ----------
create policy "staff read facilities" on public.facilities for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

create policy "staff read health workers" on public.health_workers for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

create policy "staff read doctors" on public.doctors for select
  using (public.current_role() in ('HEALTH_WORKER','DOCTOR','ADMIN'));

-- ---------- sync ----------
create policy "users see own sync records" on public.sync_records for select
  using (public.current_role() in ('HEALTH_WORKER','ADMIN'));
create policy "users insert own sync records" on public.sync_records for insert
  with check (public.current_role() in ('HEALTH_WORKER','ADMIN'));
create policy "users update own sync records" on public.sync_records for update
  using (public.current_role() in ('HEALTH_WORKER','ADMIN'));

-- ---------- audit (write-only for app, read for admin) ----------
create policy "anyone inserts audit" on public.audit_logs for insert
  with check (true);
create policy "admin reads audit" on public.audit_logs for select
  using (public.current_role() = 'ADMIN');

-- ---------- auto-create profile trigger ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'HEALTH_WORKER', -- default; override manually or via invitation flow
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();