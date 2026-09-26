# METRIX — Comprehensive System Diagrams & Architecture Specification

> **Project**: METRIX — Online Verification and Digital Certification System for Weighing and Measuring Instruments  
> **Problem Statement**: Smart India Hackathon (SIH 2026) — Problem Statement **SIH26036**  
> **Document Status**: Production-Ready Architectural Reference  
> **Related Documents**: [System Architecture](02-system-architecture.md) | [Domain Model](03-domain-model.md) | [Database Architecture](04-database.md) | [Verification Workflow](06-verification-workflow.md)

---

## Table of Contents
1. [1. UML Use Case Diagram](#1-uml-use-case-diagram)
   - [1.1 Actor Definitions](#11-actor-definitions)
   - [1.2 Use Case Diagram (Visual Model)](#12-use-case-diagram-visual-model)
   - [1.3 Actor to Use Case Mapping Matrix](#13-actor-to-use-case-mapping-matrix)
2. [2. Entity-Relationship (ER) Diagram](#2-entity-relationship-er-diagram)
   - [2.1 Visual ER Diagram](#21-visual-er-diagram)
   - [2.2 Relational Integrity & Key Constraints](#22-relational-integrity--key-constraints)
3. [3. Process Flow Charts](#3-process-flow-charts)
   - [3.1 End-to-End Operational Lifecycle Flowchart](#31-end-to-end-operational-lifecycle-flowchart)
   - [3.2 Inspection & MPE Tolerance Validation Sub-Process](#32-inspection--mpe-tolerance-validation-sub-process)
   - [3.3 QR Code Scanning & Public Verification Flowchart](#33-qr-code-scanning--public-verification-flowchart)
4. [4. UML Diagrams](#4-uml-diagrams)
   - [4.1 UML Class Diagram](#41-uml-class-diagram)
   - [4.2 UML Sequence Diagrams](#42-uml-sequence-diagrams)
     - [Sequence A: Application Lodgement & Verifier Allocation](#sequence-a-application-lodgement--verifier-allocation)
     - [Sequence B: Field Inspection & Observation Logging](#sequence-b-field-inspection--observation-logging)
     - [Sequence C: Certificate Issuance, SHA-256 Digest & QR Embedding](#sequence-c-certificate-issuance-sha-256-digest--qr-embedding)
     - [Sequence D: Zero-Login Public QR Code Verification](#sequence-d-zero-login-public-qr-code-verification)
   - [4.3 UML State Machine Diagram (Lifecycle Statecharts)](#43-uml-state-machine-diagram-lifecycle-statecharts)
   - [4.4 UML Component & Package Architecture Diagram](#44-uml-component--package-architecture-diagram)

---

## 1. UML Use Case Diagram

The METRIX platform serves five human actor roles and automated background services to automate the statutory verification lifecycle under the Legal Metrology Act.

### 1.1 Actor Definitions

| Actor | Type | Description |
| :--- | :--- | :--- |
| **Instrument Owner / Business** | Primary Human | Traders, retail businesses, transport hubs, and manufacturing plants registering measuring instruments and submitting verification requests. |
| **Legal Metrology Officer (LMO)** | Primary Human | Statutory government enforcement officers reviewing applications, conducting field verifications, evaluating Maximum Permissible Error (MPE), and issuing official digital certificates. |
| **Government Approved Test Centre (GATC)** | Primary Human | Accredited calibration laboratories assigned to conduct specialized laboratory testing and log precision observations. |
| **System Administrator** | Primary Human | Oversees district officer accounts, inspects audit logs, manages system configurations, and monitors state-wide compliance. |
| **Public Consumer / Citizen** | Primary Human | Citizens, consumers, or commercial partners scanning instrument QR codes to confirm metrological validity without authentication. |
| **Automated System Daemon / Scheduler** | Secondary System | Background cron jobs monitoring certificate validity deadlines, updating dynamic expiry statuses, and triggering reminder alerts. |

---

### 1.2 Use Case Diagram (Visual Model)

```mermaid
flowchart LR
    %% Actors
    subgraph Actors ["System Actors"]
        direction TB
        Owner["👤 Instrument Owner"]
        LMO["👤 Legal Metrology Officer (LMO)"]
        GATC["👤 Test Centre (GATC)"]
        Admin["👤 Administrator"]
        Public["👤 Public / Citizen"]
        System["⚙️ System Scheduler"]
    end

    %% System Boundary
    subgraph METRIX ["METRIX System Boundary"]
        direction TB

        subgraph ModAuth ["Authentication & Profiles"]
            UC_Reg(["Register Account"])
            UC_Login(["Login (JWT / Google Auth)"])
            UC_Profile(["Manage Stakeholder Profile"])
        end

        subgraph ModInst ["Instrument Fleet Management"]
            UC_RegInst(["Register Measuring Instrument"])
            UC_BulkInst(["Bulk Upload Instruments (CSV)"])
            UC_ViewInst(["View Registered Fleet"])
        end

        subgraph ModApp ["Verification Applications"]
            UC_DraftApp(["Draft Verification Application"])
            UC_SubmitApp(["Submit Application (Initial/Re-Verif)"])
            UC_TrackApp(["Track Application & Audit History"])
        end

        subgraph ModReview ["Review & Scheduling"]
            UC_ReviewApp(["Review Submitted Application"])
            UC_Schedule(["Schedule Inspection & Slot"])
            UC_Assign(["Assign Verifier (LMO / GATC)"])
            UC_RejectApp(["Reject Application with Remarks"])
        end

        subgraph ModInspect ["Inspection & Observation"]
            UC_StartInspect(["Initiate Inspection Execution"])
            UC_LogObs(["Record Test Observations (MPE)"])
            UC_UploadGeo(["Upload Inspection Photos"])
            UC_FinalizeInspect(["Record Result (Verified / Rejected)"])
        end

        subgraph ModCert ["Certificate & QR Engine"]
            UC_IssueCert(["Issue Digital Certificate"])
            UC_GenHash(["Compute SHA-256 Integrity Hash"])
            UC_GenQR(["Generate 256-bit QR Token"])
            UC_RenderPDF(["Render Official PDF via ReportLab"])
            UC_DownloadPDF(["Download / Print Certificate"])
        end

        subgraph ModPublic ["Public Verification Portal"]
            UC_ScanQR(["Scan Physical Instrument QR Code"])
            UC_VerifyToken(["Validate Token & View Status"])
        end

        subgraph ModAdmin ["Governance & Operations"]
            UC_ManageUsers(["Manage Officers & GATCs"])
            UC_Telemetry(["View Analytics & Telemetry"])
            UC_ExportCSV(["Export Regulatory CSV Reports"])
            UC_Notices(["Publish Official Circulars"])
            UC_CheckExpiry(["Monitor & Notify Expiring Certs"])
        end
    end

    %% Actor to Use Case Connections
    Owner --> UC_Reg
    Owner --> UC_Login
    Owner --> UC_Profile
    Owner --> UC_RegInst
    Owner --> UC_BulkInst
    Owner --> UC_ViewInst
    Owner --> UC_DraftApp
    Owner --> UC_SubmitApp
    Owner --> UC_TrackApp
    Owner --> UC_DownloadPDF

    LMO --> UC_Login
    LMO --> UC_ReviewApp
    LMO --> UC_Schedule
    LMO --> UC_Assign
    LMO --> UC_RejectApp
    LMO --> UC_StartInspect
    LMO --> UC_LogObs
    LMO --> UC_UploadGeo
    LMO --> UC_FinalizeInspect
    LMO --> UC_IssueCert
    LMO --> UC_DownloadPDF
    LMO --> UC_Telemetry

    GATC --> UC_Login
    GATC --> UC_StartInspect
    GATC --> UC_LogObs
    GATC --> UC_UploadGeo
    GATC --> UC_FinalizeInspect

    Admin --> UC_Login
    Admin --> UC_ManageUsers
    Admin --> UC_ReviewApp
    Admin --> UC_Schedule
    Admin --> UC_Assign
    Admin --> UC_IssueCert
    Admin --> UC_Telemetry
    Admin --> UC_ExportCSV
    Admin --> UC_Notices

    Public --> UC_ScanQR
    Public --> UC_VerifyToken

    System --> UC_CheckExpiry

    %% Includes and Extends
    UC_IssueCert -.->|"<<include>>"| UC_GenHash
    UC_IssueCert -.->|"<<include>>"| UC_GenQR
    UC_IssueCert -.->|"<<include>>"| UC_RenderPDF
    UC_SubmitApp -.->|"<<include>>"| UC_TrackApp
    UC_FinalizeInspect -.->|"<<include>>"| UC_LogObs
    UC_RejectApp -.->|"<<extend>>"| UC_ReviewApp
    UC_ScanQR -.->|"<<include>>"| UC_VerifyToken
```

---

### 1.3 Actor to Use Case Mapping Matrix

| Functional Module | Use Case Name | Owner | LMO | GATC | Admin | Public |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Auth & Profile** | Register Account & Verify OTP | Yes | — | — | — | — |
| | Login (JWT / Google OAuth) | Yes | Yes | Yes | Yes | — |
| | Manage Business Profile & Licences | Yes | — | — | — | — |
| **Instrument Registry**| Register Commercial Instrument | Yes | — | — | Yes | — |
| | Bulk Import via CSV | Yes | — | — | Yes | — |
| | View Registered Fleet & Due Dates | Yes | Yes | — | Yes | — |
| **Applications** | Draft & Submit Initial Verification | Yes | — | — | — | — |
| | Submit Periodic Re-Verification | Yes | — | — | — | — |
| | Track Application Status Timeline | Yes | Yes | Yes | Yes | — |
| **Scheduling** | Review Application Completeness | — | Yes | — | Yes | — |
| | Reject Ineligible Application | — | Yes | — | Yes | — |
| | Schedule Date & Allocate Verifier | — | Yes | — | Yes | — |
| **Inspection** | Execute Physical/Lab Testing | — | Yes | Yes | Yes | — |
| | Record Tolerances (MPE Observations) | — | Yes | Yes | Yes | — |
| | Upload Geotagged Instrument Evidence | — | Yes | Yes | Yes | — |
| | Finalize Verification Outcome | — | Yes | Yes | Yes | — |
| **Certification** | Generate Tamper-Proof Certificate | — | Yes | — | Yes | — |
| | Render Official PDF with ReportLab | — | Yes | — | Yes | — |
| | Download Statutory Digital Certificate| Yes | Yes | Yes | Yes | — |
| **Public Portal** | Scan Physical Instrument QR Code | Yes | Yes | Yes | Yes | Yes |
| | Query Cryptographic Verification Token| — | — | — | — | Yes |
| **Operations** | Export Regulatory Compliance CSVs | — | — | — | Yes | — |
| | Publish Portal Notices & Circulars | — | — | — | Yes | — |
| | Manage Officers & GATC Allocations | — | — | — | Yes | — |

---

## 2. Entity-Relationship (ER) Diagram

The persistence layer is modeled in PostgreSQL 14+ using SQLAlchemy 2.x ORM across 10 tables.

### 2.1 Visual ER Diagram

```mermaid
erDiagram
    USERS ||--o| STAKEHOLDER_PROFILES : "has profile (1:1)"
    USERS ||--o{ INSTRUMENTS : "owns (1:N)"
    USERS ||--o{ VERIFICATION_APPLICATIONS : "applies (1:N)"
    USERS ||--o{ APPLICATION_STATUS_HISTORIES : "changed_by (1:N)"
    USERS ||--o{ INSPECTIONS : "assigned_to (1:N)"
    USERS ||--o{ CERTIFICATES : "issued_by (1:N)"
    USERS ||--o{ NOTIFICATIONS : "receives (1:N)"
    USERS ||--o{ NOTICES : "publishes (1:N)"

    INSTRUMENTS ||--o{ VERIFICATION_APPLICATIONS : "applied_for (1:N)"
    INSTRUMENTS ||--o{ CERTIFICATES : "certified_under (1:N)"

    VERIFICATION_APPLICATIONS ||--o{ APPLICATION_STATUS_HISTORIES : "audit_trail (1:N)"
    VERIFICATION_APPLICATIONS ||--o| INSPECTIONS : "scheduled_for (1:1)"
    VERIFICATION_APPLICATIONS ||--o| CERTIFICATES : "generates (1:1)"

    INSPECTIONS ||--o{ INSPECTION_OBSERVATIONS : "records (1:N)"

    USERS {
        int id PK "Serial primary key"
        string email UK "Unique indexed email"
        string hashed_password "Nullable for OAuth accounts"
        string full_name "Legal name of user"
        string role "ADMIN | LMO | GATC | INSTRUMENT_OWNER"
        boolean is_active "Default true"
        string auth_provider "local | google"
        string otp_code "Temporary OTP verification code"
        timestamp otp_expires_at "OTP expiration deadline"
        timestamp created_at "Account creation timestamp"
        timestamp updated_at "Account modification timestamp"
    }

    STAKEHOLDER_PROFILES {
        int id PK "Serial primary key"
        int user_id FK,UK "Foreign key to users.id (CASCADE)"
        string business_name "Registered trade name"
        string trade_license_number "Indexed statutory licence number"
        string contact_phone "Official business phone"
        string address_line "Premises physical address"
        string city "City or district"
        string state "State jurisdiction"
        string pincode "6-digit postal code"
        timestamp created_at "Profile creation timestamp"
        timestamp updated_at "Profile modification timestamp"
    }

    INSTRUMENTS {
        int id PK "Serial primary key"
        string registration_number UK "Unique registered identifier"
        int owner_id FK "Foreign key to users.id (RESTRICT)"
        string instrument_type "WEIGHING_SCALE | FLOW_METER | etc."
        string manufacturer "Make or manufacturer"
        string model_name "Model designation"
        string serial_number "Indexed physical serial number"
        string capacity "Nominal instrument capacity"
        string min_capacity "Minimum verified capacity"
        string max_capacity "Maximum verified capacity"
        string capacity_unit "kg, g, L, m, etc."
        text image_urls "JSON array of image asset paths"
        string location "Geographic deployment address"
        boolean is_active "Operational active flag"
        timestamp created_at "Registration timestamp"
        timestamp updated_at "Last updated timestamp"
    }

    VERIFICATION_APPLICATIONS {
        int id PK "Serial primary key"
        string application_number UK "Unique application identifier"
        int instrument_id FK "Foreign key to instruments.id (RESTRICT)"
        int applicant_id FK "Foreign key to users.id (RESTRICT)"
        string application_type "INITIAL | RE_VERIFICATION"
        string status "DRAFT .. CERTIFICATE_ISSUED | REJECTED"
        timestamp submitted_at "Formal submission timestamp"
        text remarks "Application applicant remarks"
        timestamp created_at "Record creation timestamp"
        timestamp updated_at "Last status change timestamp"
    }

    APPLICATION_STATUS_HISTORIES {
        int id PK "Serial primary key"
        int application_id FK "Foreign key to applications.id (CASCADE)"
        string from_status "Previous application status"
        string to_status "New application status"
        int changed_by_id FK "Foreign key to users.id (RESTRICT)"
        text remarks "Officer transition remarks"
        timestamp created_at "Audit entry timestamp"
    }

    INSPECTIONS {
        int id PK "Serial primary key"
        int application_id FK,UK "Foreign key to applications.id (CASCADE)"
        int assigned_to_id FK "Foreign key to users.id (SET NULL)"
        date scheduled_date "Scheduled inspection date"
        string scheduled_time "Assigned time window"
        string inspection_location "Physical site or laboratory address"
        text scheduling_remarks "Instructions for inspection"
        timestamp started_at "Inspection commencement timestamp"
        timestamp completed_at "Inspection finalization timestamp"
        string result "VERIFIED | REJECTED"
        text result_remarks "Final inspection findings"
        text image_urls "JSON array of inspection photos"
        string certificate_image_url "Uploaded certificate scan"
        timestamp created_at "Inspection record creation timestamp"
        timestamp updated_at "Inspection update timestamp"
    }

    INSPECTION_OBSERVATIONS {
        int id PK "Serial primary key"
        int inspection_id FK "Foreign key to inspections.id (CASCADE)"
        string parameter_name "Zero load, Repeatability, etc."
        string observed_value "Observed field measurement"
        string standard_value "Reference tolerance standard"
        string unit "Unit of measure (kg, mm, L)"
        boolean is_passed "Statutory tolerance compliance flag"
        text remarks "Specific parameter observation notes"
        timestamp created_at "Reading logged timestamp"
    }

    CERTIFICATES {
        int id PK "Serial primary key"
        string certificate_number UK "Unique certificate code (METRIX-CERT-...)"
        int application_id FK,UK "Foreign key to applications.id (RESTRICT)"
        int instrument_id FK "Foreign key to instruments.id (RESTRICT)"
        int issued_by_id FK "Foreign key to users.id (RESTRICT)"
        timestamp issued_at "Certificate generation timestamp"
        date valid_from "Effective validity start date"
        date valid_until "Statutory validity expiration date"
        string status "ACTIVE | EXPIRED"
        string integrity_hash "Deterministic SHA-256 tamper-proof hash"
        string verification_token UK "Cryptographically secure URL token"
        string pdf_path "Path to local binary PDF on disk"
        timestamp created_at "Record creation timestamp"
        timestamp updated_at "Record update timestamp"
    }

    NOTIFICATIONS {
        int id PK "Serial primary key"
        int user_id FK "Foreign key to users.id (CASCADE)"
        string type "APPLICATION_SUBMITTED | CERTIFICATE_ISSUED | etc."
        string title "Notification alert header"
        text message "Human readable notification body"
        boolean is_read "Read/unread indicator"
        timestamp created_at "Dispatch timestamp"
        timestamp read_at "Acknowledged timestamp"
        string entity_type "APPLICATION | CERTIFICATE | INSPECTION"
        int entity_id "Referenced entity primary key"
    }

    NOTICES {
        int id PK "Serial primary key"
        string title "Announcement headline"
        text content "Full body text of notice or circular"
        boolean is_active "Display on public portal flag"
        int published_by_id FK "Foreign key to users.id (SET NULL)"
        timestamp created_at "Publication timestamp"
        timestamp updated_at "Last revised timestamp"
    }
```

---

### 2.2 Relational Integrity & Key Constraints

1. **Non-Repudiation Constraints (`ondelete="RESTRICT"`)**:
   - `instruments` referenced by `verification_applications` or `certificates` cannot be deleted.
   - `users` who submitted applications or issued certificates cannot be dropped while audit logs depend on them.
2. **Cascading Child Records (`ondelete="CASCADE"`)**:
   - Deleting an `inspection` purges its associated child `inspection_observations`.
   - Deleting a `user` removes their `stakeholder_profiles` and in-app `notifications`.
3. **Decoupled 1:1 Identity Invariants**:
   - An application has at most one `Inspection` and one `Certificate`.
   - Each `Certificate` maintains a distinct 256-bit unguessable `verification_token` with a unique database index.

---

## 3. Process Flow Charts

### 3.1 End-to-End Operational Lifecycle Flowchart

The operational flowchart illustrates the complete lifecycle across actors, from instrument onboarding to public verification and re-verification.

```mermaid
flowchart TD
    %% Swimlane: Owner
    subgraph OwnerLane ["Instrument Owner / Business"]
        O1["Register Instrument in Portal"] --> O2["Create Verification Application (DRAFT)"]
        O2 --> O3["Upload Specifications & Submit Application"]
        O3 --> O4["Application Status: SUBMITTED"]
        O8["Receive Inspection Schedule Notification"]
        O13["Download Official PDF Certificate"]
        O15["Certificate Nears Expiration (30 Days Notice)"]
        O16["Submit Re-Verification Application (RE_VERIFICATION)"]
    end

    %% Swimlane: Officer / Admin
    subgraph AdminLane ["LMO Officer / Admin Review"]
        A1{"Review Application Documents"}
        O4 --> A1
        A1 -- "Deficient / Fraudulent" --> A2["Status: REJECTED\n(Remarks Recorded)"]
        A1 -- "Complete & Compliant" --> A3["Status: UNDER_REVIEW"]
        A3 --> A4["Schedule Inspection Date & Location"]
        A4 --> A5["Allocate Verifier (LMO Field or GATC Lab)"]
        A5 --> A6["Status: SCHEDULED"]
        A6 -.-> O8
    end

    %% Swimlane: Inspection Execution
    subgraph InspectLane ["Inspection & Testing Execution"]
        I1["Verifier Arrives / Receives Instrument"]
        A6 --> I1
        I1 --> I2["Status: INSPECTION_IN_PROGRESS"]
        I2 --> I3["Conduct Statutory Accuracy & Repeatability Tests"]
        I3 --> I4["Record Observed Readings vs Standard MPE Limits"]
        I4 --> I5["Upload Geotagged Field Photos & Seal Records"]
        I5 --> I6{"All MPE Observations Passed?"}
        I6 -- "No (Tolerance Exceeded)" --> I7["Record Rejection Findings\nStatus: REJECTED"]
        I6 -- "Yes (Tolerances Satisfied)" --> I8["Record Pass Verification\nStatus: VERIFIED"]
    end

    %% Swimlane: System Automated Engine
    subgraph SystemLane ["Automated Certificate & QR Engine"]
        S1["Trigger Digital Certificate Generation"]
        I8 --> S1
        S1 --> S2["Generate Certificate Number: METRIX-CERT-YYYY-NNNNNN"]
        S2 --> S3["Generate 256-bit Secure URL Token (secrets.token_urlsafe)"]
        S3 --> S4["Compute Canonical JSON SHA-256 Integrity Hash"]
        S4 --> S5["Embed Scannable QR Code (http://domain/verify/token)"]
        S5 --> S6["Render Statutory PDF via ReportLab Engine"]
        S6 --> S7["Save PDF to storage/certificates/ & Status: CERTIFICATE_ISSUED"]
        S7 -.-> O13
        S7 --> S8["Certificate Lifecycle Status: ACTIVE"]
        S8 --> S9{"Current Date > Valid Until?"}
        S9 -- "Yes" --> S10["Dynamic Status: EXPIRED"]
        S10 -.-> O15
        O16 --> O2
    end

    %% Swimlane: Public Consumer
    subgraph PublicLane ["Public Citizen / Consumer"]
        P1["Scan QR Code on Physical Instrument"]
        S5 -. "Physical QR on Machine" .-> P1
        P1 --> P2["Browser Opens /verify/{token}"]
        P2 --> P3["Backend Validates Token & Computes Status"]
        P3 --> P4{"Is Token Valid?"}
        P4 -- "No / Tampered" --> P5["Display Warning: Invalid / Counterfeit Seal"]
        P4 -- "Yes" --> P6["Display Real-Time Metrology Certificate Card"]
    end

    %% Terminal styles
    style A2 fill:#fee2e2,stroke:#ef4444,stroke-width:2px;
    style I7 fill:#fee2e2,stroke:#ef4444,stroke-width:2px;
    style S7 fill:#dcfce7,stroke:#22c55e,stroke-width:2px;
    style P6 fill:#dbeafe,stroke:#3b82f6,stroke-width:2px;
```

---

### 3.2 Inspection & MPE Tolerance Validation Sub-Process

```mermaid
flowchart TD
    StartInspect(["Start Inspection Appointment"]) --> CheckType{"Instrument Category"}
    
    CheckType -- "Weighing Scale / Balance" --> T1["Perform Eccentricity Test"]
    T1 --> T2["Perform Repeatability Test"]
    T2 --> T3["Perform Maximum Capacity Error Test"]

    CheckType -- "Petrol Dispenser / Flow Meter" --> F1["Dispense Standard Delivery (5L / 20L)"]
    F1 --> F2["Measure Prover Canister Deviation (ml)"]

    CheckType -- "Length Measure / Other" --> L1["Compare against Secondary Length Standard"]

    T3 --> Eval["Compute Absolute Error: |Observed - Standard|"]
    F2 --> Eval
    L1 --> Eval

    Eval --> TolCheck{"Error <= Maximum Permissible Error (MPE)?"}

    TolCheck -- "Yes" --> MarkPass["Set is_passed = TRUE for Observation"]
    TolCheck -- "No" --> MarkFail["Set is_passed = FALSE for Observation"]

    MarkPass --> MoreTests{"Additional Parameters to Test?"}
    MarkFail --> MoreTests

    MoreTests -- "Yes" --> NextTest["Advance to Next Parameter"]
    NextTest --> CheckType

    MoreTests -- "No" --> CheckAllPassed{"Did ALL Observations Pass?"}
    CheckAllPassed -- "Yes" --> ResPass["Set Result = 'VERIFIED'\nAdvance App to VERIFIED"]
    CheckAllPassed -- "No" --> ResFail["Set Result = 'REJECTED'\nAdvance App to REJECTED"]

    ResPass --> EndInspect(["Inspection Completed"])
    ResFail --> EndInspect
```

---

### 3.3 QR Code Scanning & Public Verification Flowchart

```mermaid
flowchart TD
    Scan["Citizen Scans Physical Instrument QR Code"] --> URL["Resolve URL: /verify/{verification_token}"]
    URL --> API["Call Public API: GET /api/v1/public/certificates/verify/{token}"]
    
    API --> DBCheck{"Token Exists in Database?"}
    DBCheck -- "No" --> Err404["Return 404: Invalid or Counterfeit Token"]
    Err404 --> UI_Fail["Render Alert: Untrusted Instrument / Fraud Warning"]

    DBCheck -- "Yes" --> LoadData["Fetch Certificate, Instrument, and Profile Records"]
    LoadData --> DateCheck{"current_date > valid_until?"}

    DateCheck -- "Yes" --> ExpStatus["Set Dynamic Status = 'EXPIRED'\n(Badge Color: Red)"]
    DateCheck -- "No" --> ExpNear{"valid_until - current_date <= 30 Days?"}
    
    ExpNear -- "Yes" --> WarnStatus["Set Dynamic Status = 'EXPIRING_SOON'\n(Badge Color: Amber)"]
    ExpNear -- "No" --> ActStatus["Set Dynamic Status = 'ACTIVE'\n(Badge Color: Emerald)"]

    ExpStatus --> FilterData["Filter Protected PII (Exclude phone, passwords, officer notes)"]
    WarnStatus --> FilterData
    ActStatus --> FilterData

    FilterData --> UI_Success["Render Responsive Public Verification Card with Anti-Tamper SHA-256 Hash"]
```

---

## 4. UML Diagrams

### 4.1 UML Class Diagram

The UML Class Diagram depicts the domain models, enumerations, and service orchestrators comprising the backend modular monolith.

```mermaid
classDiagram
    %% Enumerations
    class UserRole {
        <<enumeration>>
        ADMIN
        LMO
        GATC
        INSTRUMENT_OWNER
    }

    class ApplicationStatus {
        <<enumeration>>
        DRAFT
        SUBMITTED
        UNDER_REVIEW
        SCHEDULED
        INSPECTION_IN_PROGRESS
        INSPECTION_COMPLETED
        VERIFIED
        CERTIFICATE_ISSUED
        REJECTED
    }

    class InspectionResult {
        <<enumeration>>
        VERIFIED
        REJECTED
    }

    class InstrumentType {
        <<enumeration>>
        WEIGHING_SCALE
        ELECTRONIC_BALANCE
        PETROL_DISPENSER
        FLOW_METER
        LENGTH_MEASURE
        OTHER
    }

    class CertificateStatus {
        <<enumeration>>
        ACTIVE
        EXPIRED
    }

    %% Domain Entities
    class User {
        +int id
        +string email
        +string hashed_password
        +string full_name
        +UserRole role
        +bool is_active
        +string auth_provider
        +datetime created_at
        +datetime updated_at
        +check_password(raw_password) bool
    }

    class StakeholderProfile {
        +int id
        +int user_id
        +string business_name
        +string trade_license_number
        +string contact_phone
        +string address_line
        +string city
        +string state
        +string pincode
    }

    class Instrument {
        +int id
        +string registration_number
        +int owner_id
        +InstrumentType instrument_type
        +string manufacturer
        +string model_name
        +string serial_number
        +string capacity
        +string min_capacity
        +string max_capacity
        +string capacity_unit
        +string location
        +bool is_active
    }

    class VerificationApplication {
        +int id
        +string application_number
        +int instrument_id
        +int applicant_id
        +string application_type
        +ApplicationStatus status
        +datetime submitted_at
        +string remarks
    }

    class ApplicationStatusHistory {
        +int id
        +int application_id
        +ApplicationStatus from_status
        +ApplicationStatus to_status
        +int changed_by_id
        +string remarks
        +datetime created_at
    }

    class Inspection {
        +int id
        +int application_id
        +int assigned_to_id
        +date scheduled_date
        +string scheduled_time
        +string inspection_location
        +datetime started_at
        +datetime completed_at
        +InspectionResult result
        +string result_remarks
        +string certificate_image_url
    }

    class InspectionObservation {
        +int id
        +int inspection_id
        +string parameter_name
        +string observed_value
        +string standard_value
        +string unit
        +bool is_passed
        +string remarks
        +datetime created_at
    }

    class Certificate {
        +int id
        +string certificate_number
        +int application_id
        +int instrument_id
        +int issued_by_id
        +datetime issued_at
        +date valid_from
        +date valid_until
        +CertificateStatus status
        +string integrity_hash
        +string verification_token
        +string pdf_path
        +is_valid_on(check_date) bool
    }

    class Notification {
        +int id
        +int user_id
        +string type
        +string title
        +string message
        +bool is_read
        +datetime created_at
    }

    %% Service Orchestrators
    class AuthService {
        +authenticate_user(email, password) User
        +register_user(schema) User
        +create_access_token(user) string
    }

    class ApplicationService {
        +create_application(user, schema) VerificationApplication
        +transition_status(app_id, new_status, user) VerificationApplication
        +schedule_inspection(app_id, schedule_data, user) Inspection
        +assign_verifier(app_id, verifier_id, user) Inspection
    }

    class InspectionService {
        +start_inspection(app_id, user) Inspection
        +record_result(inspection_id, result_data, user) Inspection
    }

    class ObservationService {
        +add_observation(inspection_id, obs_data, user) InspectionObservation
        +get_observations(inspection_id) List
    }

    class CertificateService {
        +issue_certificate(app_id, user) Certificate
        +verify_public_token(token) PublicCertificate
        +download_certificate_pdf(cert_id, user) FileResponse
    }

    class CertificateHasher {
        +compute_hash(canonical_payload) string
        +verify_hash(cert, expected_hash) bool
    }

    class PdfService {
        +generate_certificate_pdf(cert_data, qr_image_bytes) bytes
    }

    %% Relationships
    User "1" -- "0..1" StakeholderProfile : profile
    User "1" -- "*" Instrument : instruments
    User "1" -- "*" VerificationApplication : applications
    User "1" -- "*" Inspection : assigned_inspections
    User "1" -- "*" Certificate : issued_certificates
    User "1" -- "*" Notification : notifications

    Instrument "1" -- "*" VerificationApplication : applications
    Instrument "1" -- "*" Certificate : certificates

    VerificationApplication "1" -- "*" ApplicationStatusHistory : status_history
    VerificationApplication "1" -- "0..1" Inspection : inspection
    VerificationApplication "1" -- "0..1" Certificate : certificate

    Inspection "1" -- "*" InspectionObservation : observations

    ApplicationService ..> VerificationApplication : manages
    InspectionService ..> Inspection : executes
    ObservationService ..> InspectionObservation : logs
    CertificateService ..> Certificate : creates
    CertificateService ..> CertificateHasher : verifies
    CertificateService ..> PdfService : delegates
```

---

### 4.2 UML Sequence Diagrams

#### Sequence A: Application Lodgement & Verifier Allocation

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Instrument Owner
    participant Web as Next.js Web App
    participant Router as Applications Router
    participant AppSvc as ApplicationService
    participant DB as PostgreSQL DB
    participant Notif as NotificationService

    Owner->>Web: Fill Application Form (Instrument ID, Type)
    Web->>Router: POST /api/v1/applications
    Router->>AppSvc: create_application(user_id, data)
    AppSvc->>DB: INSERT INTO verification_applications (status='DRAFT')
    DB-->>AppSvc: app_record (id=42, status='DRAFT')
    AppSvc-->>Router: return app_record
    Web-->>Owner: Display Application Draft Created

    Owner->>Web: Click "Submit Application"
    Web->>Router: PATCH /api/v1/applications/42/status {status: 'SUBMITTED'}
    Router->>AppSvc: transition_status(42, 'SUBMITTED', user)
    AppSvc->>DB: UPDATE status='SUBMITTED', INSERT INTO status_history
    AppSvc->>Notif: create_notification(officer_pool, 'APPLICATION_SUBMITTED')
    Notif->>DB: INSERT INTO notifications
    AppSvc-->>Router: return updated_app
    Web-->>Owner: Show Status: SUBMITTED (Audit History Updated)
```

---

#### Sequence B: Field Inspection & Observation Logging

```mermaid
sequenceDiagram
    autonumber
    actor Verifier as Assigned Verifier (LMO/GATC)
    participant Web as Next.js Mobile Web
    participant Router as Inspections Router
    participant InspSvc as InspectionService
    participant ObsSvc as ObservationService
    participant DB as PostgreSQL DB

    Verifier->>Web: Open Assigned Inspection #88
    Web->>Router: POST /api/v1/applications/42/inspection
    Router->>InspSvc: start_inspection(app_id=42, verifier_user)
    InspSvc->>DB: UPDATE inspections SET started_at = now()
    InspSvc->>DB: UPDATE verification_applications SET status = 'INSPECTION_IN_PROGRESS'
    InspSvc-->>Web: Status: INSPECTION_IN_PROGRESS

    loop For Each Testing Parameter
        Verifier->>Web: Enter Reading (e.g. Standard=50kg, Observed=50.02kg, Pass=True)
        Web->>Router: POST /api/v1/inspections/88/observations
        Router->>ObsSvc: add_observation(88, reading_data)
        ObsSvc->>DB: INSERT INTO inspection_observations
        DB-->>ObsSvc: observation_record
        ObsSvc-->>Web: Return Observation Saved
    end

    Verifier->>Web: Click "Finalize Inspection: VERIFIED"
    Web->>Router: PATCH /api/v1/inspections/88/result {result: 'VERIFIED', remarks: 'All MPE OK'}
    Router->>InspSvc: record_result(88, 'VERIFIED', remarks)
    InspSvc->>DB: UPDATE inspections SET completed_at=now(), result='VERIFIED'
    InspSvc->>DB: UPDATE applications SET status='VERIFIED'
    InspSvc->>DB: INSERT INTO application_status_histories
    InspSvc-->>Web: Inspection Finalized (Ready for Certificate Issuance)
```

---

#### Sequence C: Certificate Issuance, SHA-256 Digest & QR Embedding

```mermaid
sequenceDiagram
    autonumber
    actor Officer as LMO / Admin
    participant Router as Certificates Router
    participant CertSvc as CertificateService
    participant Hasher as CertificateHasher
    participant QRGen as QR Code Generator
    participant PDF as ReportLab PDF Engine
    participant FS as Local Storage (/storage/certificates)
    participant DB as PostgreSQL DB

    Officer->>Router: POST /api/v1/applications/42/certificate
    Router->>CertSvc: issue_certificate(app_id=42, officer_user)
    CertSvc->>DB: Verify Application Status == 'VERIFIED'
    CertSvc->>CertSvc: Generate Cert No: "METRIX-CERT-2026-000042"
    CertSvc->>CertSvc: Generate 256-bit Token: secrets.token_urlsafe(32)
    CertSvc->>Hasher: compute_hash(canonical_payload_json)
    Hasher-->>CertSvc: sha256_hex_digest

    CertSvc->>QRGen: generate_qr_matrix("http://portal/verify/" + token)
    QRGen-->>CertSvc: qr_image_bytes

    CertSvc->>PDF: build_certificate(cert_metadata, qr_image_bytes)
    PDF-->>CertSvc: binary_pdf_stream

    CertSvc->>FS: write_file("storage/certificates/METRIX-CERT-2026-000042.pdf")
    CertSvc->>DB: INSERT INTO certificates (cert_no, token, hash, pdf_path, status='ACTIVE')
    CertSvc->>DB: UPDATE verification_applications SET status = 'CERTIFICATE_ISSUED'
    CertSvc->>DB: INSERT INTO application_status_histories
    CertSvc-->>Router: CertificateResponse (cert_no, token, valid_until)
    Router-->>Officer: Certificate Issued Successfully
```

---

#### Sequence D: Zero-Login Public QR Code Verification

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Consumer / Citizen
    participant Camera as Mobile Camera / QR Reader
    participant Web as Next.js Public Page (/verify/[token])
    participant PublicRouter as Public Certificates API
    participant CertSvc as CertificateService
    participant DB as PostgreSQL DB

    Citizen->>Camera: Point at QR Code on Weighing Scale
    Camera->>Web: Open URL: https://metrix.gov/verify/u_kX93rLp8Z...
    Web->>PublicRouter: GET /api/v1/public/certificates/verify/u_kX93rLp8Z...
    PublicRouter->>CertSvc: verify_public_token("u_kX93rLp8Z...")
    CertSvc->>DB: SELECT * FROM certificates WHERE verification_token = token
    alt Token Does Not Exist
        DB-->>CertSvc: null
        CertSvc-->>PublicRouter: 404 Not Found (Invalid Token)
        PublicRouter-->>Web: Render Fraud / Counterfeit Warning
    else Token Exists
        DB-->>CertSvc: certificate + instrument + profile record
        CertSvc->>CertSvc: Calculate dynamic status (valid_until vs current_date)
        CertSvc->>CertSvc: Strip Private PII (phone, passwords, officer logs)
        CertSvc-->>PublicRouter: PublicCertificateDTO (Active, SerialNo, Make, Expiry, Hash)
        PublicRouter-->>Web: 200 OK + JSON
        Web-->>Citizen: Display Green Verification Shield & Instrument Specs
    end
```

---

### 4.3 UML State Machine Diagram (Lifecycle Statecharts)

A core invariant of METRIX is the strict separation between the **Transactional Application Lifecycle** and the **Temporal Certificate Lifecycle**.

```mermaid
stateDiagram-v2
    state "Application Lifecycle (Transactional)" as AppLife {
        [*] --> DRAFT: Owner drafts request
        DRAFT --> SUBMITTED: Owner submits form
        SUBMITTED --> UNDER_REVIEW: Officer begins review
        UNDER_REVIEW --> SCHEDULED: Date, Time & Verifier assigned
        UNDER_REVIEW --> REJECTED: Application fails eligibility check
        SCHEDULED --> INSPECTION_IN_PROGRESS: Inspector arrives on site
        INSPECTION_IN_PROGRESS --> INSPECTION_COMPLETED: MPE readings recorded
        INSPECTION_COMPLETED --> VERIFIED: All tests satisfy tolerances
        INSPECTION_COMPLETED --> REJECTED: Tolerances exceeded / failure
        VERIFIED --> CERTIFICATE_ISSUED: Certificate rendered & issued
        REJECTED --> [*]: Terminal audit record
        CERTIFICATE_ISSUED --> [*]: Terminal transaction completed
    }

    state "Certificate Lifecycle (Temporal Credential)" as CertLife {
        [*] --> ACTIVE: Issued upon verification approval
        ACTIVE --> EXPIRED: current_date > valid_until (365 Days)
        EXPIRED --> [*]: Archived legal record
    }

    state "Periodic Re-Verification" as ReVerif {
        CertLife --> AppLife: Owner submits new application (type='RE_VERIFICATION')
    }
```

#### State Transition Constraints Table

| From Status | Permitted To Status | Authorized Actor | Pre-Conditions & Constraints |
| :--- | :--- | :--- | :--- |
| `DRAFT` | `SUBMITTED` | Instrument Owner | Instrument profile complete; sets `submitted_at`. |
| `SUBMITTED` | `UNDER_REVIEW` | LMO, Admin | Locks application against owner modification. |
| `UNDER_REVIEW` | `SCHEDULED` | LMO, Admin | Requires valid `scheduled_date` and `assigned_to_id`. |
| `UNDER_REVIEW` | `REJECTED` | LMO, Admin | Requires mandatory rejection reason in `remarks`. |
| `SCHEDULED` | `INSPECTION_IN_PROGRESS` | Assigned Verifier, Admin | Verifier begins test; sets `started_at = now()`. |
| `INSPECTION_IN_PROGRESS` | `INSPECTION_COMPLETED` | Assigned Verifier, Admin | Requires at least one logged parameter observation. |
| `INSPECTION_COMPLETED` | `VERIFIED` | Assigned Verifier, Admin | All observations must have `is_passed = True`. |
| `INSPECTION_COMPLETED` | `REJECTED` | Assigned Verifier, Admin | One or more observations failed MPE tolerances. |
| `VERIFIED` | `CERTIFICATE_ISSUED` | LMO, Admin | Triggers SHA-256 hash, QR generation, ReportLab PDF. |
| `CERTIFICATE_ISSUED` | *(Terminal)* | None | Immutable state; no further transitions allowed. |
| `REJECTED` | *(Terminal)* | None | Immutable state; audit log permanently preserved. |

---

### 4.4 UML Component & Package Architecture Diagram

The system adheres to a software-only **Modular Monolith** pattern with explicit separation of presentation, routing, domain services, persistence, and asset generation.

```mermaid
flowchart TB
    subgraph ClientTier ["Presentation Tier (Next.js 14 / TypeScript)"]
        direction TB
        UI_Pages["Next.js App Router (16 Routes)"]
        UI_Components["Feature Components (Auth, Forms, Modals)"]
        RTK_Store["Redux Toolkit & RTK Query Store"]
        Auth_Init["AuthInitializer (JWT LocalStorage Session)"]
        
        UI_Pages --> UI_Components
        UI_Components --> RTK_Store
        RTK_Store --> Auth_Init
    end

    subgraph APITier ["API Routing Tier (FastAPI / Pydantic v2)"]
        direction TB
        MainApp["FastAPI Entrypoint (app.main)"]
        AuthMid["JWT Auth & RBAC Middleware"]
        
        subgraph Routers ["REST API Routers (/api/v1)"]
            R_Auth["auth.py"]
            R_Inst["instruments.py"]
            R_App["applications.py"]
            R_Insp["inspections.py"]
            R_Cert["certificates.py"]
            R_Public["public/certificates.py"]
            R_Notif["notifications.py"]
            R_Rep["reports.py"]
            R_Dash["dashboard.py"]
            R_Admin["admin.py"]
        end

        MainApp --> AuthMid
        AuthMid --> Routers
    end

    subgraph ServiceTier ["Domain Service Tier (Business Logic)"]
        direction TB
        S_Auth["AuthService"]
        S_Inst["InstrumentService"]
        S_App["ApplicationService"]
        S_Insp["InspectionService"]
        S_Obs["ObservationService"]
        S_Cert["CertificateService"]
        S_Hash["CertificateHasher"]
        S_PDF["PdfService"]
        S_Notif["NotificationService"]
        S_Rep["ReportService"]
        S_Dash["DashboardService"]

        S_Cert --> S_Hash
        S_Cert --> S_PDF
        S_App --> S_Notif
        S_Insp --> S_Notif
    end

    subgraph RepoTier ["Data Access & Repository Tier"]
        direction TB
        R_Base["BaseRepository (CRUD / Pagination)"]
        R_AppRepo["ApplicationRepository"]
        R_CertRepo["CertificateRepository"]
        R_InspRepo["InspectionRepository"]
        ORM["SQLAlchemy 2.x Session Manager"]
    end

    subgraph StorageTier ["Persistence & Storage Tier"]
        direction LR
        Postgres[("PostgreSQL 14+ Database\n(10 Tables & Indexes)")]
        LocalFS[("Local File Storage\nstorage/certificates/*.pdf")]
    end

    %% Tier Connectors
    RTK_Store -->|"HTTP / REST (JSON + Bearer Token)"| MainApp
    Routers -->|"Validated Schemas"| ServiceTier
    ServiceTier --> RepoTier
    RepoTier --> ORM
    ORM --> Postgres
    S_PDF -->|"Stream Binary PDF"| LocalFS
```

---

## 5. Architectural Invariant Summary

1. **Strict Linearity**: Verification applications strictly follow forward lifecycle transitions. Backward state reversals are prohibited.
2. **Non-Destructive Re-Verification**: Certificate expiration does not alter previous application records. A re-verification request creates an independent application linked to the same physical instrument.
3. **Decoupled Binary Storage**: Relational records and audit logs reside in PostgreSQL; binary PDF certificates are stored on the local filesystem without external cloud bloat.
4. **Zero-Trust Public Verification**: The public verification endpoint requires no authentication and provides real-time verification status while strictly redacting sensitive stakeholder data.
