# Agada — Golden Workflows

## SIH Internal Evaluation — 30 September 2026

---

## 1. Purpose

This document defines the primary user journeys that the Agada prototype must demonstrate.

These workflows are called **Golden Workflows** because they represent the smallest set of end-to-end journeys that communicate the core value of Agada.

The prototype should prioritize these workflows over isolated feature demonstrations.

---

# Workflow 1 — Patient Registration and Community Triage

## 1.1 Objective

Allow a Community Health Worker to register or locate a patient and perform an initial clinical assessment.

## 1.2 Actor

**Community Health Worker — ASHA / ANM**

## 1.3 Preconditions

* Worker is authenticated.
* Worker has appropriate permissions.
* Healthcare facility/community context is available.

## 1.4 Flow

```text
Worker Login
     ↓
Patient Search
     ↓
Patient Exists?
   ↙       ↘
 YES       NO
  ↓         ↓
Profile   Register
   \       /
    ↓     ↓
Patient Profile
     ↓
Start Encounter
     ↓
Capture Chief Complaint
     ↓
Capture Symptoms
     ↓
Capture Vital Signs
     ↓
Run Triage
```

## 1.5 System Behavior

The system should:

1. Authenticate the worker.
2. Allow patient search using supported identifiers.
3. Prevent unnecessary duplicate registration where possible.
4. Display the patient's essential information.
5. Create an encounter when clinical information is captured.
6. Store symptoms and observations.
7. Store vital measurements.
8. invoke the triage workflow.
9. Persist the triage assessment.

## 1.6 Data Entities

```text
users
health_workers
patients
medical_records
patient_vitals
triage_assessments
triage_responses
audit_logs
```

## 1.7 Expected Result

The patient has a recorded encounter containing:

* Chief complaint
* Symptoms
* Vital signs
* Triage assessment
* Risk classification

---

# Workflow 2 — Triage to Care Pathway

## 2.1 Objective

Convert captured clinical information into an understandable risk classification and recommended next action.

## 2.2 Actor

**Community Health Worker**

## 2.3 Flow

```text
Symptoms + Vitals
        ↓
Triage Questionnaire
        ↓
Rule Evaluation
        ↓
Risk Score
        ↓
Risk Classification
        ↓
Care Pathway
```

## 2.4 Risk Classification

### LOW

```text
LOW
 ↓
Home Care
 ↓
Follow-up Advice
```

### MEDIUM

```text
MEDIUM
 ↓
PHC Review / Teleconsultation
 ↓
Follow-up
```

### HIGH

```text
HIGH
 ↓
Immediate Referral
 ↓
Receiving Facility
```

## 2.5 Example

```text
Temperature: 39.2°C
Heart Rate: 110 bpm
Severe weakness: YES
Breathing difficulty: NO

             ↓

       Triage Engine

             ↓

        HIGH RISK

             ↓

     Immediate Referral
```

## 2.6 Explainability

The prototype should show the worker why the system reached the result.

Example:

```text
Risk Level: HIGH

Contributing factors:
✓ High temperature
✓ Elevated heart rate
✓ Severe weakness

Recommended action:
Immediate facility referral
```

The prototype should use a transparent rule-based approach rather than presenting an unexplained AI prediction.

## 2.7 Data Entities

```text
medical_records
patient_vitals
triage_assessments
triage_responses
```

## 2.8 Expected Result

The worker receives:

* Risk level
* Triage score/result
* Major contributing factors
* Recommended care pathway

---

# Workflow 3 — Closed-Loop Referral

## 3.1 Objective

Demonstrate that a referral does not end when it is created.

Agada should maintain visibility from:

> **Referral creation → receiving facility → doctor review → consultation → outcome → originating worker**

## 3.2 Actors

* Community Health Worker
* Doctor
* Receiving Facility

## 3.3 Referral Creation

```text
HIGH-RISK PATIENT
       ↓
Worker selects "Refer Patient"
       ↓
Select Receiving Facility
       ↓
Select / Assign Doctor
       ↓
Enter Referral Reason
       ↓
Set Urgency
       ↓
Create Referral
```

## 3.4 Referral Lifecycle

```text
CREATED
   ↓
ACCEPTED
   ↓
IN_REVIEW
   ↓
CONSULTATION
   ↓
COMPLETED
```

Alternative states:

```text
REJECTED
CANCELLED
```

## 3.5 Doctor Workflow

```text
Doctor Login
     ↓
Referral Dashboard
     ↓
Open Referral
     ↓
Review Patient
     ↓
Review Symptoms
     ↓
Review Vitals
     ↓
Review Triage
     ↓
Conduct Consultation
     ↓
Record Clinical Notes
     ↓
Record Diagnosis
     ↓
Record Treatment / Advice
     ↓
Complete Referral
```

## 3.6 Feedback Flow

After completion:

```text
Doctor
  ↓
Referral Outcome
  ↓
Agada
  ↓
Originating Health Worker
  ↓
Outcome Visible
```

Example:

```text
Referral: REF-1023
Status: COMPLETED

Outcome:
Patient evaluated at PHC.

Diagnosis:
Acute febrile illness.

Treatment:
Medication prescribed.

Follow-up:
Review after 3 days.
```

## 3.7 Data Entities

```text
patients
triage_assessments
referrals
referral_events
clinical_notes
diagnoses
users
doctors
facilities
audit_logs
```

## 3.8 Expected Result

The health worker can see that the referral was:

```text
Created → Accepted → Reviewed → Consulted → Completed
```

and can access the resulting outcome.

This demonstrates Agada's **closed-loop referral** capability.

---

# Workflow 4 — Offline Capture and Synchronization

## 4.1 Objective

Demonstrate that temporary loss of network connectivity does not prevent essential healthcare data capture.

## 4.2 Actor

**Community Health Worker**

## 4.3 Preconditions

* Worker has authenticated previously.
* Required patient/encounter information is available locally.

## 4.4 Flow

```text
Network Available
       ↓
Open Patient
       ↓
Start Encounter
       ↓
Network Lost
       ↓
Capture Symptoms
       ↓
Capture Vitals
       ↓
Save Locally
       ↓
Mark as PENDING
       ↓
Network Restored
       ↓
Sync
       ↓
Server Persistence
       ↓
Mark as SYNCED
```

## 4.5 Local State

While offline, records should clearly indicate their synchronization state.

```text
PENDING
SYNCING
SYNCED
FAILED
```

## 4.6 Synchronization

When connectivity is restored:

```text
Local Record
     ↓
Sync Queue
     ↓
Sync Request
     ↓
Server Validation
     ↓
Persistence
     ↓
Synchronization Acknowledgement
     ↓
Local Status = SYNCED
```

## 4.7 Failure Handling

If synchronization fails:

```text
SYNC FAILED
     ↓
Keep Local Record
     ↓
Record Error
     ↓
Retry
```

The local record must not be silently discarded.

## 4.8 Data Entities

```text
patients
medical_records
patient_vitals
triage_assessments
sync_records
```

## 4.9 Expected Result

The worker can demonstrate:

> Data captured during connectivity loss is preserved locally and becomes available on the server after reconnection.

---

# Workflow 5 — Authentication and Authorization

## 5.1 Objective

Demonstrate that Agada provides role-specific access to healthcare workflows.

## 5.2 Authentication

```text
User
 ↓
Login
 ↓
Credentials Validation
 ↓
Authenticated Session
 ↓
Role Resolution
 ↓
Authorized Dashboard
```

## 5.3 Community Health Worker

The worker can access:

```text
Patients
Encounters
Vitals
Triage
Referrals
Referral Outcomes
```

## 5.4 Doctor

The doctor can access:

```text
Referrals
Patients referred to them
Clinical information
Consultations
Diagnoses
Outcomes
```

## 5.5 Administrator

The administrator can access:

```text
Administrative Information
Users
Facilities
Basic System Information
```

## 5.6 Authorization Rule

Authentication answers:

> "Who are you?"

Authorization answers:

> "What are you allowed to do?"

The prototype must enforce both.

---

# 6. Golden Demo Sequence

For the SIH internal presentation, the recommended sequence is:

```text
                AGADA DEMO

                    ↓

              1. Worker Login
                    ↓
             2. Patient Search
                    ↓
             3. Patient Profile
                    ↓
            4. Symptoms + Vitals
                    ↓
               5. Triage
                    ↓
             6. HIGH RISK
                    ↓
           7. Referral Created
                    ↓
          8. Doctor Dashboard
                    ↓
           9. Patient Review
                    ↓
          10. Consultation
                    ↓
        11. Diagnosis + Treatment
                    ↓
          12. Referral Completed
                    ↓
        13. Worker sees Outcome
                    ↓
             CLOSED LOOP ✅
                    ↓
             14. Offline Demo
                    ↓
             15. Synchronization
```

This sequence should be rehearsed as the primary demonstration path.

---

# 7. Failure Scenarios

The prototype should handle common failures gracefully.

### Patient not found

```text
Search
 ↓
No Result
 ↓
Offer Registration
```

### Duplicate patient

```text
Registration
 ↓
Potential duplicate detected
 ↓
Ask worker to verify existing patient
```

### Invalid vital value

```text
Input
 ↓
Validation
 ↓
Invalid
 ↓
Display correction message
```

### Referral creation failure

```text
Create Referral
 ↓
Failure
 ↓
Show error
 ↓
Preserve entered information where possible
```

### Network unavailable

```text
Network Lost
 ↓
Offline Mode
 ↓
Local Capture
```

### Synchronization failure

```text
Sync
 ↓
Failure
 ↓
Record remains local
 ↓
Retry
```

---

# 8. Workflow-to-Service Mapping

| Workflow               | Primary Services                 |
| ---------------------- | -------------------------------- |
| Authentication         | Auth Service                     |
| Patient registration   | Patient Service                  |
| Patient search/profile | Patient Service                  |
| Clinical capture       | Patient Service / Clinical layer |
| Triage                 | Triage Service                   |
| Care pathway           | Triage Service                   |
| Referral               | Referral Service                 |
| Doctor workflow        | Referral + Clinical services     |
| Consultation           | Clinical / Telemed layer         |
| Notifications          | Notification Service             |
| Offline sync           | Sync Service                     |
| Audit                  | Shared / Platform layer          |

The exact service boundaries may evolve during implementation, but the user-facing workflow must remain stable.

---

# 9. Golden Workflow Principle

The prototype should be judged primarily by whether these workflows work **end to end**, not by the number of screens or services implemented.

The core principle is:

> **One patient journey should be traceable from community encounter to clinical outcome.**
