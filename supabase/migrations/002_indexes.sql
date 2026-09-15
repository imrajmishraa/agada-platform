-- =====================================================
-- Agada Prototype — Indexes
-- Migration: 002_indexes
-- =====================================================

create index idx_profiles_role              on public.profiles(role);
create index idx_health_workers_profile     on public.health_workers(profile_id);
create index idx_health_workers_facility    on public.health_workers(facility_id);
create index idx_doctors_profile            on public.doctors(profile_id);
create index idx_doctors_facility           on public.doctors(facility_id);

create index idx_patients_name              on public.patients(full_name);
create index idx_patients_village           on public.patients(village);
create index idx_patients_phone             on public.patients(phone);

create index idx_encounters_patient         on public.encounters(patient_id);
create index idx_encounters_status          on public.encounters(status);
create index idx_encounters_started         on public.encounters(started_at desc);

create index idx_vitals_encounter           on public.patient_vitals(encounter_id);

create index idx_triage_encounter           on public.triage_assessments(encounter_id);
create index idx_triage_risk                on public.triage_assessments(risk_level);
create index idx_triage_responses_assessment on public.triage_responses(assessment_id);

create index idx_referrals_patient          on public.referrals(patient_id);
create index idx_referrals_encounter        on public.referrals(encounter_id);
create index idx_referrals_status           on public.referrals(status);
create index idx_referrals_urgency          on public.referrals(urgency);
create index idx_referral_events_referral   on public.referral_events(referral_id);

create index idx_clinical_notes_encounter   on public.clinical_notes(encounter_id);
create index idx_diagnoses_encounter        on public.diagnoses(encounter_id);

create index idx_sync_status                on public.sync_records(status);
create index idx_sync_entity                on public.sync_records(entity_type, entity_id);
create index idx_sync_device                on public.sync_records(device_id);

create index idx_audit_actor                on public.audit_logs(actor_id);
create index idx_audit_entity               on public.audit_logs(entity_type, entity_id);
create index idx_audit_created              on public.audit_logs(created_at desc);