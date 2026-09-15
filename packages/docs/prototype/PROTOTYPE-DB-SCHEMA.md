# Agada — Prototype Database Schema

## SIH Internal Evaluation — 30 September 2026

---

## 1. Purpose

This document defines the physical PostgreSQL database schema for the Agada prototype.

It translates the conceptual model defined in [`PROTOTYPE-ERD.md`](./PROTOTYPE-ERD.md) into an implementation-ready database contract.

The schema supports the prototype workflows defined in [`GOLDEN-WORKFLOWS.md`](./GOLDEN-WORKFLOWS.md):

```text
Authentication
      ↓
Patient Registration
      ↓
Clinical Encounter
      ↓
Symptoms + Vitals
      ↓
Triage
      ↓
Risk Classification
      ↓
Referral
      ↓
Doctor Review
      ↓
Clinical Outcome
      ↓
Closed-Loop Feedback
      ↓
Offline Synchronization
```

This schema is intentionally limited to the September 30 prototype and is not the complete production Agada database.

---

# 2. Database Technology

| Property              | Decision                      |
| --------------------- | ----------------------------- |
| Database              | PostgreSQL                    |
| Primary Key           | UUID                          |
| UUID Generation       | `gen_random_uuid()`           |
| Timezone              | UTC                           |
| Timestamp Type        | `TIMESTAMPTZ`                 |
| JSON Data             | `JSONB`                       |
| Character Encoding    | UTF-8                         |
| Migration Strategy    | Version-controlled migrations |
| Referential Integrity | PostgreSQL foreign keys       |

All application timestamps should be stored in UTC.

The client may convert timestamps to the user's local timezone for display.

---

# 3. Naming Conventions

### Tables

Use lowercase `snake_case` plural names.

```text
users
patients
patient_vitals
medical_records
triage_assessments
```

### Columns

Use lowercase `snake_case`.

```text
created_at
updated_at
patient_id
recorded_by
risk_level
```

### Primary Keys

Use:

```text
id
```

with:

```sql
UUID PRIMARY KEY
```

### Foreign Keys

Use:

```text
<entity>_id
```

Examples:

```text
patient_id
doctor_id
facility_id
referral_id
```

---

# 4. UUID Strategy

All primary keys use PostgreSQL UUIDs.

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

UUIDs are preferred because Agada is designed for distributed and offline-capable workflows.

They also avoid requiring clients to obtain sequential server-generated identifiers before creating records.

---

# 5. Enumerations

The prototype should use PostgreSQL enums for values that have a small, stable set of states.

---

## 5.1 User Role

```sql
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'HEALTH_WORKER',
    'DOCTOR'
);
```

---

## 5.2 Health Worker Type

```sql
CREATE TYPE health_worker_type AS ENUM (
    'ASHA',
    'ANM'
);
```

---

## 5.3 Facility Type

```sql
CREATE TYPE facility_type AS ENUM (
    'PHC',
    'CHC',
    'DISTRICT_HOSPITAL',
    'HOSPITAL'
);
```

---

## 5.4 Risk Level

```sql
CREATE TYPE risk_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);
```

---

## 5.5 Referral Status

```sql
CREATE TYPE referral_status AS ENUM (
    'CREATED',
    'ACCEPTED',
    'IN_REVIEW',
    'CONSULTATION',
    'COMPLETED',
    'REJECTED',
    'CANCELLED'
);
```

---

## 5.6 Referral Urgency

```sql
CREATE TYPE referral_urgency AS ENUM (
    'ROUTINE',
    'URGENT',
    'EMERGENCY'
);
```

---

## 5.7 Sync Status

```sql
CREATE TYPE sync_status AS ENUM (
    'PENDING',
    'SYNCING',
    'SYNCED',
    'FAILED'
);
```

---

## 5.8 Sync Operation

```sql
CREATE TYPE sync_operation AS ENUM (
    'CREATE',
    'UPDATE'
);
```

---

## 5.9 Medical Record Status

```sql
CREATE TYPE medical_record_status AS ENUM (
    'ACTIVE',
    'AMENDED',
    'CANCELLED'
);
```

---

# 6. Table: `users`

Central identity and authentication table.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,

    password_hash TEXT NOT NULL,

    role user_role NOT NULL,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Constraints

* `email` must be unique when provided.
* `phone` must be unique when provided.
* `password_hash` must never contain plaintext passwords.
* `role` is mandatory.

### Indexes

```sql
CREATE INDEX idx_users_role
ON users(role);

CREATE INDEX idx_users_active
ON users(is_active);
```

---

# 7. Table: `facilities`

Represents healthcare facilities participating in the prototype.

```sql
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    facility_type facility_type NOT NULL,

    address TEXT,
    village VARCHAR(150),
    district VARCHAR(150),
    state VARCHAR(150),
    pincode VARCHAR(10),

    phone VARCHAR(20),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_facilities_type
ON facilities(facility_type);

CREATE INDEX idx_facilities_district
ON facilities(district);

CREATE INDEX idx_facilities_active
ON facilities(is_active);
```

---

# 8. Table: `health_workers`

ASHA/ANM-specific profile.

```sql
CREATE TABLE health_workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    facility_id UUID
        REFERENCES facilities(id)
        ON DELETE SET NULL,

    worker_type health_worker_type NOT NULL,

    employee_code VARCHAR(100) UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Relationship

```text
users 1 ───── 0..1 health_workers
```

A health worker profile cannot exist without a corresponding user.

---

# 9. Table: `doctors`

Doctor-specific profile.

```sql
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    facility_id UUID
        REFERENCES facilities(id)
        ON DELETE SET NULL,

    registration_number VARCHAR(100) NOT NULL UNIQUE,

    specialization VARCHAR(150),

    qualification VARCHAR(255),

    experience_years INTEGER,

    is_available BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT doctors_experience_non_negative
        CHECK (experience_years IS NULL OR experience_years >= 0)
);
```

### Indexes

```sql
CREATE INDEX idx_doctors_facility
ON doctors(facility_id);

CREATE INDEX idx_doctors_specialization
ON doctors(specialization);

CREATE INDEX idx_doctors_available
ON doctors(is_available);
```

---

# 10. Table: `patients`

Stores patient identity and demographic information.

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_code VARCHAR(50) NOT NULL UNIQUE,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),

    date_of_birth DATE,

    gender VARCHAR(30),

    phone VARCHAR(20),

    address TEXT,
    village VARCHAR(150),
    district VARCHAR(150),
    state VARCHAR(150),
    pincode VARCHAR(10),

    blood_group VARCHAR(10),

    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(20),

    health_id VARCHAR(100),

    consent_given BOOLEAN NOT NULL DEFAULT FALSE,

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Important Design Rule

The patient table should contain relatively stable patient identity information.

Clinical measurements should **not** be stored here.

For example:

```text
❌ patients.temperature
❌ patients.heart_rate
❌ patients.weight
```

Instead:

```text
patients
    ↓
patient_vitals
```

### Indexes

```sql
CREATE INDEX idx_patients_phone
ON patients(phone);

CREATE INDEX idx_patients_name
ON patients(first_name, last_name);

CREATE INDEX idx_patients_health_id
ON patients(health_id);

CREATE INDEX idx_patients_district
ON patients(district);
```

---

# 11. Table: `patient_vitals`

Stores historical vital measurements.

```sql
CREATE TABLE patient_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES patients(id)
        ON DELETE CASCADE,

    recorded_by UUID NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    temperature_celsius DECIMAL(4,1),

    heart_rate INTEGER,

    respiratory_rate INTEGER,

    systolic_bp INTEGER,
    diastolic_bp INTEGER,

    oxygen_saturation DECIMAL(5,2),

    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),

    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT patient_vitals_temperature_valid
        CHECK (
            temperature_celsius IS NULL
            OR temperature_celsius BETWEEN 25 AND 50
        ),

    CONSTRAINT patient_vitals_heart_rate_valid
        CHECK (
            heart_rate IS NULL
            OR heart_rate BETWEEN 20 AND 250
        ),

    CONSTRAINT patient_vitals_respiratory_rate_valid
        CHECK (
            respiratory_rate IS NULL
            OR respiratory_rate BETWEEN 5 AND 100
        ),

    CONSTRAINT patient_vitals_oxygen_valid
        CHECK (
            oxygen_saturation IS NULL
            OR oxygen_saturation BETWEEN 0 AND 100
        )
);
```

### Index

```sql
CREATE INDEX idx_patient_vitals_patient_time
ON patient_vitals(patient_id, recorded_at DESC);
```

---

# 12. Table: `medical_records`

Represents a healthcare encounter.

```sql
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES patients(id)
        ON DELETE CASCADE,

    recorded_by UUID NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    encounter_type VARCHAR(50) NOT NULL,

    chief_complaint TEXT,

    symptoms TEXT,

    clinical_observations TEXT,

    record_status medical_record_status
        NOT NULL DEFAULT 'ACTIVE',

    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Index

```sql
CREATE INDEX idx_medical_records_patient_time
ON medical_records(patient_id, recorded_at DESC);

CREATE INDEX idx_medical_records_status
ON medical_records(record_status);
```

---

# 13. Table: `triage_assessments`

Stores the result of a triage process.

```sql
CREATE TABLE triage_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES patients(id)
        ON DELETE CASCADE,

    medical_record_id UUID
        REFERENCES medical_records(id)
        ON DELETE SET NULL,

    assessed_by UUID NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    risk_level risk_level NOT NULL,

    score INTEGER,

    recommendation TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',

    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_triage_patient_time
ON triage_assessments(patient_id, assessed_at DESC);

CREATE INDEX idx_triage_risk
ON triage_assessments(risk_level);

CREATE INDEX idx_triage_record
ON triage_assessments(medical_record_id);
```

---

# 14. Table: `triage_responses`

Stores individual answers contributing to a triage assessment.

```sql
CREATE TABLE triage_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL
        REFERENCES triage_assessments(id)
        ON DELETE CASCADE,

    question_code VARCHAR(100) NOT NULL,

    question TEXT NOT NULL,

    response TEXT,

    score INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Index

```sql
CREATE INDEX idx_triage_responses_assessment
ON triage_responses(assessment_id);
```

---

# 15. Table: `referrals`

Represents a patient referral.

```sql
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES patients(id)
        ON DELETE RESTRICT,

    triage_assessment_id UUID
        REFERENCES triage_assessments(id)
        ON DELETE SET NULL,

    referred_by UUID NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    referring_facility_id UUID
        REFERENCES facilities(id)
        ON DELETE SET NULL,

    receiving_facility_id UUID
        REFERENCES facilities(id)
        ON DELETE SET NULL,

    assigned_doctor_id UUID
        REFERENCES doctors(id)
        ON DELETE SET NULL,

    urgency referral_urgency NOT NULL,

    reason TEXT NOT NULL,

    status referral_status NOT NULL DEFAULT 'CREATED',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_referrals_patient
ON referrals(patient_id);

CREATE INDEX idx_referrals_status
ON referrals(status);

CREATE INDEX idx_referrals_receiving_facility
ON referrals(receiving_facility_id);

CREATE INDEX idx_referrals_doctor
ON referrals(assigned_doctor_id);

CREATE INDEX idx_referrals_created_at
ON referrals(created_at DESC);
```

---

# 16. Table: `referral_events`

Maintains the referral lifecycle history.

```sql
CREATE TABLE referral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    referral_id UUID NOT NULL
        REFERENCES referrals(id)
        ON DELETE CASCADE,

    event_type VARCHAR(50) NOT NULL,

    previous_status referral_status,

    new_status referral_status,

    performed_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Index

```sql
CREATE INDEX idx_referral_events_referral_time
ON referral_events(referral_id, created_at ASC);
```

---

# 17. Table: `clinical_notes`

Stores doctor consultation information.

```sql
CREATE TABLE clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES patients(id)
        ON DELETE RESTRICT,

    referral_id UUID
        REFERENCES referrals(id)
        ON DELETE SET NULL,

    doctor_id UUID NOT NULL
        REFERENCES doctors(id)
        ON DELETE RESTRICT,

    consultation_notes TEXT NOT NULL,

    treatment_plan TEXT,

    follow_up_instructions TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_clinical_notes_patient_time
ON clinical_notes(patient_id, created_at DESC);

CREATE INDEX idx_clinical_notes_referral
ON clinical_notes(referral_id);

CREATE INDEX idx_clinical_notes_doctor
ON clinical_notes(doctor_id);
```

---

# 18. Table: `diagnoses`

Stores diagnoses associated with clinical care.

```sql
CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES patients(id)
        ON DELETE RESTRICT,

    clinical_note_id UUID
        REFERENCES clinical_notes(id)
        ON DELETE SET NULL,

    diagnosis_code VARCHAR(50),

    diagnosis_name VARCHAR(255) NOT NULL,

    diagnosis_type VARCHAR(30),

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_diagnoses_patient
ON diagnoses(patient_id);

CREATE INDEX idx_diagnoses_clinical_note
ON diagnoses(clinical_note_id);
```

---

# 19. Table: `sync_records`

Tracks client-to-server synchronization.

```sql
CREATE TABLE sync_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    entity_type VARCHAR(100) NOT NULL,

    entity_id UUID NOT NULL,

    operation sync_operation NOT NULL,

    sync_status sync_status NOT NULL DEFAULT 'PENDING',

    client_timestamp TIMESTAMPTZ NOT NULL,

    server_timestamp TIMESTAMPTZ,

    error_message TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_sync_user_status
ON sync_records(user_id, sync_status);

CREATE INDEX idx_sync_entity
ON sync_records(entity_type, entity_id);

CREATE INDEX idx_sync_pending
ON sync_records(sync_status, created_at);
```

---

# 20. Table: `audit_logs`

Stores important security and operational events.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    action VARCHAR(100) NOT NULL,

    entity_type VARCHAR(100),

    entity_id UUID,

    metadata JSONB,

    ip_address INET,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_audit_logs_user_time
ON audit_logs(user_id, created_at DESC);

CREATE INDEX idx_audit_logs_entity
ON audit_logs(entity_type, entity_id);

CREATE INDEX idx_audit_logs_action
ON audit_logs(action);
```

---

# 21. Foreign-Key Deletion Policy

The prototype uses different deletion policies based on the importance of historical healthcare information.

### `CASCADE`

Use when child data has no meaningful existence without its parent.

Examples:

```text
patients
  ↓
patient_vitals

triage_assessments
  ↓
triage_responses

referrals
  ↓
referral_events
```

### `RESTRICT`

Use for important clinical history that should not disappear accidentally.

Examples:

```text
patient_vitals.recorded_by
medical_records.recorded_by
referrals.referred_by
clinical_notes.doctor_id
```

### `SET NULL`

Use when historical data should remain even if the referenced account/facility is removed or deactivated.

Examples:

```text
patients.created_by
referrals.assigned_doctor_id
audit_logs.user_id
```

In practice, healthcare records should generally be **deactivated/archived rather than physically deleted**.

---

# 22. Soft Delete Policy

The prototype should prefer deactivation over deletion for important entities.

Examples:

```text
users.is_active
facilities.is_active
doctors.is_available
```

Patient and clinical records should not have a normal user-facing hard-delete operation.

If regulatory retention requirements are introduced later, the deletion/retention strategy must be reviewed accordingly.

---

# 23. Timestamp Policy

All server-side timestamps use:

```sql
TIMESTAMPTZ
```

and default to:

```sql
NOW()
```

Examples:

```text
created_at
updated_at
recorded_at
assessed_at
client_timestamp
server_timestamp
```

The server stores UTC.

Clients are responsible for local presentation.

---

# 24. Data Validation

Validation should happen at multiple layers.

```text
Client
  ↓
API Validation
  ↓
Service Validation
  ↓
PostgreSQL Constraints
```

The database must not be treated as the only validation layer.

However, important invariants should still be enforced at the database level.

Examples:

```text
heart_rate > 0
oxygen_saturation between 0 and 100
experience_years >= 0
required foreign keys exist
unique identifiers remain unique
```

---

# 25. Search Strategy

The prototype needs fast access to common healthcare queries.

Primary search fields:

```text
patient_code
phone
health_id
first_name + last_name
```

Therefore indexes should exist for frequently searched identifiers.

For larger datasets, PostgreSQL full-text or trigram search can be introduced later.

The prototype does not require a dedicated Elasticsearch/OpenSearch patient search implementation.

---

# 26. Referral State Integrity

The `referrals.status` column represents the current state.

The `referral_events` table represents the historical state transitions.

Therefore:

```text
referrals.status
```

must always represent the latest valid state.

Every meaningful status transition should create a corresponding `referral_events` record.

Example:

```text
referrals.status:
COMPLETED

referral_events:

CREATED
ACCEPTED
IN_REVIEW
CONSULTATION
COMPLETED
```

The application/service layer should perform the status update and event creation as one transaction where possible.

---

# 27. Triage Integrity

A triage assessment should preserve both:

1. The final result.
2. The inputs used to produce the result.

Therefore:

```text
triage_assessments
        │
        └── triage_responses
```

The prototype should never store only:

```text
HIGH
```

without preserving the relevant assessment inputs.

This supports explainability and future auditing.

---

# 28. Offline Data Integrity

Offline records must not be discarded because synchronization fails.

Expected lifecycle:

```text
LOCAL
  ↓
PENDING
  ↓
SYNCING
  ↓
SYNCED
```

Failure:

```text
SYNCING
   ↓
FAILED
   ↓
RETRY
   ↓
SYNCING
```

The client must retain enough information to retry failed synchronization.

---

# 29. Transaction Boundaries

The following operations should preferably execute transactionally.

### Triage

```text
Create medical record
      +
Create triage assessment
      +
Create triage responses
```

### Referral

```text
Create referral
      +
Create initial referral event
```

### Referral status transition

```text
Update referral status
      +
Create referral event
```

### Consultation

```text
Create clinical note
      +
Create diagnosis
      +
Update referral status
      +
Create referral event
```

This prevents partially completed healthcare workflows.

---

# 30. Prototype Database Ownership

Logical ownership follows the Agada service architecture.

| Service                     | Tables                                          |
| --------------------------- | ----------------------------------------------- |
| Auth Service                | `users`                                         |
| Patient Service             | `patients`, `patient_vitals`, `medical_records` |
| Triage Service              | `triage_assessments`, `triage_responses`        |
| Referral Service            | `referrals`, `referral_events`                  |
| Clinical Layer              | `clinical_notes`, `diagnoses`                   |
| Sync Service                | `sync_records`                                  |
| Platform / Shared           | `audit_logs`                                    |
| Facility / Identity Context | `facilities`, `health_workers`, `doctors`       |

For the prototype, these may initially run within one PostgreSQL instance.

Logical ownership must remain clear so that the system can later move toward independently managed service databases if required.

---

# 31. Migration Structure

Database changes must be version controlled.

Recommended structure:

```text
database/
├── migrations/
│   ├── 001_extensions.sql
│   ├── 002_enums.sql
│   ├── 003_users.sql
│   ├── 004_facilities.sql
│   ├── 005_health_workers.sql
│   ├── 006_doctors.sql
│   ├── 007_patients.sql
│   ├── 008_patient_vitals.sql
│   ├── 009_medical_records.sql
│   ├── 010_triage.sql
│   ├── 011_referrals.sql
│   ├── 012_clinical.sql
│   ├── 013_sync.sql
│   └── 014_audit.sql
│
└── seeds/
    ├── facilities.sql
    ├── users.sql
    └── demo_data.sql
```

The exact migration tooling can be selected based on the ORM/database tooling used by the Agada services.

---

# 32. Seed Data

The prototype should include deterministic demo data.

Recommended seed entities:

```text
1 Admin
1 ASHA worker
1 ANM worker
2 Doctors

2–5 Facilities

3–5 Patients

Several historical encounters

At least one LOW triage case
At least one MEDIUM triage case
At least one HIGH triage case

At least one completed referral
```

Seed data should make the September 30 demonstration reproducible.

---

# 33. Prototype Data Retention

The prototype does not define production healthcare data-retention periods.

Production retention, archival, consent management, legal compliance, and patient-data deletion policies must be defined before deployment in a real healthcare environment.

---

# 34. Deferred Database Entities

The following entities are intentionally excluded:

```text
appointments
doctor_schedules
time_slots

medications
prescriptions
prescription_items

pharmacy_orders

lab_orders
lab_results

billing_records
payment_transactions
insurance_claims

teleconsultations

advanced analytics

government integrations

ABDM resources
FHIR resource storage
```

They should be introduced only when corresponding workflows enter the approved implementation scope.

---

# 35. Schema-to-Workflow Traceability

| Workflow             | Required Tables                                                                    |
| -------------------- | ---------------------------------------------------------------------------------- |
| Authentication       | `users`                                                                            |
| Worker identity      | `users`, `health_workers`, `facilities`                                            |
| Doctor identity      | `users`, `doctors`, `facilities`                                                   |
| Patient registration | `patients`, `users`                                                                |
| Patient search       | `patients`                                                                         |
| Clinical encounter   | `medical_records`                                                                  |
| Vital capture        | `patient_vitals`                                                                   |
| Triage               | `triage_assessments`, `triage_responses`                                           |
| Care pathway         | `triage_assessments`                                                               |
| Referral             | `referrals`, `referral_events`                                                     |
| Doctor review        | `referrals`, `patients`, `medical_records`, `patient_vitals`, `triage_assessments` |
| Consultation         | `clinical_notes`, `diagnoses`                                                      |
| Closed-loop outcome  | `referrals`, `referral_events`, `clinical_notes`, `diagnoses`                      |
| Offline sync         | `sync_records`                                                                     |
| Auditability         | `audit_logs`                                                                       |

---

# 36. Schema Completion Criteria

The database schema is considered ready for implementation when:

* [ ] All P0 workflows have required entities.
* [ ] P1 offline workflow has required synchronization entities.
* [ ] Primary and foreign keys are defined.
* [ ] Required uniqueness constraints are defined.
* [ ] Important validation constraints are defined.
* [ ] Indexes exist for primary search/query paths.
* [ ] Enum values are finalized.
* [ ] Timestamp conventions are finalized.
* [ ] Foreign-key deletion behavior is defined.
* [ ] Migration ordering is defined.
* [ ] Demo seed requirements are defined.
* [ ] Service ownership is documented.
* [ ] No out-of-scope tables have been added.

---

# 37. Final Prototype Schema

The approved prototype schema consists of:

```text
users
facilities
health_workers
doctors

patients
patient_vitals
medical_records

triage_assessments
triage_responses

referrals
referral_events

clinical_notes
diagnoses

sync_records
audit_logs
```

The schema is intentionally designed around the core Agada healthcare journey:

```text
USER
 ↓
PATIENT
 ↓
ENCOUNTER
 ↓
VITALS
 ↓
TRIAGE
 ↓
RISK
 ↓
REFERRAL
 ↓
DOCTOR
 ↓
CLINICAL OUTCOME
 ↓
CLOSED-LOOP FEEDBACK
```

This schema is the **database contract for the September 30 prototype**.

Any database feature outside this contract should require an explicit scope decision before implementation.
