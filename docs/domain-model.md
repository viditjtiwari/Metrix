# METRIX Domain Model (Phase 2)

## 1. Overview & Purpose

METRIX is an online verification and certification platform for legal metrology weighing and measuring instruments (SIH26036).
This document defines the core domain model implemented in Phase 2, establishing the database schema, entity relationships, lifecycle state machine, and Role-Based Access Control (RBAC).

---

## 2. Core Entities & Schema Design

### 2.1 User
- **Purpose**: Authenticated account representing an actor within the system.
- **Table**: `users`
- **Fields**:
  - `id` (Integer, Primary Key, autoincrement)
  - `email` (String(255), Unique, Indexed, Not Null): Login identity.
  - `hashed_password` (String(255), Not Null): Secure salted bcrypt hash.
  - `full_name` (String(255), Not Null): Full name of the user or designated representative.
  - `role` (Enum `UserRole`, Indexed, Not Null): Role determining access permissions (`ADMIN`, `LMO`, `GATC`, `INSTRUMENT_OWNER`).
  - `is_active` (Boolean, Not Null, Default `True`): Account status flag.
  - `created_at` (DateTime with TimeZone, Not Null): Account creation timestamp.
  - `updated_at` (DateTime with TimeZone, Not Null): Last profile update timestamp.
- **Relationships**:
  - 1-to-1 with `StakeholderProfile` (`uselist=False`, cascade="all, delete-orphan")
  - 1-to-many with `Instrument` (as `owner`)
  - 1-to-many with `VerificationApplication` (as `applicant`)
  - 1-to-many with `ApplicationStatusHistory` (as `changed_by`)

### 2.2 StakeholderProfile
- **Purpose**: Legal and organizational profile details of an instrument owner, business, or testing laboratory.
- **Table**: `stakeholder_profiles`
- **Fields**:
  - `id` (Integer, Primary Key, autoincrement)
  - `user_id` (Integer, ForeignKey `users.id` ondelete `CASCADE`, Unique, Indexed, Not Null)
  - `business_name` (String(255), Not Null): Registered commercial or organizational title.
  - `trade_license_number` (String(100), Indexed, Nullable): Commercial registration/license number.
  - `contact_phone` (String(20), Not Null): Official contact phone number.
  - `address_line` (String(255), Not Null): Street address of headquarters or premises.
  - `city` (String(100), Not Null): City/District.
  - `state` (String(100), Not Null): State or administrative territory.
  - `pincode` (String(10), Not Null): Postal pincode.
  - `created_at` (DateTime with TimeZone, Not Null)
  - `updated_at` (DateTime with TimeZone, Not Null)
- **Relationships**:
  - Belongs to `User` (`back_populates="profile"`)

### 2.3 Instrument
- **Purpose**: Physical weighing or measuring instrument registered for legal metrology verification.
- **Table**: `instruments`
- **Fields**:
  - `id` (Integer, Primary Key, autoincrement)
  - `registration_number` (String(64), Unique, Indexed, Not Null): System-generated unique identifier (e.g., `INST-YYYYMMDD-XXXX`).
  - `owner_id` (Integer, ForeignKey `users.id` ondelete `RESTRICT`, Indexed, Not Null): Instrument owner reference.
  - `instrument_type` (Enum `InstrumentType`, Indexed, Not Null): Classification (`WEIGHING_SCALE`, `ELECTRONIC_BALANCE`, `PETROL_DISPENSER`, `FLOW_METER`, `LENGTH_MEASURE`, `OTHER`).
  - `manufacturer` (String(128), Not Null): Make / manufacturer.
  - `model_name` (String(128), Not Null): Model identification.
  - `serial_number` (String(128), Indexed, Not Null): Manufacturer's hardware serial number.
  - `capacity` (String(64), Nullable): Capacity/range specification (e.g., "50 kg", "5000 L").
  - `location` (String(255), Not Null): Physical deployment premises address.
  - `is_active` (Boolean, Not Null, Default `True`): Operational state.
  - `created_at` (DateTime with TimeZone, Not Null)
  - `updated_at` (DateTime with TimeZone, Not Null)
- **Relationships**:
  - Belongs to `User` (`owner`)
  - 1-to-many with `VerificationApplication` (`applications`)

### 2.4 VerificationApplication
- **Purpose**: Formal legal request for initial verification or re-verification of an instrument.
- **Table**: `verification_applications`
- **Fields**:
  - `id` (Integer, Primary Key, autoincrement)
  - `application_number` (String(64), Unique, Indexed, Not Null): Reference ID (e.g., `APP-YYYYMMDD-XXXX`).
  - `instrument_id` (Integer, ForeignKey `instruments.id` ondelete `RESTRICT`, Indexed, Not Null)
  - `applicant_id` (Integer, ForeignKey `users.id` ondelete `RESTRICT`, Indexed, Not Null)
  - `application_type` (String(32), Not Null, Default `"INITIAL"`): Verification category (`INITIAL`, `RE_VERIFICATION`).
  - `status` (Enum `ApplicationStatus`, Indexed, Not Null, Default `DRAFT`): Current workflow state.
  - `submitted_at` (DateTime with TimeZone, Nullable): Timestamp when submitted by applicant.
  - `remarks` (Text, Nullable): Applicant or officer remarks.
  - `created_at` (DateTime with TimeZone, Not Null)
  - `updated_at` (DateTime with TimeZone, Not Null)
- **Relationships**:
  - Belongs to `Instrument` (`instrument`)
  - Belongs to `User` (`applicant`)
  - 1-to-many with `ApplicationStatusHistory` (`status_history`, cascade="all, delete-orphan")

### 2.5 ApplicationStatusHistory
- **Purpose**: Immutable audit log of workflow state transitions for verification applications.
- **Table**: `application_status_histories`
- **Fields**:
  - `id` (Integer, Primary Key, autoincrement)
  - `application_id` (Integer, ForeignKey `verification_applications.id` ondelete `CASCADE`, Indexed, Not Null)
  - `from_status` (Enum `ApplicationStatus`, Nullable): Prior status (`None` on initial creation).
  - `to_status` (Enum `ApplicationStatus`, Not Null): Target status.
  - `changed_by_id` (Integer, ForeignKey `users.id` ondelete `RESTRICT`, Indexed, Not Null): User who triggered transition.
  - `remarks` (Text, Nullable): Reason or justification for transition.
  - `created_at` (DateTime with TimeZone, Not Null): Timestamp of transition.
- **Relationships**:
  - Belongs to `VerificationApplication` (`application`)
  - Belongs to `User` (`changed_by`)

2.6 Inspection
- **Purpose**: Field or laboratory verification inspection associated with an application.
- **Table**: `inspections`
- **Fields**:
  - `id` (Integer, Primary Key, autoincrement)
  - `application_id` (Integer, ForeignKey `verification_applications.id` ondelete `CASCADE`, Unique, Indexed, Not Null)
  - `assigned_to_id` (Integer, ForeignKey `users.id` ondelete `SET NULL`, Indexed, Nullable): LMO or GATC verifier.
  - `scheduled_date` (Date, Nullable): Scheduled inspection date.
  - `scheduled_time` (String(32), Nullable): Scheduled time slot (e.g., "10:30 AM").
  - `inspection_location` (String(255), Nullable): On-site premises or testing facility address.
  - `scheduling_remarks` (Text, Nullable)
  - `started_at` (DateTime with TimeZone, Nullable): Actual start timestamp.
  - `completed_at` (DateTime with TimeZone, Nullable): Actual completion timestamp.
  - `result` (Enum `InspectionResult`, Nullable): Verification outcome (`VERIFIED`, `REJECTED`).
  - `result_remarks` (Text, Nullable)
  - `created_at` (DateTime with TimeZone, Not Null)
  - `updated_at` (DateTime with TimeZone, Not Null)
- **Relationships**:
  - 1-to-1 with `VerificationApplication` (`application`)
  - Belongs to `User` as `assigned_to`
  - 1-to-many with `InspectionObservation` (`observations`, cascade="all, delete-orphan")

### 2.7 InspectionObservation
- **Purpose**: Relational record of specific parameter testing observations during inspection.
- **Table**: `inspection_observations`
- **Fields**:
  - `id` (Integer, Primary Key, autoincrement)
  - `inspection_id` (Integer, ForeignKey `inspections.id` ondelete `CASCADE`, Indexed, Not Null)
  - `parameter_name` (String(128), Not Null): Test parameter (e.g. Zero Load Test, Repeatability Test).
  - `observed_value` (String(64), Not Null): Measured value.
  - `standard_value` (String(64), Nullable): Tolerance or reference value.
  - `unit` (String(32), Nullable): Unit of measurement (e.g., "kg", "g", "L").
  - `is_passed` (Boolean, Not Null, Default `True`): Parameter compliance status.
  - `remarks` (Text, Nullable): Specific notes on reading.
  - `created_at` (DateTime with TimeZone, Not Null)
- **Relationships**:
  - Belongs to `Inspection` (`inspection`)

---

## 3. Application Lifecycle State Machine

The verification workflow enforces deterministic transitions:

```text
DRAFT
  ↓ (Applicant submit)
SUBMITTED
  ↓ (Officer starts review)
UNDER_REVIEW ─────────────→ REJECTED (Officer rejects)
  ↓ (Officer schedules & allocates)
SCHEDULED
  ↓ (Field/Lab inspection starts)
INSPECTION_IN_PROGRESS
  ↓ (Observations recorded & inspection finished)
INSPECTION_COMPLETED
  ↓ (Final verification decision)
VERIFIED  or  REJECTED
  ↓ (Phase 4: Certificate generated)
CERTIFICATE_ISSUED
```

### State Machine Audit & Boundary Clarification
- In Phase 2, `EXPIRED` and `RE_VERIFICATION_REQUESTED` were present in `ApplicationStatus`.
- **Audit Decision**: An application represents a single verification request with a finite lifecycle ending in `VERIFIED` (and subsequently `CERTIFICATE_ISSUED`) or `REJECTED`.
- Expiry applies to the digital **Certificate** validity period, not the historical application.
- Re-verification in Legal Metrology is initiated by creating a **new** `VerificationApplication` with `application_type = "RE_VERIFICATION"`.
- Therefore, `EXPIRED` and `RE_VERIFICATION_REQUESTED` were removed from `ApplicationStatus` via a safe database migration (0002).

### Transition Invariants
1. `DRAFT` can only transition to `SUBMITTED`.
2. `SUBMITTED` can only transition to `UNDER_REVIEW`.
3. `UNDER_REVIEW` can transition to `SCHEDULED` or `REJECTED`.
4. `SCHEDULED` can only transition to `INSPECTION_IN_PROGRESS`.
5. `INSPECTION_IN_PROGRESS` transitions to `INSPECTION_COMPLETED`.
6. `INSPECTION_COMPLETED` transitions to `VERIFIED` or `REJECTED`.
7. Any illegal transition is rejected by `ApplicationService` / `InspectionService` with HTTP 400 Bad Request.
8. Every valid transition automatically inserts an audit entry in `ApplicationStatusHistory`.

---

## 4. Role-Based Access Control (RBAC)

### Defined Roles
- **`ADMIN`**: System administrator; manages users, views all instruments and applications, schedules, assigns verifiers, oversees system state.
- **`LMO`**: Legal Metrology Officer; reviews applications, schedules inspections, assigns LMO/GATC, conducts field inspections, records observations, records results.
- **`GATC`**: Government Approved Test Centre; conducts laboratory testing on assigned instruments, records observations and test results.
- **`INSTRUMENT_OWNER`**: Business / owner; registers instruments, submits verification applications, tracks status. Cannot review, schedule, assign, or verify.
- **`PUBLIC` / Consumer**: Anonymous viewer; verifies digital certificates and QR codes (no login required, Phase 4).

---

## 5. Architectural Assumptions & Decisions

1. **Instrument Catalog**: Modeled via `InstrumentType` enumeration rather than a separate catalog table for 4-week simplicity.
2. **Simple RBAC**: Single role column on `User` entity avoids unnecessary many-to-many permission tables while fulfilling all SIH26036 workflow requirements.
3. **Single Verifier Allocation (Option A)**: An inspection is allocated to one assigned verifier (`assigned_to_id`), whose role must be `LMO` or `GATC`.
4. **Relational Observations**: Observations are stored in a dedicated relational table `inspection_observations` rather than unstructured JSON.
5. **No Cascading Deletion of Core Records**: `RESTRICT` on delete prevents accidental deletion of verified instruments, applications, or audit trails; inspection observations cascade with the inspection.
6. **Deferred Modules**: Certificate PDF generation, QR images, and expiry background jobs are strictly deferred to Phase 4.
