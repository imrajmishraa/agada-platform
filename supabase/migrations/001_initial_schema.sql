-- =====================================================
-- Agada Prototype — Initial Schema
-- Migration: 001_initial_schema
-- Creates: enums + 15 application-owned tables
-- References: auth.users (Supabase Auth)
-- =====================================================

-- ---------- ENUMS ----------

create type public.user_role as enum (
  'ADMIN',
  'HEALTH_WORKER',
  'DOCTOR'
);

create type public.risk_level as enum (
  'LOW',
  'MEDIUM',
  'HIGH'
);

create type public.referral_status as enum (
  'CREATED',
  'ACCEPTED',
  'IN_REVIEW',
  'CONSULTATION',
  'COMPLETED',
  'REJECTED',
  'CANCELLED'
);

create type public.sync_status as enum (
  'PENDING',
  'SYNCING',
  'SYNCED',
  'FAILED'
);

create type public.encounter_status as enum (
  'OPEN',
  'CLOSED',
  'CANCELLED'
);

-- ---------- IDENTITY ----------

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         public.user_role not null,
  full_name    text,
  phone        text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.facilities (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  type         text, -- 'SUBCENTER' | 'PHC' | 'CHC' | 'DISTRICT_HOSPITAL'
  village      text,
  district     text,
  state        text,
  created_at   timestamptz not null default now()
);

create table public.health_workers (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  facility_id  uuid references public.facilities(id),
  worker_type  text, -- 'ASHA' | 'ANM' | 'MPW'
  created_at   timestamptz not null default now()
);

create table public.doctors (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  facility_id     uuid references public.facilities(id),
  specialization  text,
  created_at      timestamptz not null default now()
);

-- ---------- PATIENTS + ENCOUNTERS ----------

create table public.patients (
  id                 uuid primary key default gen_random_uuid(),
  full_name          text not null,
  age                int,
  gender             text,
  phone              text,
  village            text,
  address            text,
  emergency_contact  text,
  created_by         uuid references public.profiles(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.encounters (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid not null references public.patients(id) on delete cascade,
  health_worker_id  uuid references public.health_workers(id),
  facility_id       uuid references public.facilities(id),
  encounter_type    text, -- 'HOME_VISIT' | 'PHC' | 'TELECONSULT' | 'FOLLOWUP'
  status            public.encounter_status not null default 'OPEN',
  notes             text,
  started_at        timestamptz not null default now(),
  closed_at         timestamptz
);

create table public.patient_vitals (
  id                uuid primary key default gen_random_uuid(),
  encounter_id      uuid not null references public.encounters(id) on delete cascade,
  temperature_c     numeric(4,1),
  heart_rate        int,
  bp_systolic       int,
  bp_diastolic      int,
  spo2              int,
  respiratory_rate  int,
  recorded_at       timestamptz not null default now()
);

-- ---------- TRIAGE ----------

create table public.triage_assessments (
  id              uuid primary key default gen_random_uuid(),
  encounter_id    uuid not null references public.encounters(id) on delete cascade,
  risk_level      public.risk_level not null,
  care_pathway    text, -- 'HOME_CARE' | 'PHC' | 'TELECONSULT' | 'URGENT_REFERRAL'
  reasoning       text,
  assessed_by     uuid references public.profiles(id),
  assessed_at     timestamptz not null default now()
);

create table public.triage_responses (
  id              uuid primary key default gen_random_uuid(),
  assessment_id   uuid not null references public.triage_assessments(id) on delete cascade,
  symptom_code    text not null,
  present         boolean not null default false,
  severity        text
);

-- ---------- REFERRALS ----------

create table public.referrals (
  id                    uuid primary key default gen_random_uuid(),
  patient_id            uuid not null references public.patients(id) on delete cascade,
  encounter_id          uuid not null references public.encounters(id) on delete cascade,
  source_facility_id    uuid references public.facilities(id),
  destination_facility_id uuid references public.facilities(id),
  reason                text,
  urgency               text, -- 'ROUTINE' | 'URGENT' | 'EMERGENCY'
  status                public.referral_status not null default 'CREATED',
  created_by            uuid references public.profiles(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table public.referral_events (
  id            uuid primary key default gen_random_uuid(),
  referral_id   uuid not null references public.referrals(id) on delete cascade,
  from_status   public.referral_status,
  to_status     public.referral_status not null,
  actor_id      uuid references public.profiles(id),
  comment       text,
  created_at    timestamptz not null default now()
);

-- ---------- CLINICAL ----------

create table public.clinical_notes (
  id            uuid primary key default gen_random_uuid(),
  encounter_id  uuid not null references public.encounters(id) on delete cascade,
  referral_id   uuid references public.referrals(id) on delete set null,
  author_id     uuid references public.profiles(id),
  note_type     text, -- 'CONSULTATION' | 'DIAGNOSIS' | 'FOLLOWUP'
  content       text not null,
  created_at    timestamptz not null default now()
);

create table public.diagnoses (
  id            uuid primary key default gen_random_uuid(),
  encounter_id  uuid not null references public.encounters(id) on delete cascade,
  icd10_code    text,
  description   text not null,
  confirmed_by  uuid references public.profiles(id),
  created_at    timestamptz not null default now()
);

-- ---------- SYNC + AUDIT ----------

create table public.sync_records (
  id              uuid primary key default gen_random_uuid(),
  entity_type     text not null, -- 'patient' | 'encounter' | 'vital' | 'triage' ...
  entity_id       uuid not null,
  local_id        text,
  status          public.sync_status not null default 'PENDING',
  payload         jsonb,
  error           text,
  device_id       text,
  created_at      timestamptz not null default now(),
  synced_at       timestamptz
);

create table public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.profiles(id),
  action       text not null,
  entity_type  text,
  entity_id    uuid,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);