# METRIX: End-to-End Backend & Frontend Inventory, Gap Analysis, and Implementation Report

**Project**: METRIX — Online Verification and Digital Certification System for Weighing and Measuring Instruments  
**Problem Statement**: SIH26036 (Smart India Hackathon)  
**Date**: September 25, 2026  
**Status**: All Identified Gaps Implemented & Validated (100% Tests Passing, Production Build Verified)

---

## 1. Executive Summary

A comprehensive architectural and functional audit of the METRIX platform was conducted across the FastAPI backend (`backend/app/api/v1/`) and Next.js frontend (`frontend/src/`). The primary objectives were:
1. Enumerate all backend API routes, models, business rules, and state machine capabilities.
2. Cross-reference them against user-facing and staff-facing frontend pages, modals, and RTK Query hooks.
3. Classify all capabilities into **Fully Covered**, **Partially Covered**, or **Not Covered**.
4. Prioritize and implement all missing frontends and wire disconnected workflows into production-ready UI components conforming to government-grade design standards and strict file line limits (Backend ≤ 500 lines, Frontend TSX/TS ≤ 300 lines).

---

## 2. Complete Backend Capabilities & Frontend Coverage Inventory

| Domain | Backend Feature / Capability | HTTP Method & Path | Auth / Role Scope | Frontend Status | Notes & UI Implementation | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | Owner Account Registration | `POST /api/v1/auth/register` | Public (Registers as `INSTRUMENT_OWNER`) | **Fully Covered** | Accessible via `/login` → Register tab with stakeholder KYC fields. | High |
| **Auth** | Password Authentication | `POST /api/v1/auth/login` | Public | **Fully Covered** | Tab in `LoginForm.tsx` returning JWT access token with role routing. | High |
| **Auth** | OTP Email Login | `POST /api/v1/auth/otp/send`<br>`POST /api/v1/auth/otp/verify` | Public | **Fully Covered** | Tab in `LoginForm.tsx` triggering OTP code dispatch and verification. | High |
| **Auth** | Google OAuth SSO | `GET /api/v1/auth/google/url`<br>`POST /api/v1/auth/google` | Public | **Fully Covered** | Handled via `GoogleLoginButton.tsx` and `/auth/google/callback`. | Medium |
| **Auth** | Stakeholder Profile & KYC | `GET /api/v1/auth/me`<br>`PATCH /api/v1/auth/me` | Authenticated | **Fully Covered** | Profile page `/profile` with `EditProfileModal.tsx` for GSTIN, PAN, and address updates. | High |
| **Auth** | Password Self-Service | `PATCH /api/v1/auth/me/password` | Authenticated | **Fully Covered** | Accessible via `ChangePasswordModal.tsx` on the `/profile` page. | Medium |
| **Instruments** | Instrument Registration | `POST /api/v1/instruments` | `INSTRUMENT_OWNER` | **Fully Covered** | Modal in `/instruments` with TAC certificate, invoice, capacity, and manufacturer. | High |
| **Instruments** | Instrument Inventory List | `GET /api/v1/instruments` | Authenticated | **Fully Covered** | DataTable on `/instruments` with type and registration number search. | High |
| **Instruments** | Bulk CSV Registration | `GET /api/v1/instruments/csv-template`<br>`POST /api/v1/instruments/batch-upload` | `INSTRUMENT_OWNER`, `ADMIN` | **Fully Covered** | Handled via `BatchRegisterModal.tsx` with live template download and error parsing. | High |
| **Instruments** | Instrument Details & Edit | `GET /api/v1/instruments/{id}`<br>`PATCH /api/v1/instruments/{id}` | Authenticated | **Fully Covered** | Interactive view at `/instruments/[id]` with edit modal and application link. | High |
| **Instruments** | Instrument Deactivation | `PATCH /api/v1/instruments/{id}/deactivate` | `INSTRUMENT_OWNER`, `ADMIN` | **Fully Covered** | Direct deactivation action on `/instruments/[id]` with confirmation dialog. | Medium |
| **Instruments** | Instrument Proof Photos | `POST /api/v1/instruments/{id}/images`<br>`DELETE /api/v1/instruments/{id}/images/{idx}` | `INSTRUMENT_OWNER`, `ADMIN` | **Fully Covered** | Handled by `InstrumentImageUpload.tsx` with proof photo carousel. | Medium |
| **Applications** | Verification Application Draft/Submit | `POST /api/v1/applications`<br>`DELETE /api/v1/applications/{id}` | `INSTRUMENT_OWNER` | **Fully Covered** | Handled via `CreateApplicationModal.tsx` and delete action on draft applications. | High |
| **Applications** | Application Search & Scrutiny | `GET /api/v1/applications`<br>`GET /api/v1/applications/{id}` | Authenticated | **Fully Covered** | Accessible on `/applications` and `/applications/[id]` with audit status timeline. | High |
| **Applications** | Status Transitions | `PATCH /api/v1/applications/{id}/status` | Authenticated | **Fully Covered** | Controlled via `ApplicationActionBar.tsx` obeying RBAC state machine. | High |
| **Applications** | Inspection Scheduling | `PATCH /api/v1/applications/{id}/schedule` | `LMO`, `ADMIN` | **Fully Covered** | Handled by `ScheduleInspectionModal.tsx` with date, slot, premises, and mode. | High |
| **Applications** | Verifier Assignment | `PATCH /api/v1/applications/{id}/assignment` | `LMO`, `ADMIN` | **Fully Covered** | Handled by `AssignVerifierModal.tsx` querying available LMO officers & GATC labs. | High |
| **Applications** | Commence Physical Inspection | `POST /api/v1/applications/{id}/inspection` | Assigned Verifier | **Fully Covered** | Action button advancing application to `INSPECTION_IN_PROGRESS`. | High |
| **Applications** | Challan Payment Receipt Upload | `POST /api/v1/applications/{id}/payment-receipt` | Applicant | **Fully Covered** | Handled via `PaymentReceiptModal.tsx` and displayed in `PaymentDetailsCard.tsx`. | High |
| **Applications** | Statutory Fee Challan Verification | `PATCH /api/v1/applications/{id}/payment-verify` | `LMO`, `ADMIN` | **Fully Covered** | Handled via `PaymentVerificationModal.tsx` allowing LMO scrutiny and approval. | High |
| **Applications** | Clarification Loop (LMO ↔ Applicant) | `PATCH /api/v1/applications/{id}/clarification/request`<br>`PATCH /api/v1/applications/{id}/clarification/respond` | `LMO`, `ADMIN` / Applicant | **Fully Covered** | Handled via `ClarificationModal.tsx` with bi-directional remarks and status rollback. | High |
| **Inspections** | Verifier Inspection Queue | `GET /api/v1/inspections` | `LMO`, `GATC`, `ADMIN` | **Fully Covered** *(Implemented)* | Connected to `/inspections` with result outcome tabs and *"My Assigned"* toggle. | High |
| **Inspections** | Standard Physical Checklist | `POST /api/v1/inspections/{id}/checklist` | `LMO`, `GATC` | **Fully Covered** | Government 6-point checklist in `InspectionResultModal.tsx` with seal numbers. | High |
| **Inspections** | Observation Recording | `POST /api/v1/inspections/{id}/observations`<br>`GET /api/v1/inspections/{id}/observations` | Assigned Verifier | **Fully Covered** | Handled via `AddObservationModal.tsx` and rendered in `ObservationsList.tsx`. | High |
| **Inspections** | Inspection Proof Photography | `POST /api/v1/inspections/{id}/images`<br>`PATCH /api/v1/inspections/{id}/certificate-image` | `LMO`, `GATC`, `ADMIN` | **Fully Covered** | Handled via `InspectionImageUpload.tsx` with certificate stamping selection. | High |
| **Inspections** | GATC Calibration Test Report | `POST /api/v1/inspections/{id}/gatc-report` | `GATC`, `ADMIN` | **Fully Covered** *(Implemented)* | Handled via `GATCReportModal.tsx` with calibration URL, observations & recommendation. | High |
| **Inspections** | LMO Endorsement of GATC Report | `PATCH /api/v1/inspections/{id}/lmo-approval` | `LMO`, `ADMIN` | **Fully Covered** *(Implemented)* | Handled via `GATCReviewModal.tsx` allowing LMO approval, rejection, or clarification. | High |
| **Inspections** | Government Inspection Report PDF | `GET /api/v1/inspections/{id}/report/download` | RBAC-enforced | **Fully Covered** *(Implemented)* | Direct ReportLab PDF download button on `/inspections` and `/applications/[id]`. | High |
| **Certificates** | Certificate Issuance | `POST /api/v1/applications/{id}/certificate` | `LMO`, `ADMIN` | **Fully Covered** | Triggered via `IssueCertificateModal.tsx` generating digital certificate and QR token. | High |
| **Certificates** | Certificate Search & Registry | `GET /api/v1/certificates` | Authenticated | **Fully Covered** | Filterable list on `/certificates` and detailed view on `/certificates/[id]`. | High |
| **Certificates** | Expiring Certificates Monitoring | `GET /api/v1/certificates/expiring` | Authenticated | **Fully Covered** *(Implemented)* | Connected to the *"Expiring Soon"* tab on `/certificates` with 30-day countdown badges. | High |
| **Certificates** | Expired Certificates Monitoring | `GET /api/v1/certificates/expired` | Authenticated | **Fully Covered** | Covered by the *"Expired"* tab in `/certificates` and search filters. | Medium |
| **Certificates** | Official Certificate PDF Download | `GET /api/v1/certificates/{id}/download` | Authenticated | **Fully Covered** | Direct download button in `CertificateCard.tsx` and `/certificates/[id]`. | High |
| **Public Registry**| QR Code Certificate Verification | `GET /api/v1/public/certificates/verify/{token}` | Public | **Fully Covered** | Public page `/verify/[token]` with anti-tampering badges and validity banner. | High |
| **Public Registry**| Certificate Number Public Lookup | `GET /api/v1/public/certificates/lookup/{number}`| Public | **Fully Covered** | Dedicated `/verify/lookup` page with live camera QR scanner and number search. | High |
| **Public Registry**| Whistleblower Discrepancy Reporting | `POST /api/v1/public/certificates/{token}/report-discrepancy` | Public | **Fully Covered** | Accessible via `DiscrepancyReportModal.tsx` on `/verify/[token]`. | High |
| **Fees & Rules** | Schedule XII & Rule 14 Calculator | `GET /api/v1/fees/calculate` | Authenticated | **Fully Covered** *(Implemented)* | Standalone interactive calculator page `/fees` with compounding delay slider. | High |
| **Dashboard** | Role-Aware Operational Metrics | `GET /api/v1/dashboard/summary` | Authenticated | **Fully Covered** | Role-tailored metric cards rendered on `/dashboard` and `/admin/system`. | High |
| **Dashboard** | Statistical Analytics & Chart Series | `GET /api/v1/dashboard/charts` | Authenticated | **Fully Covered** | Segregated Recharts visualizations on `/dashboard` and `/analytics`. | High |
| **Notices** | Circulars & Announcements | `GET /api/v1/notices`<br>`POST /api/v1/notices`<br>`DELETE /api/v1/notices/{id}` | Public (Read), `ADMIN` (Write) | **Fully Covered** | Handled by `NoticeBoard.tsx` with admin broadcast creation and deletion. | Medium |
| **Notifications** | In-App Alerts & Expiry Scanner | `GET /api/v1/notifications`<br>`PATCH /api/v1/notifications/{id}/read`<br>`POST /api/v1/notifications/check-expiries` | Authenticated / Staff | **Fully Covered** | Full management on `/notifications` with one-click administrative expiry scanner. | High |
| **Reports** | Operational & Audit CSV Exports | `GET /api/v1/reports/*` (5 endpoints) | `LMO`, `GATC`, `ADMIN` | **Fully Covered** | Dedicated export hub on `/reports` with date range and status filters. | High |
| **Admin** | User Provisioning & Account Control | `GET /api/v1/admin/users`<br>`POST /api/v1/admin/users`<br>`PATCH /api/v1/admin/users/{id}/*` | `ADMIN` | **Fully Covered** | Full management on `/admin/users` with official user provisioning modal. | High |
| **System** | Live Infrastructure Health Monitoring | `GET /api/v1/health` | Public / Admin | **Fully Covered** *(Implemented)* | Integrated into `/admin/system` showing real-time API, DB pool, and security status. | Medium |

---

## 3. Prioritized Implementation Plan & Delivered Solutions

### Pass 1: Inspections Queue & Verifier Operational Workflow (High Priority)
- **Problem**: Verifiers clicking "My Inspections" were shown applications rather than the backend `/inspections` queue. They had no way to distinguish LMO Field vs GATC Lab inspections, filter by outcome, or download government-standard PDF inspection reports.
- **Solution Delivered**:
  - Refactored [inspections/page.tsx](file:///C:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/app/(authenticated)/inspections/page.tsx) (231 lines) using `useListInspectionsQuery`.
  - Added filter tabs for inspection outcomes (`ALL`, `SCHEDULED`, `VERIFIED`, `REJECTED`).
  - Added *"Show Only My Assigned"* filter toggle for logged-in officers and laboratories.
  - Added visual inspection mode badges (`LMO Field` in blue vs `GATC Lab` in purple).
  - Added one-click PDF inspection report download button targeting `GET /api/v1/inspections/{id}/report/download`.

### Pass 2: GATC Specialized Calibration & LMO Endorsement Engine (High Priority)
- **Problem**: GATC testing centres had no way to submit calibration dossiers or recommendations, and LMO officers had no interface to review GATC calibration reports before issuing certificates.
- **Solution Delivered**:
  - Implemented [gatc_service.py](file:///C:/Users/vishn/OneDrive/Documents/Metrix/backend/app/services/gatc_service.py) (195 lines) encapsulating report submission, recommendation recording, LMO review, and notification dispatch.
  - Added backend endpoints `POST /api/v1/inspections/{id}/gatc-report` and `PATCH /api/v1/inspections/{id}/lmo-approval` in [inspections.py](file:///C:/Users/vishn/OneDrive/Documents/Metrix/backend/app/api/v1/inspections.py).
  - Built [GATCReportModal.tsx](file:///C:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/inspections/GATCReportModal.tsx) (217 lines) for GATC test centres to upload calibration test certificates, add parameter observations, and record formal recommendations (`CERTIFY` / `REJECT`).
  - Built [GATCReviewModal.tsx](file:///C:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/inspections/GATCReviewModal.tsx) (159 lines) for LMO officers to review calibration dossiers, endorse or reject, or request clarification.
  - Enhanced [InspectionCard.tsx](file:///C:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/applications/InspectionCard.tsx) (229 lines) to display calibration dossiers, recommendation badges, and role-gated action buttons.

### Pass 3: Statutory Fee Calculator Page (Rule 14 & Schedule XII) (High Priority)
- **Problem**: The statutory fee calculation engine (`/api/v1/fees/calculate`) computes legal fees under Schedule XII and compound late surcharges under Rule 14(2), but lacked a dedicated interactive frontend calculator for citizens and officers.
- **Solution Delivered**:
  - Created [fees/page.tsx](file:///C:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/app/(authenticated)/fees/page.tsx) (198 lines).
  - Features real-time instrument type selection and dynamic capacity unit adaptation (`kg`, `g`, `tonne`, `litre`, etc.).
  - Added an interactive delay slider (0 to 365 days) with compounding quarterly penalty calculation.
  - Provides a breakdown summary citing Schedule XII base fees, Rule 14 late surcharges, and total statutory fees.
  - Added Fee Calculator navigation entries in [roleConfig.ts](file:///C:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/utils/roleConfig.ts), [Sidebar.tsx](file:///C:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/components/layout/Sidebar.tsx), and [QuickNavPanel.tsx](file:///C:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/dashboard/QuickNavPanel.tsx).

### Pass 4: Live Infrastructure Health Monitoring (Medium Priority)
- **Problem**: The backend health check endpoint `GET /api/v1/health` was unrepresented in the Admin System console.
- **Solution Delivered**:
  - Added `getSystemHealth` query in [adminApi.ts](file:///C:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/admin/adminApi.ts).
  - Built a live "Services & Connectivity Status" dashboard in [admin/system/page.tsx](file:///C:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/app/(authenticated)/admin/system/page.tsx) (140 lines) displaying real-time API operational status, PostgreSQL database connection pool health, and environment metadata.

### Pass 5: Line Limit Hardening & Code Refactoring
- **Problem**: [InspectionResultModal.tsx](file:///C:/Users/vishn/OneDrive/Documents/Metrix/frontend/src/features/applications/InspectionResultModal.tsx) exceeded the mandatory frontend line limit of 300 lines (previously 310 lines).
- **Solution Delivered**:
  - Compacted physical inspection toggles, metrological observations, and form state handling.
  - Reduced file size from 310 lines to 228 lines without removing any functionality or validation checks.

---

## 4. Verification and Validation Results

### 1. Backend Automated Testing
- Command: `.venv\Scripts\python.exe -m pytest tests/`
- **Result**: `65 passed, 2 warnings in 36.81s` (100% pass rate).
- Full coverage achieved across:
  - Auth, RBAC, and KYC updates
  - Verification application lifecycle transitions
  - Inspection scheduling, checklist recording, and ReportLab PDF report generation
  - GATC calibration report upload & LMO endorsement
  - Statutory fee calculation & Rule 14 late penalty engine
  - Public QR code verification and anti-tamper whistleblower reporting

### 2. Frontend Type Checking
- Command: `npx tsc --noEmit`
- **Result**: Exit code `0` (Zero TypeScript compilation errors).

### 3. Frontend Production Build
- Command: `npm run build`
- **Result**: Exit code `0` (All 21 static and dynamic Next.js routes compiled and optimized successfully).

---

## 5. Architectural & Line Limit Conformance

Every file modified or created strictly adheres to the mandatory project constraints:

| File Path | Type | Current Lines | Limit | Status |
| :--- | :--- | :--- | :--- | :--- |
| `backend/app/api/v1/inspections.py` | Backend Router | 389 | 500 | **Compliant** |
| `backend/app/services/gatc_service.py` | Backend Service | 195 | 500 | **Compliant** |
| `backend/app/services/fee_service.py` | Backend Service | 210 | 500 | **Compliant** |
| `backend/app/api/v1/fees.py` | Backend Router | 45 | 500 | **Compliant** |
| `backend/tests/test_phase1_mvp_completion.py` | Test Suite | 333 | 500 | **Compliant** |
| `frontend/src/app/(authenticated)/inspections/page.tsx` | Frontend Page | 231 | 300 | **Compliant** |
| `frontend/src/app/(authenticated)/fees/page.tsx` | Frontend Page | 198 | 300 | **Compliant** |
| `frontend/src/app/(authenticated)/certificates/page.tsx` | Frontend Page | 152 | 300 | **Compliant** |
| `frontend/src/app/(authenticated)/admin/system/page.tsx` | Frontend Page | 140 | 300 | **Compliant** |
| `frontend/src/features/inspections/GATCReportModal.tsx` | Frontend Modal | 217 | 300 | **Compliant** |
| `frontend/src/features/inspections/GATCReviewModal.tsx` | Frontend Modal | 159 | 300 | **Compliant** |
| `frontend/src/features/applications/InspectionCard.tsx` | Frontend Component | 229 | 300 | **Compliant** |
| `frontend/src/features/applications/InspectionResultModal.tsx` | Frontend Modal | 228 | 300 | **Compliant** |
| `frontend/src/features/dashboard/QuickNavPanel.tsx` | Frontend Component | 111 | 300 | **Compliant** |
| `frontend/src/utils/roleConfig.ts` | Frontend Config | 125 | 300 | **Compliant** |
| `frontend/src/components/layout/Sidebar.tsx` | Frontend Component | 121 | 300 | **Compliant** |
| `frontend/src/types/domain.ts` | Frontend Types | 294 | 300 | **Compliant** |
