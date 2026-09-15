# Agada — Prototype SRS

## SIH Internal Evaluation — 30 September

---

## 1. Purpose

Agada is a digital healthcare platform designed to improve access to timely, coordinated, and continuous healthcare in underserved and rural communities.

The purpose of this prototype is to demonstrate the **core operational workflow of Agada** rather than the complete production platform.

The prototype will demonstrate how a community health worker can register or retrieve a patient, collect essential clinical information, perform an initial triage assessment, and initiate an appropriate care pathway. For higher-risk cases, the system will support referral to an appropriate healthcare facility or doctor and allow the receiving healthcare provider to review the patient's relevant information and record the outcome.

The prototype will also demonstrate Agada's **offline-first approach**, showing how essential healthcare information can be captured without continuous internet connectivity and synchronized when connectivity becomes available.

The prototype is intended for the **SIH internal evaluation on 30 September** and will serve as the foundation for subsequent development of the complete Agada platform.

---

# 2. Problem Statement

Rural and underserved healthcare environments face several interconnected challenges:

* Limited access to doctors and specialists.
* Poor connectivity and unreliable internet access.
* Fragmented patient information across healthcare facilities.
* Delays in identifying high-risk patients.
* Manual and inefficient referral processes.
* Lack of visibility into referral status and patient outcomes.
* Difficulty maintaining continuity of care across facilities.
* Repeated collection of patient information.
* Limited coordination between community health workers, primary healthcare facilities, and higher-level healthcare facilities.
* Existing digital systems may not adequately address the realities of low-connectivity and resource-constrained environments.

A patient may therefore move through multiple levels of the healthcare system without a reliable digital thread connecting those interactions.

Agada aims to address this problem by providing a **connected, offline-capable healthcare workflow** that links community-level screening, triage, referral, consultation, and follow-up.

### Core Problem

The prototype focuses on one central problem:

> **How can a healthcare worker in a low-connectivity environment identify patient risk, initiate the appropriate care pathway, and ensure that the patient's referral and outcome remain connected across the healthcare system?**

---

# 3. Prototype Objective

The primary objective of the prototype is to demonstrate a complete and believable **closed-loop healthcare workflow**.

The prototype must demonstrate:

1. Secure user authentication.
2. Role-based access to healthcare workflows.
3. Patient registration and patient search.
4. Capture of essential patient information.
5. Capture of symptoms and vital signs.
6. Initial triage and risk classification.
7. Appropriate care-pathway recommendation.
8. Referral creation for patients requiring higher-level care.
9. Referral visibility for the receiving healthcare provider.
10. Review of relevant patient information by the receiving provider.
11. Recording of consultation/outcome information.
12. Visibility of referral progress and outcome.
13. Offline capture of essential information.
14. Synchronization of locally captured data after connectivity is restored.

The prototype should demonstrate the complete journey:

```text
Community Health Worker
        ↓
Patient
        ↓
Symptoms + Vitals
        ↓
Triage
        ↓
Risk Classification
        ↓
Care Pathway
   ┌────┼─────────────┐
   ↓    ↓             ↓
Low   Medium         High
   │    │             │
   │    ↓             ↓
   │ Teleconsult   Referral
   │                  ↓
   │             Doctor/Facility
   │                  ↓
   └──────────── Outcome
                       ↓
                  Follow-up
```

The prototype does not need to implement every capability of the complete Agada architecture.

---

# 4. Target Users

The prototype will focus on the following primary users.

## 4.1 Community Health Worker

Examples include:

* ASHA workers
* ANMs
* Community healthcare workers

Primary responsibilities:

* Register or locate patients.
* Capture patient information.
* Record symptoms.
* Record vital signs.
* Initiate triage.
* View risk classification.
* Initiate referrals.
* Track referral status.
* View relevant patient outcomes.

---

## 4.2 Doctor / Healthcare Provider

Primary responsibilities:

* View referred patients.
* Review patient information.
* Review symptoms and vital signs.
* Review triage results.
* Review relevant medical history.
* Conduct or record consultation.
* Provide diagnosis or clinical assessment.
* Record treatment/outcome.
* Update referral status.

---

## 4.3 System Administrator

The administrator is included primarily for system management and demonstration purposes.

Responsibilities may include:

* Managing users.
* Managing healthcare facilities.
* Managing roles and permissions.
* Monitoring system activity.
* Viewing high-level operational information.

The administrator workflow is not the primary focus of the prototype.

---

## 4.4 Future Users

The complete Agada platform may additionally support:

* Specialists
* Pharmacists
* Laboratory technicians
* Hospital administrators
* District healthcare administrators
* Government healthcare systems
* Patients
* Other authorized healthcare workers

These users are outside the primary prototype workflow unless required to demonstrate a specific capability.

---

# 5. Functional Requirements

## FR-01 — Authentication

The system shall provide secure authentication for authorized users.

The prototype shall support at minimum:

* User login.
* Session/token-based authentication.
* Logout.
* Role identification.
* Basic authorization based on user role.

---

## FR-02 — Patient Registration

An authorized healthcare worker shall be able to register a patient.

The system shall capture essential information such as:

* Name.
* Date of birth or age.
* Gender.
* Contact information where available.
* Address/location.
* Emergency contact where applicable.
* Relevant identifiers.

The system should prevent obvious duplicate patient registrations where possible.

---

## FR-03 — Patient Search

Authorized users shall be able to locate an existing patient using available identifiers.

The system should support searching using information such as:

* Patient ID.
* Name.
* Phone number.
* Health identifier where available.

---

## FR-04 — Patient Profile

The system shall provide an authorized view of relevant patient information.

The patient profile should contain:

* Basic demographic information.
* Relevant medical history.
* Allergies where available.
* Previous diagnoses.
* Current/recent medications where applicable.
* Previous clinical records.
* Recent vital signs.
* Previous referrals.

Only information required for the user's role should be exposed.

---

## FR-05 — Vital Sign Capture

The healthcare worker shall be able to record essential vital signs, including where applicable:

* Temperature.
* Heart rate.
* Respiratory rate.
* Blood pressure.
* Oxygen saturation.
* Height.
* Weight.

Each measurement should record:

* Measurement time.
* Person/device responsible for the measurement where available.
* Associated patient.
* Associated clinical encounter/assessment.

---

## FR-06 — Symptom and Clinical Information Capture

The healthcare worker shall be able to record the patient's presenting symptoms and relevant clinical observations.

The prototype shall support structured symptom information where practical while allowing additional notes.

---

## FR-07 — Triage

The system shall provide an initial triage workflow using available patient information.

The triage process shall consider relevant information such as:

* Symptoms.
* Vital signs.
* Basic patient information.
* Configured risk indicators.

The system shall produce an initial risk classification.

At minimum:

```text
LOW
MEDIUM
HIGH
```

The prototype may use a deterministic rule-based triage engine.

AI-assisted triage may be introduced as an enhancement but shall not be required for the core prototype workflow.

---

## FR-08 — Care Pathway Recommendation

Based on the triage result, the system shall recommend an appropriate next step.

Examples:

```text
LOW
→ Basic guidance / routine follow-up

MEDIUM
→ Doctor review / teleconsultation

HIGH
→ Immediate referral / higher-level care
```

The recommendation is intended as a decision-support mechanism and does not replace professional clinical judgment.

---

## FR-09 — Referral Creation

For patients requiring higher-level care, an authorized healthcare worker shall be able to create a referral.

The referral shall contain information such as:

* Patient.
* Referring healthcare worker/facility.
* Receiving facility.
* Relevant specialty.
* Reason for referral.
* Triage/risk level.
* Priority.
* Clinical summary.
* Current status.
* Creation timestamp.

---

## FR-10 — Referral Tracking

The system shall maintain the status of a referral.

Example lifecycle:

```text
CREATED
   ↓
SENT
   ↓
ACCEPTED
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

The system should also support appropriate cancellation/rejection states.

---

## FR-11 — Doctor Referral Dashboard

An authorized doctor shall be able to view incoming referrals.

The dashboard shall provide:

* Patient identification.
* Referral priority.
* Reason for referral.
* Triage result.
* Relevant patient information.
* Referral status.
* Date/time information.

---

## FR-12 — Clinical Consultation / Outcome

The receiving healthcare provider shall be able to record the outcome of a referral.

The prototype should support:

* Clinical notes.
* Diagnosis/assessment.
* Treatment recommendation.
* Prescription information where required.
* Follow-up recommendation.
* Referral completion status.

---

## FR-13 — Closed-Loop Feedback

After the receiving provider completes a referral, the originating healthcare worker should be able to view the relevant outcome.

The workflow shall therefore demonstrate:

```text
Referral Created
      ↓
Receiving Facility
      ↓
Doctor Review
      ↓
Consultation
      ↓
Outcome
      ↓
Originating Healthcare Worker
```

This is a core differentiating capability of the Agada prototype.

---

## FR-14 — Offline Data Capture

The prototype shall demonstrate the ability to capture essential healthcare information when network connectivity is unavailable.

At minimum, the offline workflow should allow:

* Patient information capture.
* Vital capture.
* Symptom/triage information capture.

The data shall be stored locally until connectivity becomes available.

---

## FR-15 — Synchronization

When connectivity is restored, locally captured information shall be synchronized with the server.

The synchronization workflow should:

* Detect pending local changes.
* Upload pending records.
* Confirm successful synchronization.
* Prevent obvious duplicate submissions.
* Maintain synchronization status.

The prototype may use a simplified synchronization strategy while preserving the architecture required for future production implementation.

---

## FR-16 — Notifications

The prototype may provide basic notifications for important events such as:

* New referral.
* Referral acceptance.
* Referral status change.
* Completed consultation.

Notifications may initially be implemented as in-app notifications.

---

## FR-17 — Auditability

Important healthcare workflow actions should record:

* User.
* Action.
* Timestamp.
* Relevant entity.

The prototype should demonstrate basic auditability for critical operations such as patient updates and referral status changes.

---

# 6. Core User Workflows

## Workflow 1 — Patient Registration and Triage

```text
Healthcare Worker Login
        ↓
Patient Search
        ↓
Patient Exists?
   ┌────┴────┐
  YES        NO
   │          │
   │      Register Patient
   │          │
   └────┬─────┘
        ↓
Patient Profile
        ↓
Capture Symptoms
        ↓
Capture Vital Signs
        ↓
Start Triage
        ↓
Risk Classification
```

---

## Workflow 2 — Triage to Care Pathway

```text
Triage
  ↓
Risk Classification
  │
  ├── LOW
  │     ↓
  │  Basic guidance
  │  + follow-up
  │
  ├── MEDIUM
  │     ↓
  │  Doctor review /
  │  teleconsultation
  │
  └── HIGH
        ↓
     Referral
        ↓
   Higher-level facility
```

---

## Workflow 3 — Closed-Loop Referral

```text
Healthcare Worker
        ↓
Create Referral
        ↓
Receiving Facility
        ↓
Doctor Dashboard
        ↓
Review Patient
        ↓
Consultation
        ↓
Diagnosis / Treatment
        ↓
Outcome Recorded
        ↓
Referral Completed
        ↓
Originating Worker
views outcome
```

---

## Workflow 4 — Offline-First Workflow

```text
Internet Available
       ↓
Patient Encounter
       ↓
Network Lost
       ↓
Local Data Capture
       ↓
Local Storage
       ↓
Network Restored
       ↓
Synchronization
       ↓
Server Confirmation
       ↓
Data Available Across System
```

---

## Workflow 5 — Authentication and Authorization

```text
User
 ↓
Login
 ↓
Authentication
 ↓
Role Identification
 ↓
Role-specific Dashboard
 ↓
Authorized Actions
```

---

# 7. Non-Functional Requirements

## NFR-01 — Security

The system shall protect healthcare information through:

* Secure authentication.
* Role-based authorization.
* Password hashing.
* Secure API communication.
* Controlled access to patient information.
* Basic audit logging.

Sensitive information shall not be unnecessarily exposed to unauthorized users.

---

## NFR-02 — Privacy

The prototype shall follow the principle of minimum necessary access.

Users should only access information required for their role and workflow.

Patient information used during demonstration shall preferably be synthetic/demo data.

---

## NFR-03 — Availability

Core healthcare workflows should remain usable under intermittent connectivity.

The offline workflow shall prioritize essential patient and triage information.

---

## NFR-04 — Performance

Core operations such as:

* Login.
* Patient search.
* Patient retrieval.
* Triage submission.
* Referral creation.

should provide responsive interaction under normal prototype conditions.

---

## NFR-05 — Reliability

The system should provide clear error states when:

* A service is unavailable.
* Network connectivity is lost.
* Synchronization fails.
* An invalid operation is attempted.

---

## NFR-06 — Scalability

The architecture shall be designed so that individual services can scale independently as usage grows.

The prototype does not need to demonstrate production-scale load handling.

---

## NFR-07 — Interoperability

The architecture shall remain compatible with future healthcare interoperability requirements, including standards and government healthcare ecosystems where applicable.

Production integration is outside the prototype scope.

---

## NFR-08 — Maintainability

The system shall maintain clear separation between:

* Presentation.
* Application/business logic.
* Domain logic.
* Infrastructure.
* External integrations.

The prototype should remain extensible toward the complete Agada platform.

---

## NFR-09 — Usability

The interface should be usable by healthcare workers with varying levels of technical expertise.

The prototype should prioritize:

* Simple navigation.
* Clear terminology.
* Minimal data entry.
* Large and readable interaction elements.
* Clear status indicators.
* Clear error messages.

---

# 8. Prototype Scope

The September 30 prototype shall focus on the following capabilities.

### Included

```text
✅ Authentication
✅ Role-based access
✅ Healthcare worker workflow
✅ Patient registration
✅ Patient search
✅ Patient profile
✅ Vital sign capture
✅ Symptom capture
✅ Rule-based triage
✅ Risk classification
✅ Care-pathway recommendation
✅ Referral creation
✅ Referral tracking
✅ Doctor referral dashboard
✅ Consultation/outcome recording
✅ Closed-loop referral
✅ Basic offline data capture
✅ Basic synchronization
✅ Basic notifications
✅ Basic audit logging
```

### Prototype priority

The implementation priority shall be:

```text
P0 — Must work for demonstration
──────────────────────────────────
Authentication
Patient
Vitals
Triage
Referral
Doctor workflow
Outcome
Closed-loop flow

P1 — Should work
────────────────
Offline capture
Synchronization
Notifications
Audit logging

P2 — Architecture / simulated
──────────────────────────────
Advanced integrations
Advanced analytics
External healthcare systems
```

The prototype should prioritize **end-to-end functionality over feature quantity**.

---

# 9. Out of Scope

The following capabilities are outside the September 30 prototype unless specifically required later.

## Financial Systems

* Billing management.
* Payment gateway integration.
* Insurance claim processing.
* Insurance verification.
* Financial reconciliation.

## Full Pharmacy Management

* Pharmacy inventory management.
* Pharmacy procurement.
* Complete prescription fulfillment.
* Pharmacy-to-pharmacy operations.

## Full Laboratory Management

* Complete laboratory information management.
* Laboratory inventory.
* Advanced laboratory workflows.
* Production diagnostic integrations.

## Advanced Telemedicine

* Production-grade video consultation.
* Medical device integration.
* Recording and storage of consultations.
* Advanced telemedicine infrastructure.

A basic teleconsultation workflow may be simulated if required for the demonstration.

## Government Integrations

Production integrations with:

* ABDM.
* eSanjeevani.
* HMIS.
* RCH.
* Other government healthcare systems.

may be represented architecturally or through sandbox/mock interfaces during the prototype stage.

## Advanced Analytics

* Predictive population health analytics.
* District-level dashboards.
* Advanced epidemiological modeling.
* Machine-learning based forecasting.

## Advanced AI

AI-assisted capabilities may be demonstrated conceptually or through a controlled prototype implementation, but they are not required for the core healthcare workflow.

Clinical decision-making shall remain under qualified healthcare professionals.

## Production Infrastructure

The following are not required to be production-ready for the internal:

* Kubernetes production deployment.
* Multi-region deployment.
* Production disaster recovery.
* Large-scale load testing.
* Production observability stack.

---

# 10. Success Criteria

The prototype will be considered successful if the team can demonstrate the following complete scenario without relying on disconnected mock screens.

### Primary Success Scenario

```text
1. Healthcare worker logs in.
             ↓
2. Searches/registers a patient.
             ↓
3. Opens patient profile.
             ↓
4. Records symptoms and vital signs.
             ↓
5. Runs triage.
             ↓
6. System identifies patient risk.
             ↓
7. Appropriate care pathway is recommended.
             ↓
8. High-risk patient is referred.
             ↓
9. Doctor receives the referral.
             ↓
10. Doctor reviews patient information.
             ↓
11. Doctor records consultation/outcome.
             ↓
12. Referral is marked completed.
             ↓
13. Originating healthcare worker can
    see the outcome.
```

### Offline Success Scenario

The team should additionally demonstrate:

```text
Network Available
      ↓
Capture patient encounter
      ↓
Network unavailable
      ↓
Capture/update essential information
      ↓
Data remains available locally
      ↓
Network restored
      ↓
Synchronization triggered
      ↓
Server receives the data
```

### Technical Success Criteria

The prototype should demonstrate:

* Core APIs functioning correctly.
* Database persistence.
* Authentication and authorization.
* Service-to-service communication where required.
* Error handling.
* Basic synchronization.
* Stable demo environment.
* No critical errors during the complete demonstration workflow.

### Presentation Success Criteria

The team should be able to clearly explain:

1. The healthcare problem.
2. Why existing approaches are insufficient.
3. How Agada solves the problem.
4. How the prototype demonstrates the solution.
5. Why the architecture can scale to the complete platform.
6. What has been implemented.
7. What remains for future development.

---

# 11. Future Scope

The September 30 prototype is the first vertical slice of the larger Agada platform.

Future development may include:

## Healthcare Expansion

* Complete appointment management.
* Advanced telemedicine.
* Specialist networks.
* Complete laboratory workflows.
* Medicine inventory and pharmacy management.
* Emergency care workflows.
* Ambulance coordination.
* Expanded patient self-service.

## Offline-First Expansion

* Conflict resolution.
* Advanced synchronization.
* Multi-device synchronization.
* Store-and-forward clinical workflows.
* More comprehensive offline functionality.

## Interoperability

* ABDM integration.
* ABHA-based patient identification.
* FHIR-based interoperability.
* eSanjeevani integration.
* Government health system integrations.
* External hospital and laboratory interoperability.

## AI and Decision Support

* Advanced triage assistance.
* Clinical decision support.
* Risk prediction.
* Medical document summarization.
* Intelligent referral recommendations.
* Multilingual healthcare assistance.

AI capabilities shall remain assistive and shall not replace qualified medical professionals.

## Analytics

* Population health dashboards.
* Disease surveillance.
* Referral analytics.
* Facility performance analytics.
* Resource-demand prediction.
* Public-health insights.

## Security and Compliance

* Advanced audit trails.
* Fine-grained authorization.
* Consent management.
* Encryption improvements.
* Comprehensive privacy controls.
* Production compliance and security assessments.

## Scalability

* Kubernetes-based deployment.
* Horizontal service scaling.
* Distributed event processing.
* Multi-district deployment.
* High-availability infrastructure.
* Disaster recovery.

## Ecosystem

Agada may eventually evolve into a broader healthcare coordination platform connecting:

```text
Community
    ↕
PHC / CHC
    ↕
District Hospital
    ↕
Specialist
    ↕
Laboratory
    ↕
Pharmacy
    ↕
Government Healthcare Ecosystem
```

The long-term objective is to establish a **continuous digital thread of care** from the community level to higher-level healthcare services while remaining usable in environments with limited connectivity and infrastructure.
