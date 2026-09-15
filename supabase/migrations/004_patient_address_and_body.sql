-- Extend patients with proper address fields
alter table public.patients
  add column district text,
  add column state text default 'Maharashtra',
  add column pincode text;

-- Extend vitals with body measurements
alter table public.patient_vitals
  add column height_cm numeric(5,1),
  add column weight_kg numeric(5,1),
  add column bmi numeric(4,1);

-- Index for village+district filtering (used in referral routing)
create index idx_patients_village_district
  on public.patients(village, district);
