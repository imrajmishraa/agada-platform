# Agada — Prototype Scope

## SIH Internal Evaluation — 30 September 2026

---

## 1. Purpose

This document defines the implementation boundary for the Agada prototype being developed for the SIH internal evaluation on **30 September 2026**.

The prototype is not intended to represent the complete production implementation of Agada. It is a focused, functional vertical slice that demonstrates the platform's most important healthcare workflow:

> **Community Health Worker → Patient → Triage → Risk Classification → Care Pathway → Referral → Doctor → Outcome → Closed-Loop Feedback**

The prototype will prioritize functional depth, workflow continuity, offline-first behavior, and architectural credibility over the number of implemented modules.

---

## 2. Prototype Goal

The prototype must demonstrate that Agada can connect community-level healthcare activities with facility-level clinical decision-making.

The system should allow a Community Health Worker to:

1. Authenticate securely.
2. Register or search for a patient.
3. View essential patient information.
4. Capture symptoms and vital signs.
5. Perform a rule-based triage assessment.
6. Receive a risk classification.
7. Receive a recommended care pathway.
8. Create a referral when required.
9. Track the referral.
10. Receive the eventual outcome.

A doctor should be able to:

1. Authenticate.
2. View incoming referrals.
3. Review patient information.
4. Review symptoms, vitals, and triage results.
5. Conduct a consultation.
6. Record clinical notes and diagnosis.
7. Provide treatment/follow-up instructions.
8. Complete the referral.

The originating health worker should then be able to see the referral outcome.

---

## 3. Prototype Actors

### 3.1 Community Health Worker

Represents ASHA/ANM personnel working at the community level.

Responsibilities:

* Patient registration
* Patient search
* Patient profile access
* Symptom capture
* Vital capture
* Triage initiation
* Viewing risk classification
* Viewing care-pathway recommendation
* Creating referrals
* Tracking referrals
* Viewing referral outcomes

---

### 3.2 Doctor

Represents a doctor working at a PHC, CHC, district hospital, or other participating facility.

Responsibilities:

* View incoming referrals
* Review patient information
* Review triage information
* Review symptoms and vitals
* Conduct consultation
* Record diagnosis
* Record clinical notes
* Record treatment/follow-up instructions
* Update referral status
* Complete referral

---

### 3.3 Administrator

The administrator exists primarily to demonstrate role-based access and basic platform management.

Prototype responsibilities:

* Authenticate
* View basic users/facilities
* Access administrative information
* Demonstrate authorization boundaries

A full administrative management system is outside the prototype scope.

---

## 4. Scope Classification

The prototype uses three priority levels.

### P0 — Must Work

These features are essential to the internal evaluation.

| ID    | Feature                         |
| ----- | ------------------------------- |
| P0-01 | Authentication                  |
| P0-02 | Role-Based Access Control       |
| P0-03 | Patient Registration            |
| P0-04 | Patient Search                  |
| P0-05 | Patient Profile                 |
| P0-06 | Symptom Capture                 |
| P0-07 | Vital Sign Capture              |
| P0-08 | Rule-Based Triage               |
| P0-09 | Risk Classification             |
| P0-10 | Care-Pathway Recommendation     |
| P0-11 | Referral Creation               |
| P0-12 | Referral Tracking               |
| P0-13 | Doctor Referral Dashboard       |
| P0-14 | Clinical Consultation / Outcome |
| P0-15 | Closed-Loop Referral            |

---

### P1 — Should Work

These features strengthen the prototype and demonstrate important Agada characteristics.

| ID    | Feature                            |
| ----- | ---------------------------------- |
| P1-01 | Offline Encounter Capture          |
| P1-02 | Synchronization After Reconnection |
| P1-03 | Basic In-App Notifications         |
| P1-04 | Audit Logging                      |

P1 functionality should be implemented after all P0 workflows are stable.

---

### P2 — Architectural / Demonstration Scope

These capabilities may be represented through architecture, mock data, interfaces, or simulated integrations rather than full production implementations.

| ID    | Capability                           |
| ----- | ------------------------------------ |
| P2-01 | ABDM Integration                     |
| P2-02 | ABHA Integration                     |
| P2-03 | FHIR Interoperability                |
| P2-04 | eSanjeevani Integration              |
| P2-05 | HMIS/RCH Integration                 |
| P2-06 | Advanced Analytics                   |
| P2-07 | AI-Based Clinical Decision Support   |
| P2-08 | Production Telemedicine              |
| P2-09 | Advanced Notification Infrastructure |
| P2-10 | Production Kubernetes Deployment     |
| P2-11 | Advanced Observability               |
| P2-12 | Multi-District Scaling               |

These must not be presented as fully implemented production capabilities if they are only represented architecturally.

---

## 5. In-Scope Components

### Identity and Access

* User authentication
* Password-based authentication
* Role identification
* Role-based authorization
* Basic session/token management

### Patient Management

* Patient registration
* Patient search
* Patient profile
* Essential demographic information
* Emergency contact
* Basic health identifier information
* Consent status

### Clinical Capture

* Symptoms
* Chief complaint
* Clinical observations
* Vital signs
* Encounter records

### Triage

* Triage questionnaire
* Rule-based scoring
* Risk classification
* Explainable triage result
* Care-pathway recommendation

Supported prototype risk levels:

```text
LOW
MEDIUM
HIGH
```

### Referral

* Referral creation
* Referral reason
* Referral urgency
* Receiving facility
* Assigned doctor
* Referral status
* Referral event history
* Referral completion

### Doctor Workflow

* Referral dashboard
* Patient review
* Triage review
* Consultation
* Diagnosis
* Clinical notes
* Treatment/follow-up instructions

### Offline Capability

* Local capture of essential encounter data
* Pending synchronization state
* Synchronization after connectivity is restored
* Basic sync status visibility

### Platform Support

* Basic notifications
* Audit logs
* Error handling
* Basic service health monitoring

---

## 6. Core Prototype Journey

The primary demonstration journey is:

```text
Health Worker Login
        ↓
Search / Register Patient
        ↓
Open Patient Profile
        ↓
Capture Symptoms
        ↓
Capture Vital Signs
        ↓
Run Triage
        ↓
Risk Classification
        ↓
Care-Pathway Recommendation
        ↓
┌───────────────┬─────────────────┬─────────────────┐
│ LOW           │ MEDIUM          │ HIGH            │
│               │                 │                 │
│ Home Care     │ PHC Review /    │ Immediate       │
│ + Follow-up   │ Teleconsult     │ Referral        │
└───────────────┴─────────────────┴─────────────────┘
                                      ↓
                              Referral Created
                                      ↓
                               Doctor Dashboard
                                      ↓
                              Patient Review
                                      ↓
                                Consultation
                                      ↓
                              Diagnosis / Notes
                                      ↓
                            Treatment / Follow-up
                                      ↓
                             Referral Completed
                                      ↓
                         Outcome visible to Worker
```

---

## 7. Offline Demonstration Journey

The prototype should demonstrate the following scenario:

```text
Network Available
      ↓
Patient encounter opened
      ↓
Network unavailable
      ↓
Symptoms + vitals captured locally
      ↓
Local record marked PENDING
      ↓
Network restored
      ↓
Synchronization triggered
      ↓
Server receives data
      ↓
Record marked SYNCED
```

The prototype does not require production-grade distributed conflict resolution.

---

## 8. Out of Scope

The following are explicitly excluded from the core September prototype:

* Billing
* Payment processing
* Insurance claims
* Complete pharmacy management
* Complete laboratory management
* Advanced appointment scheduling
* Production-grade video consultation
* Medical device integrations
* Ambulance/EMS integration
* Advanced AI diagnosis
* Predictive ML models
* Advanced analytics
* Production ABDM integration
* Production eSanjeevani integration
* Production HMIS/RCH integration
* Full government-system synchronization
* Multi-region disaster recovery
* Production Kubernetes orchestration
* Large-scale performance testing
* Full patient self-service application

These remain part of the larger Agada roadmap.

---

## 9. Prototype Quality Requirements

The prototype should satisfy the following:

### Functional

Every P0 workflow must complete successfully.

### Reliability

A failed request must not silently corrupt or lose patient data.

### Security

* Authentication required for protected operations.
* Role-based authorization enforced.
* Passwords must never be stored in plaintext.
* Sensitive operations should be auditable.

### Offline

Essential field data should remain available during temporary connectivity loss.

### Explainability

Triage results should expose the major factors that contributed to the risk classification.

### Usability

The main healthcare workflow should require minimal navigation and be understandable to a non-technical user.

---

## 10. Implementation Rule

The prototype follows one fundamental rule:

> **Complete the core workflow before expanding the number of modules.**

Development priority:

```text
P0 → stabilize → P1 → polish → P2 demonstration
```

The team should not sacrifice the primary end-to-end workflow in order to partially implement additional modules.

---

## 11. Definition of Done

The prototype is considered functionally complete when the following scenario can be demonstrated without manual database manipulation:

```text
1. Health worker logs in.
2. Health worker registers/searches a patient.
3. Patient profile is opened.
4. Symptoms are recorded.
5. Vital signs are recorded.
6. Triage is performed.
7. Risk level is generated.
8. Care pathway is recommended.
9. Referral is created when required.
10. Doctor receives the referral.
11. Doctor reviews patient information.
12. Doctor records consultation.
13. Doctor records diagnosis/outcome.
14. Referral is completed.
15. Health worker can view the outcome.
```

Additionally:

```text
16. Encounter data can be captured offline.
17. Pending data is synchronized after reconnection.
```

No core step should require direct database editing during the demonstration.

---

## 12. Prototype Boundary

The prototype represents the **functional core of Agada**, not the complete product.

The architectural vision remains larger:

```text
Community
    ↓
ASHA / ANM
    ↓
PHC / CHC
    ↓
District Hospital
    ↓
Specialist
    ↓
Lab / Pharmacy
    ↓
Government Healthcare Ecosystem
```

The September prototype implements only the most important connected slice of this ecosystem while keeping the architecture extensible for future expansion.
