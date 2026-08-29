# Agada Platform

### Integrated Digital Healthcare Platform for Rural Maharashtra

> **Status:** 🚧 Under Development

Agada is an **offline-first, interoperable digital healthcare platform** designed to improve healthcare access and care coordination across rural and underserved regions of Maharashtra.

---

# Table of Contents

* [Overview](#overview)
* [Core Objectives](#core-objectives)
* [Key Features](#key-features)
* [Architecture](#architecture)

  * [Microservices Architecture](#microservices-architecture)
  * [End-to-End Healthcare Workflow](#end-to-end-healthcare-workflow)
  * [Patient Queue Management](#patient-queue-management)
  * [Medicine & Diagnostic Inventory](#medicine--diagnostic-inventory)
  * [Emergency Teleconsultation](#emergency-teleconsultation)
  * [Closed-Loop Referral](#closed-loop-referral)
  * [Offline-First Triage](#offline-first-triage)
  * [Complete System HLD](#complete-system-hld)
* [Project Structure](#project-structure)
* [Technology Stack](#technology-stack)
* [Quick Start](#quick-start)

---

# Overview

Rural healthcare delivery often faces challenges such as:

* Long distances to specialist healthcare
* Shortage of doctors and specialists
* Limited diagnostic facilities
* Intermittent internet connectivity
* Fragmented patient records
* Delayed referrals
* Poor visibility of medicine availability
* Limited coordination between healthcare facilities

Agada addresses these challenges through an **offline-first architecture combined with centralized healthcare services and interoperability standards**.

The platform connects **ASHAs, ANMs, PHCs, CHCs, rural hospitals, district hospitals, doctors, laboratories, administrators, and external healthcare systems** through a unified digital ecosystem.

---

# Core Objectives

1. Improve rural healthcare accessibility
2. Enable healthcare workflows without continuous internet connectivity
3. Reduce referral delays
4. Improve continuity of patient care
5. Enable low-bandwidth teleconsultation
6. Improve medicine and diagnostic availability
7. Provide healthcare authorities with operational visibility
8. Enable interoperability with government healthcare systems

---

# Key Features

* 📴 **Offline-First Healthcare**
* 📱 **ASHA/ANM Mobile Application**
* 🖥️ **Doctor & Facility Dashboards**
* 🤖 **AI-Assisted Triage**
* 🔄 **Closed-Loop Referral Management**
* 📞 **Low-Bandwidth Teleconsultation**
* 💊 **Medicine Inventory Management**
* 🧪 **Diagnostic Coordination**
* 🔔 **Real-Time Notifications**
* 📊 **Healthcare Analytics**
* 🌐 **Marathi, Hindi & English**
* 🔗 **FHIR-Based Interoperability**
* 🆔 **ABHA / ABDM Integration**
* 🚑 **Emergency Escalation & 108 Integration**

---

# Architecture

Agada follows a **microservices-oriented, offline-first architecture**.

The following diagrams describe the platform at different architectural and workflow levels.

---

## Microservices Architecture

This diagram describes communication between the API Gateway, backend microservices, external healthcare systems, and databases.

```mermaid
flowchart LR

    subgraph Services["Microservices"]
        A["API Gateway"]
        B["Auth Service"]
        C["Patient Service"]
        D["Triage Service"]
        E["Referral Service"]
        F["Teleconsultation Service"]
        G["Medicine Service"]
        H["Notification Service"]
        I["Analytics Service"]
        J["Sync Service"]
    end

    subgraph External["External Integrations"]
        K["ABDM Sandbox"]
        L["eSanjeevani"]
        M["RCH Portal"]
        N["HMIS"]
        O["SMS Gateway"]
        P["108 Ambulance"]
    end

    subgraph DB["Databases"]
        Q[("MongoDB")]
        R[("PostgreSQL")]
        S[("Redis")]
        T[("Elasticsearch")]
    end

    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J

    B --> R

    C --> Q
    C --> R
    C --> K

    D --> Q
    D --> S
    D --> T

    E --> Q
    E --> T
    E --> P

    F --> S
    F --> L

    G --> Q
    G --> R

    H --> O

    I --> T
    I --> N

    J --> Q
    J --> M
```

### Service Responsibilities

| Service                  | Responsibility                                   |
| ------------------------ | ------------------------------------------------ |
| Auth Service             | Authentication, authorization and RBAC           |
| Patient Service          | Patient registration and health identity linking |
| Triage Service           | Digital triage and AI-assisted risk scoring      |
| Referral Service         | Closed-loop referral management                  |
| Teleconsultation Service | Doctor consultation and WebRTC coordination      |
| Medicine Service         | Medicine inventory and stock management          |
| Notification Service     | SMS, push and system notifications               |
| Analytics Service        | Reporting and healthcare analytics               |
| Sync Service             | Offline synchronization and conflict resolution  |

---

## End-to-End Healthcare Workflow

This workflow shows how a patient moves from a village-level interaction through PHC/CHC care and, when required, to a district hospital.

```mermaid
flowchart TD

    subgraph Village["Village Level - ASHA / ANM"]
        A["ASHA Conducts Home Visit"]
        B["Digital Triage<br/>(Offline First)"]
        C{"Risk Level"}

        A --> B
        B --> C

        C -->|Low| D["Home Care Advice"]
        C -->|Medium| E["Schedule Teleconsultation"]
        C -->|High| F["Emergency Action"]
    end

    subgraph Facility["PHC / CHC Level"]
        G["Patient Registration<br/>(ABHA Link)"]
        H["Teleconsultation Session"]
        I["Doctor Decision"]
        J{"Referral Required?"}
        K["Treatment at PHC / CHC"]
        L["Create Referral"]
        M["108 Ambulance Alert"]

        B --> G
        E --> H
        H --> I
        I --> J

        J -->|No| K
        J -->|Yes| L

        F --> M
    end

    subgraph Hospital["District Hospital Level"]
        N["Referral Received"]
        O["Doctor Reviews Care Graph"]
        P["Treatment / Admission"]
        Q["Outcome Recorded"]
        R["Feedback to ASHA"]

        L --> N
        N --> O
        O --> P
        P --> Q
        Q --> R
    end

    subgraph Central["Central Dashboard"]
        S["Aggregate Patient Data"]
        T["Teleconsultation Analytics"]
        U["Referral Tracking"]
        V["Quality Metrics"]
        W["State-Level Dashboard"]

        G --> S
        H --> T
        L --> U
        Q --> V

        S --> W
        T --> W
        U --> W
        V --> W
    end

    subgraph Sync["Data Synchronization"]
        X["Offline Storage<br/>(IndexedDB / Local DB)"]
        Y["Background Sync<br/>(When Online)"]
        Z["MongoDB + PostgreSQL"]

        B --> X
        X --> Y
        Y --> Z
    end
```

---

# Patient Queue Management

The queue-management workflow handles both scheduled appointments and walk-in patients.

```mermaid
flowchart TD

    START(["Patient Arrives at PHC"])

    START --> A{"Has Appointment?"}

    A -->|Yes| CHECKIN["Check-in at Facility<br/>(QR Code / ABHA ID)"]
    A -->|No| WALKIN["Walk-in Registration<br/>(Front Desk / ASHA)"]

    CHECKIN --> PRIORITY
    WALKIN --> PRIORITY

    PRIORITY["Priority Assignment<br/>• Emergency: Highest<br/>• Elderly: High<br/>• Pregnant: High<br/>• Children: High<br/>• Others: Normal"]

    PRIORITY --> QUEUE["Added to Queue<br/>(Real-Time System)"]

    QUEUE --> REAL["Real-Time Dashboard<br/>• Facility Display<br/>• Patient App<br/>• Estimated Wait Time"]

    REAL --> DOCTOR["Doctor Consultation"]

    DOCTOR --> UPDATE["Queue Status Updated<br/>(Waiting → In Consultation → Done)"]

    UPDATE --> NOTIFY["Patient Notified<br/>(If App Available)"]

    NOTIFY --> DONE["Consultation Complete<br/>(Recorded in Care Graph)"]

    subgraph Scheduling["Scheduling Logic"]

        APPOINT["Patient Books Appointment<br/>(Via ASHA / App)"]

        APPOINT --> SLOT["Slot Allocation<br/>• Doctor Availability<br/>• Priority Rules"]

        SLOT --> CONFIRM["Appointment Confirmed<br/>(SMS / Notification)"]

    end

    subgraph Analytics["Queue Analytics"]

        QUEUE --> METRICS["Metrics Collected<br/>• Wait Times<br/>• Patient Load<br/>• Peak Hours"]

        METRICS --> OPTIMIZE["Schedule Optimization"]

    end
```

---

# Medicine & Diagnostic Inventory

The inventory workflow allows facilities to track medicine and diagnostic availability even when operating offline.

```mermaid
flowchart TD

    START(["Facility Staff / ASHA"])

    START --> UPDATE["Update Stock Offline<br/>(Medicine / Diagnostic)"]

    UPDATE --> SAVE["Saved to Local Database"]

    SAVE --> SYNC["Synced to Backend"]

    SYNC --> CHECK{"Stock < Threshold?"}

    CHECK -->|Yes| ALERT["Automatic Alert Generated<br/>(Admin Notification)"]
    CHECK -->|No| CONTINUE["Normal Tracking"]

    ALERT --> ORDER["Generate Indent"]
    ORDER --> APPROVE["Admin Approval"]
    APPROVE --> PROCURE["Procurement Initiated"]

    subgraph Patient["Patient / ASHA Availability Query"]

        QUERY["Query Required Medicine / Test"]

        QUERY --> FIND["Find Nearest Facility<br/>With Availability"]

        FIND --> DISPLAY["Display Availability<br/>(Facility + Distance)"]

        DISPLAY --> NAVIGATE["Navigate Patient"]

    end

    subgraph Analytics["Analytics & Forecasting"]

        CONSUMPTION["Track Consumption Patterns"]

        CONSUMPTION --> PREDICT["Predict Future Demand"]

        PREDICT --> FORECAST["Generate Forecast Report"]

        FORECAST --> STOCK["Optimize Stock Levels"]

    end

    subgraph Transfer["Inter-Facility Transfer"]

        SHORTAGE["Facility Reports Shortage"]

        SHORTAGE --> TRANSFER["Transfer Request Initiated"]

        TRANSFER --> APPROVETRANS["Transfer Approved"]

        APPROVETRANS --> MOVESTOCK["Stock Transferred"]

    end
```

---

# Emergency Teleconsultation

The emergency workflow provides an audio-first, low-bandwidth communication path between frontline healthcare workers and doctors.

```mermaid
flowchart TD

    START(["Emergency Situation Identified"])

    START --> SOS["ASHA Taps<br/>Emergency SOS"]

    SOS --> ALERT["System Sends Alert<br/>(High Priority Request)"]

    ALERT --> FIND["Find Nearest Available<br/>Specialist"]

    FIND --> A{"Specialist Found?"}

    A -->|Yes| CONNECT["Low-Bandwidth Consultation<br/>(Audio-First + Shared Screen)"]

    A -->|No| ESCALATE["Escalate to<br/>District Hospital"]

    ESCALATE --> CONNECT

    CONNECT --> ASSESS["Doctor Assesses Patient<br/>(Reviews Care Graph)"]

    ASSESS --> DECISION{"Clinical Decision"}

    DECISION -->|Home Care| HOME["Home Care Advice<br/>(Medication + Follow-up)"]

    DECISION -->|Transport| TRANSPORT["Urgent Transport<br/>to PHC / Hospital"]

    DECISION -->|Critical| CRITICAL["Direct Transfer<br/>to District Hospital"]

    HOME --> NOTES["Session Notes & Advice Saved"]

    TRANSPORT --> AMBULANCE["108 Ambulance Alerted"]

    CRITICAL --> AMBULANCE
    CRITICAL --> NOTES

    AMBULANCE --> NOTES

    NOTES --> CARE["Care Graph Updated<br/>(Encounter Recorded)"]

    CARE --> REFERRAL{"Referral Needed?"}

    REFERRAL -->|Yes| CREATE["Referral Created<br/>(Closed-Loop Tracking)"]

    REFERRAL -->|No| DONE(["Emergency Handled"])

    CREATE --> DONE
```

---

# Closed-Loop Referral

The referral workflow ensures that a referral is not considered complete until the receiving facility records the patient's outcome and feedback reaches the referring healthcare worker.

```mermaid
flowchart TD

    START(["ASHA Identifies Need for Referral"])

    START --> CREATE["ASHA Creates Referral<br/>• Patient Summary<br/>• Reason<br/>• Urgency<br/>• Destination"]

    CREATE --> SAVELOCAL["Saved Locally<br/>(Offline Storage)"]

    SAVELOCAL --> SYNCONLINE["Synced to Backend<br/>(When Online)"]

    SYNCONLINE --> DASHBOARD["Appears on Receiving<br/>Facility Dashboard"]

    DASHBOARD --> ACTION["Doctor Takes Action"]

    ACTION --> ACCEPT["Accept Referral<br/>(Slot Allocated)"]

    ACTION --> REQUEST["Request More Information<br/>(ASHA Notified)"]

    ACTION --> REDIRECT["Redirect to<br/>Different Facility"]

    ACCEPT --> NOTIFY["Notification to ASHA<br/>(SMS / Push)"]

    REQUEST --> NOTIFY
    REDIRECT --> NOTIFY

    NOTIFY --> PATIENT["Patient Visits Facility"]

    PATIENT --> REVIEW["Doctor Reviews<br/>Care Graph"]

    REVIEW --> CARE["Doctor Provides Care<br/>(Diagnosis / Treatment)"]

    CARE --> OUTCOME["Outcome Recorded"]

    OUTCOME --> FEEDBACK["Feedback Sent to ASHA"]

    FEEDBACK --> CLOSE["Referral Closed"]

    CLOSE --> ANALYTICS["Analytics Updated<br/>(Referral Completion Rate)"]

    subgraph RealTime["Real-Time Updates"]

        DASHBOARD --> STATUS["Status Updated via<br/>WebSocket / Socket.IO"]

        STATUS --> NOTIFY

    end
```

---

# Offline-First Triage

The triage workflow is designed to continue functioning when the ASHA has no network connectivity.

```mermaid
flowchart TD

    START(["ASHA Logs into Mobile App"])

    START --> A{"Internet Available?"}

    A -->|No| OFFLINE["Offline Mode<br/>(Local Database)"]

    A -->|Yes| ONLINE["Online Mode<br/>(Real-Time Sync)"]

    OFFLINE --> TRIAGE
    ONLINE --> TRIAGE

    TRIAGE["Select New Triage"]

    TRIAGE --> REG{"Patient Registered?"}

    REG -->|No| REGISTER["Register New Patient<br/>(ABHA Linking / Registration)"]

    REG -->|Yes| SELECT["Select Existing Patient"]

    REGISTER --> FORM
    SELECT --> FORM

    FORM["Fill Triage Form<br/>• Symptoms<br/>• Vitals<br/>• Risk Factors<br/>• Voice Input"]

    FORM --> ML["AI Risk Score<br/>(TensorFlow Lite - On Device)"]

    ML --> SCORE{"Risk Score: 0-10"}

    SCORE -->|0-3| LOW["Low Risk<br/>Home Care Advice<br/>Follow-up: 7 Days"]

    SCORE -->|4-6| MEDIUM["Medium Risk<br/>Teleconsultation<br/>Within 4 Hours"]

    SCORE -->|7-8| HIGH["High Risk<br/>Urgent Teleconsultation<br/>+ Emergency Alert"]

    SCORE -->|9-10| CRITICAL["Critical<br/>Direct Emergency Escalation<br/>to District Hospital"]

    LOW --> SAVE["Save Encounter Locally<br/>(Attach to Care Graph)"]

    MEDIUM --> TELECONSULT["Initiate Teleconsultation<br/>(WebRTC)"]

    HIGH --> TELECONSULT

    CRITICAL --> AMBULANCE["Emergency Transport Alert"]

    TELECONSULT --> DOCTOR{"Doctor Available?"}

    DOCTOR -->|Yes| CONNECT["Connect to Specialist<br/>(Audio-First + Shared Screen)"]

    DOCTOR -->|No| ESCALATE["Escalate to Higher Facility"]

    CONNECT --> DECISION["Doctor Decision<br/>(Home Care / Transport / Referral)"]

    SAVE --> SYNC["Background Sync<br/>(When Online)"]

    SAVE --> NOTIFY["Send Notification<br/>(Patient / ASHA)"]

    DECISION --> REFERRAL["Create Referral<br/>(If Required)"]

    REFERRAL --> CLOSE["Close Encounter<br/>(Update Care Graph)"]

    CLOSE --> DONE(["Workflow Complete"])
```

---

# Complete System HLD

The following diagram represents the overall High-Level Design of the Agada platform, from frontend applications to backend services, interoperability adapters, databases, and external government healthcare systems.

```mermaid
flowchart TB

    subgraph Frontend["Frontend Clients"]

        ASHA["ASHA Mobile App<br/>(React Native + Offline DB)"]

        Doctor["Doctor Web Dashboard<br/>(React + PWA)"]

        Admin["Admin Web Dashboard<br/>(React + PWA)"]

        Patient["Patient App - Future<br/>(React Native)"]

    end

    subgraph Gateway["API Gateway"]

        APIGW["Kong / NGINX<br/>(Routing, Rate Limiting, Authentication)"]

    end

    subgraph Microservices["Microservices Layer"]

        Auth["Auth Service<br/>(JWT, RBAC)"]

        PatientSvc["Patient Service<br/>(ABHA Linking)"]

        Triage["Triage Service<br/>(ML Risk Scoring)"]

        Referral["Referral Service<br/>(Closed-Loop)"]

        Telemed["Teleconsultation Service<br/>(WebRTC + WebSocket)"]

        Medicine["Medicine Service<br/>(Stock Management)"]

        Diagnostic["Diagnostic Service<br/>(Lab Coordination)"]

        Queue["Queue Service<br/>(Appointment Management)"]

        Notification["Notification Service<br/>(SMS / Push)"]

        Analytics["Analytics Service<br/>(Reporting)"]

        CareGraph["Care Graph Service<br/>(FHIR Aggregation)"]

        Sync["Sync Service<br/>(Offline Synchronization)"]

    end

    subgraph Integration["Integration Gateway - FHIR"]

        eSanjeevani["eSanjeevani Adapter<br/>(Telemedicine)"]

        RCH["RCH Adapter<br/>(Maternal / Child Health)"]

        HMIS["HMIS Adapter<br/>(Facility Data)"]

        ABDM["ABDM Adapter<br/>(ABHA / Health Records)"]

    end

    subgraph Databases["Data Layer"]

        MongoDB[("MongoDB<br/>(Patient, Encounters,<br/>Referrals)")]

        PostgreSQL[("PostgreSQL<br/>(Users, Facilities,<br/>Master Data)")]

        Redis[("Redis<br/>(Cache, Sessions,<br/>Queues)")]

        Elasticsearch[("Elasticsearch / OpenSearch<br/>(Search, Logs,<br/>Analytics)")]

        MinIO[("MinIO / S3<br/>(Images, Documents,<br/>Attachments)")]

    end

    subgraph External["External Systems"]

        ABHA["ABHA / ABDM"]

        eSanjeevaniExt["eSanjeevani"]

        RCHPortal["RCH Portal"]

        HMISSystem["HMIS"]

        Ambulance["108 Ambulance"]

        SMSGateway["SMS Gateway"]

    end

    Frontend --> APIGW

    APIGW --> Auth
    APIGW --> PatientSvc
    APIGW --> Triage
    APIGW --> Referral
    APIGW --> Telemed
    APIGW --> Medicine
    APIGW --> Diagnostic
    APIGW --> Queue
    APIGW --> Notification
    APIGW --> Analytics
    APIGW --> CareGraph
    APIGW --> Sync

    PatientSvc --> ABDM
    Telemed --> eSanjeevani
    CareGraph --> ABDM
    Analytics --> HMIS
    Referral --> Ambulance
    Notification --> SMSGateway
    Sync --> RCH

    Auth --> PostgreSQL

    PatientSvc --> MongoDB
    PatientSvc --> PostgreSQL

    Triage --> MongoDB
    Triage --> Redis
    Triage --> Elasticsearch

    Referral --> MongoDB
    Referral --> Elasticsearch

    Telemed --> Redis

    Medicine --> PostgreSQL
    Medicine --> MongoDB

    Diagnostic --> MongoDB
    Diagnostic --> PostgreSQL

    Queue --> Redis
    Queue --> PostgreSQL

    Notification --> Redis

    Analytics --> Elasticsearch

    CareGraph --> MongoDB
    CareGraph --> PostgreSQL

    Sync --> MongoDB

    CareGraph --> MinIO
    PatientSvc --> MinIO

    ABDM --> ABHA
    eSanjeevani --> eSanjeevaniExt
    RCH --> RCHPortal
    HMIS --> HMISSystem
```

---

# Architecture Layers

The complete architecture can be understood as seven logical layers:

```text
┌─────────────────────────────────────────────┐
│              Client Applications             │
│       Mobile • Doctor • Admin • Patient      │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│                 API Gateway                  │
│       Routing • Auth • Rate Limiting         │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│              Business Services               │
│ Patient • Triage • Referral • Queue • etc.   │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│           Integration / FHIR Layer           │
│      ABDM • eSanjeevani • RCH • HMIS         │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│                   Data Layer                 │
│ PostgreSQL • MongoDB • Redis • Object Store  │
└───────────────────────┬─────────────────────┘
                        ↓
┌─────────────────────────────────────────────┐
│          Observability & Operations          │
│ Logs • Metrics • Traces • Alerts • Audits   │
└─────────────────────────────────────────────┘
```

---

# Project Structure

```text
agada-platform/
│
├── apps/
│   ├── mobile/
│   ├── web-dashboard/
│   └── admin/
│
├── services/
│   ├── auth-service/
│   ├── patient-service/
│   ├── triage-service/
│   ├── referral-service/
│   ├── telemedicine-service/
│   ├── medicine-service/
│   ├── diagnostic-service/
│   ├── queue-service/
│   ├── notification-service/
│   ├── analytics-service/
│   ├── care-graph-service/
│   ├── sync-service/
│   └── integration-gateway/
│
├── packages/
│   ├── shared-types/
│   ├── shared-utils/
│   ├── validation/
│   ├── api-client/
│   └── config/
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   ├── nginx/
│   ├── monitoring/
│   └── terraform/
│
├── scripts/
│   ├── seed-db.js
│   ├── migrate.js
│   ├── test-all.sh
│   └── deploy.sh
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── security/
│   ├── deployment/
│   ├── interoperability/
│   └── user-manuals/
│
├── tests/
│   ├── integration/
│   ├── e2e/
│   └── performance/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── security.yml
│       └── deploy.yml
│
├── docker-compose.yml
├── turbo.json
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── README.md
└── LICENSE
```

---

# Technology Stack

| Layer                   | Technology                 |
| ----------------------- | -------------------------- |
| Mobile                  | React Native               |
| Web                     | React, Vite, Tailwind CSS  |
| Backend                 | Node.js, TypeScript        |
| Python Services         | FastAPI                    |
| API                     | REST                       |
| Real-Time Communication | WebSocket / Socket.IO      |
| Teleconsultation        | WebRTC                     |
| Primary Database        | PostgreSQL                 |
| Document Database       | MongoDB                    |
| Cache / Queues          | Redis                      |
| Search / Analytics      | Elasticsearch / OpenSearch |
| Object Storage          | MinIO / S3                 |
| Mobile Offline Database | WatermelonDB               |
| Web Offline Storage     | IndexedDB                  |
| Interoperability        | HL7 FHIR R4                |
| ML                      | TensorFlow Lite            |
| Containerization        | Docker                     |
| Orchestration           | Kubernetes                 |
| Monitoring              | Prometheus + Grafana       |
| Distributed Tracing     | OpenTelemetry              |
| CI/CD                   | GitHub Actions             |

---

# Quick Start

## Prerequisites

* Node.js 20+
* npm / pnpm
* Docker
* Docker Compose
* Git
* Android Studio for Android development
* Xcode for iOS development

## Clone Repository

```bash
git clone https://github.com/yourusername/agada-platform.git

cd agada-platform
```

## Install Dependencies

```bash
npm install
```

## Configure Environment

```bash
cp .env.example .env
```

Configure database, authentication, external integrations, and other required environment variables.

## Start Infrastructure

```bash
docker compose up -d
```

## Start Development Environment

```bash
npm run dev
```

## Start an Individual Service

```bash
cd services/auth-service

npm run dev
```

---

# Project Vision

> **Agada is more than a healthcare application.**
>
> It is a digital coordination layer connecting the people, facilities, information, and services that form the rural healthcare ecosystem.
>
> When connectivity disappears, care should not stop.
>
> When a patient is referred, the referral should not disappear.
>
> When a patient reaches another facility, their essential clinical context should travel with them.
>
> And when healthcare authorities look at the system as a whole, they should be able to see where care is succeeding—and where it is breaking down.
>
> **Agada — Connected care, even where connectivity is limited.**
