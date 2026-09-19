# METRIX Operational Verification Workflow (Phase 3)

## 1. Executive Summary
This document specifies the operational verification workflow for Legal Metrology weighing and measuring instruments under Smart India Hackathon problem statement SIH26036. The workflow encompasses application review, scheduling, verifier assignment, inspection execution, observation recording, and verification determination.

---

## 2. Operational Lifecycle Stages

### 2.1 Application Review
- **Trigger**: Applicant transitions application from `DRAFT` to `SUBMITTED`.
- **Action**: An authorized Legal Metrology Officer (LMO) or Administrator reviews the application details and instrument specifications.
- **Outcomes**:
  - `UNDER_REVIEW`: Application accepted for field/lab inspection scheduling.
  - `REJECTED`: Application declined due to invalid documentation, illegible plates, or non-compliance.

### 2.2 Scheduling
- **Prerequisite**: Application must be in `UNDER_REVIEW`.
- **Action**: LMO or Admin sets inspection date, time slot, premises/lab location, and optional remarks.
- **Outcome**: Transitions application to `SCHEDULED` and creates/updates the associated `Inspection` record.

### 2.3 Officer / GATC Assignment
- **Allocation Rule (Option A)**: An inspection is allocated to one assigned verifier (`assigned_to_id`).
- **Eligible Roles**:
  - `LMO`: For on-site field inspections at business premises.
  - `GATC`: For specialized lab testing and calibration.
- **Authorization**: Only `ADMIN` and `LMO` can assign or reassign verifiers. Instrument owners cannot assign verifiers.

### 2.4 Inspection Execution
- **Prerequisite**: Application is `SCHEDULED`.
- **Action**: Verifier arrives on-site or receives instrument at test centre and initiates testing.
- **Outcome**: Sets `started_at` timestamp and transitions application to `INSPECTION_IN_PROGRESS`.

### 2.5 Observations Recording
- **Prerequisite**: Inspection is `INSPECTION_IN_PROGRESS`.
- **Action**: Verifier records standardized metrological readings (e.g., zero-load error, maximum capacity tolerance, repeatability, sensitivity).
- **Data Model**: Relational entries in `inspection_observations` capturing parameter name, observed value, reference standard, unit, pass/fail state, and remarks.

### 2.6 Inspection Completion & Verification Result
- **Prerequisite**: Inspection is `INSPECTION_IN_PROGRESS`.
- **Action**: Verifier records final verification outcome:
  - `VERIFIED`: Instrument meets statutory metrological accuracy and standards.
  - `REJECTED`: Instrument fails statutory tolerances or integrity checks.
- **Outcome**: Sets `completed_at`, records `result` and `result_remarks`, and advances application status through `INSPECTION_COMPLETED` to `VERIFIED` or `REJECTED`.

---

## 3. Allowed Status Transitions Matrix

| From Status | Allowed Next Statuses | Authorized Actors |
| :--- | :--- | :--- |
| `DRAFT` | `SUBMITTED` | Instrument Owner, Admin |
| `SUBMITTED` | `UNDER_REVIEW` | LMO, Admin |
| `UNDER_REVIEW` | `SCHEDULED`, `REJECTED` | LMO, Admin |
| `SCHEDULED` | `INSPECTION_IN_PROGRESS` | Assigned Verifier, LMO, Admin |
| `INSPECTION_IN_PROGRESS` | `INSPECTION_COMPLETED` | Assigned Verifier, LMO, Admin |
| `INSPECTION_COMPLETED` | `VERIFIED`, `REJECTED` | Assigned Verifier, LMO, Admin |
| `VERIFIED` | `CERTIFICATE_ISSUED` (Phase 4) | System / Admin / LMO |
| `REJECTED` | *(Terminal)* | None |

*Note: Any status jump or unauthorized transition is rejected with HTTP 400 Bad Request or HTTP 403 Forbidden.*

---

## 4. Role Permissions (RBAC)

| Capability | Instrument Owner | LMO | GATC | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Register Instrument | Allowed (Own) | Allowed | Denied | Allowed |
| Submit Application | Allowed (Own) | Denied | Denied | Allowed |
| Review Application | Denied | Allowed | Denied | Allowed |
| Schedule Inspection | Denied | Allowed | Denied | Allowed |
| Assign Officer / Centre | Denied | Allowed | Denied | Allowed |
| Start Inspection | Denied | Allowed | Assigned Only | Allowed |
| Record Observations | Denied | Allowed | Assigned Only | Allowed |
| Submit Verification Result | Denied | Allowed | Assigned Only | Allowed |
| View Application & History | Own Only | All | Assigned Only | All |

---

## 5. Database Relationships & Entity Model

```text
User (1) ───< Instrument (N) ───< VerificationApplication (N)
                                          │
                        ┌─────────────────┴─────────────────┐
                        │ 1-to-1                            │ 1-to-many
                        v                                   v
                   Inspection                     ApplicationStatusHistory
                        │
                        │ 1-to-many
                        v
              InspectionObservation
```

1. **`verification_applications`**: Central lifecycle anchor.
2. **`application_status_histories`**: Immutable audit log of all transitions.
3. **`inspections`**: Associated 1-to-1 with application, tracks scheduling, assigned officer, timestamps, and result.
4. **`inspection_observations`**: Relational parameter measurements tied to an inspection.

---

## 6. Assumptions & Scope Boundaries

1. **Simplicity Over Distributed Workflows**: Single assigned verifier (`assigned_to_id`) avoids redundant hand-off tables.
2. **Audit Fidelity**: Every state transition generates an immutable `ApplicationStatusHistory` record with actor ID and remarks.
3. **Strict Boundary with Phase 4**: Certificate generation (PDF, QR code) and expiry background tracking belong to Phase 4 and are not implemented here.
