# 🚀 METRIX Phase 1 MVP — 100% Completion Implementation Plan

> **Goal:** Complete the remaining 6 features to reach **100% of the SIH26036 Phase 1 MVP Scope**.
> **Standards:** Legal Metrology Act, 2009 • Legal Metrology (General) Rules, 2011 (Rules 11, 13, 14, Schedule XII) • OIML R76 Standards.
> **Architecture:** Modular Monolith (FastAPI + SQLAlchemy 2.x + Alembic + Next.js + Redux Toolkit). All files strictly adhering to line limits (<500 lines Python, <300 lines TS/TSX).

---

## 📌 Proposed Changes Summary

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Fee Calculation Engine (Rule 14)                                         │
│    backend/app/services/fee_service.py                                      │
│    backend/app/api/v1/fees.py                                               │
│    backend/app/schemas/fee.py                                               │
│    -> Statutory fee schedule by type + capacity + 50%/quarter late fee      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Payment Receipt Flow (Manual Challan Verification)                       │
│    alembic/versions/0010_payment_and_kyc_fields.py                          │
│    backend/app/models/application.py (columns: payment_status, receipt_url) │
│    backend/app/services/payment_service.py & application_service.py         │
│    frontend/src/features/applications/PaymentReceiptModal.tsx               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Clarification Loop (CLARIFICATION_ASKED)                                 │
│    backend/app/services/application_service.py (ALLOWED_TRANSITIONS graph)  │
│    frontend/src/features/applications/ClarificationModal.tsx                │
│    frontend/src/features/applications/ApplicationActionBar.tsx             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. Owner KYC Fields (GSTIN, PAN, Business Type)                             │
│    backend/app/models/user.py (StakeholderProfile: gstin, pan, biz_type)    │
│    backend/app/schemas/auth.py                                              │
│    frontend/src/app/(authenticated)/profile/page.tsx                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. TAC & Invoice Upload on Frontend                                         │
│    frontend/src/features/instruments/RegisterInstrumentModal.tsx           │
│    frontend/src/app/(authenticated)/instruments/[id]/page.tsx               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. Whistleblower / Discrepancy Reporting                                    │
│    backend/app/api/v1/public_reports.py                                     │
│    frontend/src/features/verify/DiscrepancyReportModal.tsx                 │
│    frontend/src/app/verify/[token]/page.tsx                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Step-by-Step Implementation Details

### 1. Fee Calculation Engine (Rule 14 & Late Fee)
- **Real-Life Context**: Under Rule 14 and Schedule XII of Legal Metrology (General) Rules, 2011, fees are calculated based on instrument class, type, and max capacity. Late fees are 50% of the base fee for each delayed quarter (or fraction thereof) beyond the certificate expiration date, with a grace period for the expiration quarter.
- **Backend Files**:
  - [`backend/app/schemas/fee.py`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/backend/app/schemas/fee.py): Request schema (`instrument_type`, `capacity`, `capacity_unit`, `verification_type`, `previous_expiry_date`) and response schema (`base_fee`, `late_fee`, `total_fee`, `quarters_delayed`, `breakdown_notes`).
  - [`backend/app/services/fee_service.py`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/backend/app/services/fee_service.py):
    - Capacity normalization to kg/L/units.
    - Statutory tier lookup table.
    - Quarter-based delay calculation with grace periods.
  - [`backend/app/api/v1/fees.py`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/backend/app/api/v1/fees.py): Endpoint `GET /api/v1/fees/calculate`.
  - Registered in [`backend/app/api/v1/router.py`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/backend/app/api/v1/router.py).

### 2. Payment Receipt Flow (Manual Challan Workflow)
- **Database Schema**:
  - Alembic migration `0010_payment_and_kyc_fields.py`:
    - Add to `verification_applications`:
      - `payment_status` (VARCHAR/Enum, default `PENDING`)
      - `payment_receipt_url` (VARCHAR(512), nullable)
      - `challan_reference_number` (VARCHAR(64), nullable)
      - `challan_date` (Date, nullable)
      - `calculated_fee` (Integer, default 0)
      - `late_fee` (Integer, default 0)
      - `total_fee` (Integer, default 0)
      - `payment_uploaded_at` (DateTime, nullable)
      - `payment_verified_at` (DateTime, nullable)
      - `payment_verified_by_id` (Integer FK to users, nullable)
      - `payment_remarks` (Text, nullable)
- **Backend Endpoints**:
  - `POST /api/v1/applications/{id}/payment-receipt`: Allows applicant to upload challan receipt image/PDF + challan reference number. Sets `payment_status = UPLOADED` and application status `PAYMENT_UPLOADED`.
  - `PATCH /api/v1/applications/{id}/payment-verify`: Allows LMO / Admin to verify (`payment_status = VERIFIED`, application moves to `UNDER_REVIEW`) or reject (`payment_status = REJECTED`, application stays with remarks).
- **Frontend Components**:
  - [`frontend/src/features/applications/PaymentReceiptModal.tsx`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/applications/PaymentReceiptModal.tsx): Upload challan modal with fee breakdown.
  - [`frontend/src/features/applications/PaymentVerificationModal.tsx`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/applications/PaymentVerificationModal.tsx): LMO review challan preview & verify/reject actions.
  - Update [`ApplicationActionBar.tsx`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/applications/ApplicationActionBar.tsx) and application details page.

### 3. Clarification Loop (CLARIFICATION_ASKED)
- **State Machine Update**:
  - In [`application_service.py`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/backend/app/services/application_service.py):
    ```python
    ApplicationStatus.UNDER_REVIEW: [
        ApplicationStatus.SCHEDULED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.CLARIFICATION_ASKED,
    ],
    ApplicationStatus.CLARIFICATION_ASKED: [
        ApplicationStatus.UNDER_REVIEW,
    ],
    ApplicationStatus.SUBMITTED: [
        ApplicationStatus.PAYMENT_UPLOADED,
        ApplicationStatus.UNDER_REVIEW,
    ],
    ApplicationStatus.PAYMENT_UPLOADED: [
        ApplicationStatus.PAYMENT_VERIFIED,
        ApplicationStatus.SUBMITTED,
    ],
    ApplicationStatus.PAYMENT_VERIFIED: [
        ApplicationStatus.UNDER_REVIEW,
    ],
    ```
- **Backend Endpoints**:
  - `PATCH /api/v1/applications/{id}/clarification/request`: LMO requests clarification with query text. Sends `NotificationType.CLARIFICATION_ASKED` to applicant.
  - `PATCH /api/v1/applications/{id}/clarification/respond`: Applicant submits explanation / document update. Status returns to `UNDER_REVIEW`.
- **Frontend Components**:
  - Clarification query banner on application detail page.
  - Action buttons in [`ApplicationActionBar.tsx`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/applications/ApplicationActionBar.tsx).

### 4. Owner KYC Fields
- **Database Schema**:
  - Add to `stakeholder_profiles`:
    - `gstin` (VARCHAR(15), nullable)
    - `pan` (VARCHAR(10), nullable)
    - `business_type` (VARCHAR(32), nullable) — `COMMERCIAL_USER`, `MANUFACTURER`, `DEALER`, `REPAIRER`, `IMPORTER`
    - `aadhaar_reference` (VARCHAR(32), nullable)
- **Validation**:
  - Standard GSTIN regex: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
  - Standard PAN regex: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`
- **Frontend**:
  - Profile page [`frontend/src/app/(authenticated)/profile/page.tsx`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/app/(authenticated)/profile/page.tsx) updated with KYC card and statutory business type badge.

### 5. TAC & Purchase Invoice Frontend Integration
- **Components**:
  - Enhance [`RegisterInstrumentModal.tsx`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/instruments/RegisterInstrumentModal.tsx) to provide upload inputs for:
    - Purchase Invoice (JPG/PNG/PDF)
    - Type Approval Certificate (TAC) (required for Initial verification)
  - Ensure the file remains under 300 lines by delegating upload helpers.
  - Display invoice & TAC links on the Instrument Dossier page ([`frontend/src/app/(authenticated)/instruments/[id]/page.tsx`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/app/(authenticated)/instruments/[id]/page.tsx)).

### 6. Whistleblower & Discrepancy Reporting
- **Public Reporting API**:
  - [`backend/app/api/v1/public_reports.py`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/backend/app/api/v1/public_reports.py):
    - `POST /api/v1/public/certificates/{token}/report-discrepancy` (unauthenticated).
    - Accepts: `discrepancy_type` (SEAL_TAMPERED, EXPIRED_IN_USE, SERIAL_MISMATCH, LOCATION_MISMATCH, OTHER), `description`, `reporter_name`, `reporter_contact`, `evidence_image_url`.
    - Generates high-priority in-app notification for Legal Metrology Officers and system audit log.
- **Frontend Component**:
  - [`frontend/src/features/verify/DiscrepancyReportModal.tsx`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/verify/DiscrepancyReportModal.tsx)
  - Integrated into [`frontend/src/app/verify/[token]/page.tsx`](file:///c:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/app/verify/[token]/page.tsx) via an *"⚠️ Report Discrepancy / Tampering"* action button.

---

## 🧪 Testing and Verification Strategy

1. **Automated Unit & Integration Tests**:
   - `test_fee_calculation.py`: Test base fee table across weighing/flow/volume instruments, test late fee 50% quarter accrual and grace period.
   - `test_payment_workflow.py`: Test challan upload, LMO verification, transition to `UNDER_REVIEW`.
   - `test_clarification_workflow.py`: Test LMO clarification request, notification delivery, applicant response, status loop.
   - `test_public_discrepancy_report.py`: Test unauthenticated reporting, input validation, officer notification.
2. **End-to-End Walkthrough**:
   - Log in as **Owner** -> register instrument with TAC and invoice -> calculate fee -> upload challan.
   - Log in as **LMO** -> verify challan -> request clarification -> receive owner response -> approve and schedule.
   - Log in as **Public** -> inspect certificate -> test submitting an anti-tamper discrepancy report.
