# METRIX — Phase 3: Operational Verification Workflow

> **Document Status**: HISTORICAL REFERENCE  
> **Authoritative Current-State Guide**: See [docs/06-verification-workflow.md](../06-verification-workflow.md) and [docs/07-inspection-workflow.md](../07-inspection-workflow.md).

---

## 1. Phase Overview

Phase 3 delivered the core operational inspection workflow for Legal Metrology officers and test laboratories, introducing migration revision `0002_inspection_workflow` and the relational inspection tables.

---

## 2. Key Deliverables & Database Schema

1. **`inspections`**:
   - 1-to-1 operational anchor with `verification_applications`.
   - Attributes: `application_id`, `assigned_to_id`, `scheduled_date`, `scheduled_time`, `inspection_location`, `scheduling_remarks`, `started_at`, `completed_at`, `result`, `result_remarks`.
2. **`inspection_observations`**:
   - Relational parameter readings: `parameter_name`, `observed_value`, `standard_value`, `unit`, `is_passed`, `remarks`.
3. **Application Lifecycle Refinement**:
   - **Audit Decision**: `EXPIRED` and `RE_VERIFICATION_REQUESTED` were removed from `ApplicationStatus` via migration `0002_inspection_workflow`.
   - Rationale: An application is a discrete verification transaction ending at `VERIFIED` / `REJECTED`. Expiry belongs to the certificate credential lifecycle.

---

## 3. Operational Workflow Stages

```text
DRAFT
  ↓ (Applicant submits)
SUBMITTED
  ↓ (Officer accepts review)
UNDER_REVIEW ───────────────────────────────→ REJECTED (Terminal)
  ↓ (Officer schedules & assigns verifier)
SCHEDULED
  ↓ (Verifier begins inspection)
INSPECTION_IN_PROGRESS
  ↓ (Observations recorded & completed)
INSPECTION_COMPLETED
  ↓ (Verification decision)
VERIFIED ──> [Phase 4: CERTIFICATE_ISSUED]
  OR
REJECTED (Terminal)
```

---

## 4. Key Architectural Decisions in Phase 3

1. **Single Verifier Allocation (Option A)**:
   - Each inspection is allocated to a single primary verifier (`assigned_to_id`) whose role must be `LMO` or `GATC`.
   - Avoids distributed multi-party hand-off overhead while matching standard field procedures.
2. **Relational Checklist Observations**:
   - Stored in normalized relational rows (`inspection_observations`) rather than unstructured JSON documents.
   - Enables direct SQL aggregations, pass/fail validation, and clean PDF generation.
3. **GATC Inspection Isolation**:
   - Government Approved Test Centres access only those inspections explicitly assigned to their user ID (`assigned_to_id = current_user.id`).
