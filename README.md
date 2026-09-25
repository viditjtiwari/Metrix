# METRIX

> **Online Verification and Digital Certification System for Weighing and Measuring Instruments**  
> *Developed for Smart India Hackathon Problem Statement SIH26036 (Department of Consumer Affairs, Legal Metrology Division)*

---

## 1. System Overview

**METRIX** is an enterprise-grade Legal Metrology automation platform designed to digitize the statutory lifecycle for commercial weighing and measuring instruments in accordance with the Legal Metrology Act, 2009 and the Legal Metrology (General) Rules, 2011.

The platform provides end-to-end digital governance across all statutory actors:
- **Instrument Owners / Traders**: Register instruments with TAC certificates & invoices, compute statutory fees, submit verification/re-verification applications, and upload payment receipts.
- **Legal Metrology Officers (LMOs)**: Conduct field verifications, perform category-specific checklists, log physical observations, endorse GATC laboratory dossiers, verify fees, and issue digitally signed certificates.
- **Government Approved Test Centres (GATCs)**: Carry out specialized calibration and verification testing on precision instruments, flow meters, and weighbridges, generating formal laboratory dossiers for LMO approval.
- **State & National Administrators**: Monitor cross-jurisdictional verification queues, inspect real-time system health & PostgreSQL connection pools, audit stakeholder activity, and broadcast gazette notifications.
- **Public & Consumers**: Scan high-correction QR codes via real-time camera or lookup certificate numbers to verify authenticity and report suspicious or tampered certificates.

---

## 2. Core Legal Metrology Lifecycle

```text
Instrument Owner / Business
        ↓
Instrument Registration (Photos + TAC + Invoice)
        ↓
Statutory Fee Calculation (Schedule XII + Rule 14 Late Surcharges)
        ↓
Verification / Re-verification Application + Payment Receipt Upload
        ↓
LMO Application Review & Fee Verification
   ├── [Clarification Loop] ↔ Applicant response
        ↓
Scheduling & Officer / Test Centre Allocation
        ↓
Inspection & Testing:
   ├── Field Inspection (LMO): Checklists + Observation Logging + Proof Photos
   └── Lab Calibration (GATC): Calibration Dossier → LMO Statutory Endorsement
        ↓
Verification Determination (VERIFIED / REJECTED)
   ├── If Verified: Tamper-Evident Bilingual PDF Certificate + Level H QR + SHA-256
   └── If Rejected: Formal Rejection Order with statutory grounds
        ↓
Public QR Scanner / Token Verification & Discrepancy Reporting
        ↓
Expiry Tracking & Automated 30-Day Renewal Warnings → Re-Verification
```

---

## 3. Technology Stack & Architecture

- **Backend**: Python 3.12 (FastAPI, Pydantic v2, SQLAlchemy 2.x ORM, Alembic migrations, PostgreSQL, Pytest)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Redux Toolkit, RTK Query
- **PDF & Digital Certificates**: ReportLab PDF Engine (bilingual certificates and inspection reports)
- **Security & QR**: SHA-256 cryptographic digests, `qrcode` (Error Correction Level H), Bcrypt, JWT bearer tokens
- **Public Verification & Scanning**: `html5-qrcode` real-time camera barcode scanner with canvas overlays
- **Cloud Storage**: Cloudinary REST API / SDK with transparent local disk filesystem fallback
- **Architecture**: Software-Only Modular Monolith (Strictly compliant with hackathon constraints: no Docker, Kubernetes, Celery, Redis, or microservices)

---

## 4. Comprehensive Feature Inventory

### A. Authentication, RBAC & KYC
- **Triple Auth Engine**: Passwords with bcrypt hashing, passwordless Email OTP (SMTP), and Google OAuth 2.0.
- **4 Strict Roles**: `INSTRUMENT_OWNER`, `LMO` (Legal Metrology Officer), `GATC` (Government Approved Test Centre), `ADMIN`.
- **Trader KYC Integration**: Mandatory GSTIN (15-character statutory format), PAN card, trade license number, and business classification during registration and profile management.

### B. Instrument Lifecycle & Batch Onboarding
- **Device Registration**: Register single instruments with serial numbers, model details, capacity ranges, and manufacturer specifications.
- **Multi-Photo Proof**: Upload up to 3 device images (front, nameplate/weights stamp, seal) with Cloudinary/local storage support.
- **Statutory Document Storage**: Attach Type Approval Certificate (TAC) and purchase invoice URLs.
- **High-Throughput CSV Batch Upload**: Bulk register up to 100 instruments in a single CSV transaction.
- **Batch CSV Template Engine**: Download official CSV template (`/instruments/csv-template`) directly with pre-filled headers and validation examples.

### C. Statutory Fee Calculation Engine (Rule 14 & Schedule XII)
- **Dedicated Interactive Calculator (`/fees`)**:
  - Full Schedule XII fee table covering Weighing Instruments (Classes I–IV), Weights, Measures of Length & Capacity, Petroleum Dispensers, and Flow Meters.
  - Dynamic capacity units (`kg`, `g`, `tonne`, `litre`, `no_unit`).
  - Compounding quarterly late fee calculations under Rule 14(2) (+50% per quarter or fraction thereof delayed past statutory expiry).
  - Detailed legal reference citations and statutory breakdown.

### D. Verification Applications & Payment Workflow
- **Application Flow**: Submit Initial Verification or Re-Verification with instant fee quote.
- **Payment Receipt Submission**: Applicants upload UTR / transaction references and receipt proof.
- **LMO Payment Verification**: Officers inspect receipt proof, mark payments as `VERIFIED` or `FAILED`, and record remarks.
- **Two-Way Clarification Loop**:
  - LMO requests clarifications on documentation or specs (`CLARIFICATION_ASKED`).
  - Applicant submits answers directly in the portal, automatically returning the application to `UNDER_REVIEW`.

### E. Inspections, Checklists & Laboratory Calibrations
- **Inspection Queue (`/inspections`)**: Real-time queue filtered by status (`SCHEDULED`, `VERIFIED`, `REJECTED`) and *"Only My Assigned"* toggle.
- **Pre-Inspection Checklist**: Mandatory verification checklists tailored by instrument type (visual inspection, zero-load test, eccentric loading, repeatability, sealing).
- **Physical Observation Logging**: Record observed vs standard values, tolerances, and pass/fail criteria per parameter.
- **GATC Laboratory Calibration Dossier**:
  - GATC laboratories record temperature, humidity, reference standards, and test observations.
  - Upload NABL-accredited calibration certificates and submit formal recommendations (`CERTIFY` / `REJECT`).
- **LMO Statutory Endorsement**:
  - LMO officers review submitted GATC dossiers in a dedicated audit modal.
  - Statutory approval or rejection with legal remarks.
- **ReportLab Inspection PDF Reports**:
  - Instant PDF download (`/api/v1/inspections/{id}/report/download`) detailing inspection particulars, observations, and verifier credentials.

### F. Bilingual Tamper-Evident Certificates & QR Security
- **Official Bilingual PDF (ReportLab)**:
  - Formal Government of India / Department of Consumer Affairs header (*भारत सरकार / उपभोक्ता मामले विभाग*).
  - Gold and navy security borders with anti-counterfeit 45° canvas watermark.
  - Embedded physical device inspection stamping photo chosen by the officer.
  - Embedded Level H QR Code and tamper-evident SHA-256 digest block.
- **Live Expiring Certificates Queue**: Filter certificates expiring within 30 days (`/certificates?tab=expiring`) to proactively trigger renewals.
- **One-Click Re-Verification Action**: Direct button on certificate dossier pre-populating a re-verification application with past instrument details.

### G. Public QR Scanner & Citizen Discrepancy Reporting
- **Public Portal (`/verify/lookup` & `/verify/[token]`)**:
  - Live webcam and smartphone camera QR code scanner.
  - Manual Certificate Identification Number search.
  - Complete public verification dossier showing validity status, instrument details, owner name, and officer seal.
- **Citizen Discrepancy / Whistleblower Reporting**:
  - Consumers can report suspicious, tampered, or expired certificates directly from the verification view.
  - Reports enter the regulatory inspection stream for administrative review.

### H. System Health, Tenancy & Visual Analytics
- **Live System Health Monitor (`/admin/system`)**: Real-time monitoring of API Gateway latency, PostgreSQL connection pool metrics, security subsystem status, and tenancy role distribution.
- **Operations & Regulatory Analytics (`/analytics` & `/dashboard`)**: Interactive charts for verification volume trends, instrument categories, pass/fail ratios, and certificate expiry forecasts.
- **Audit & Notice Management (`/notices`)**: Administrative gazette notice publisher displaying real-time alerts across the public portal.

---

## 5. Local Setup & Execution Guide

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** (Node.js 20 LTS recommended)
- **PostgreSQL 14+** running locally on port 5432 (database: `metrix_db`)

### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1    # On Windows
# source .venv/bin/activate     # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed fresh test accounts and demo data
python app/scripts/seed_dev_users.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- **API Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Endpoint**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 2. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Next.js development server
npm run dev
```
- **Web Application Portal**: [http://localhost:3000](http://localhost:3000)
- **Public QR Scanner**: [http://localhost:3000/verify/lookup](http://localhost:3000/verify/lookup)
- **Statutory Fee Calculator**: [http://localhost:3000/fees](http://localhost:3000/fees)

---

## 6. Seeded Demonstration Accounts

| Role | Email Address | Password | Key Responsibilities & Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@metrix.gov.in` | `Admin@123` | System oversight, connection pool health, notice board, global user management |
| **Legal Metrology Officer (LMO)** | `lmo.officer@metrix.gov.in` | `Officer@123` | Application review, fee verification, field checklists, GATC dossier endorsement, certificate issuance |
| **GATC Test Centre** | `gatc.lab@metrix.gov.in` | `Lab@123` | Laboratory calibration testing, observation records, calibration certificate submission |
| **Instrument Owner** | `trader.owner@metrix.gov.in` | `Owner@123` | Instrument onboarding, fee calculation, application submission, payment receipt upload, certificate tracking |

---

## 7. Next.js Route Catalog (21 Compiled Routes)

| Route | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Public | Citizen landing page, statutory notice board, lifecycle workflow explainer |
| `/login` | Public | Multi-mode login (Password, OTP, Google SSO, and 1-click role logins) |
| `/auth/google/callback` | Public | Google OAuth callback handler |
| `/verify/lookup` | Public | Live camera QR code scanner & certificate lookup portal |
| `/verify/[token]` | Public | Public certificate verification view with tamper-check & discrepancy reporter |
| `/fees` | Authenticated / Public | Statutory Schedule XII fee calculator with Rule 14 delay penalty slider |
| `/dashboard` | Authenticated | Operational metrics, role-specific action items, and live statistics |
| `/instruments` | Authenticated | Instrument inventory, batch CSV template download, and multi-photo registration |
| `/instruments/[id]` | Authenticated | Instrument particulars, TAC/invoice links, and historical certificates |
| `/applications` | Authenticated | Verification applications pipeline with tabbed status filtering |
| `/applications/[id]` | Authenticated | Application state machine, payment card, clarification loop, and scheduling |
| `/inspections` | LMO, GATC, Admin | Inspection queue with status tabs, assigned-only filter, and PDF report downloads |
| `/certificates` | Authenticated | Certificate registry with active/expiring/expired tabs and bulk actions |
| `/certificates/[id]` | Authenticated | Certificate dossier with QR preview, SHA-256 digest, and re-verify action |
| `/analytics` | Authenticated | Regulatory analytics dashboard with distribution trends and charts |
| `/notices` | Authenticated | Administrative notice board manager and public gazette circular feed |
| `/notifications` | Authenticated | In-app notification center with read/unread filtering |
| `/profile` | Authenticated | User account settings, trader KYC fields (GSTIN/PAN), and password updates |
| `/reports` | Authenticated | Regulatory & operational CSV export generator |
| `/search` | Authenticated | Global cross-entity search across instruments, applications, and certificates |
| `/admin/system` | Admin | Real-time system health, database connection pool, and tenancy breakdown |

---

## 8. REST API Summary (70+ Endpoints)

- **Authentication & KYC**: `POST /auth/register`, `POST /auth/login`, `GET|PATCH /auth/me`, `PATCH /auth/me/password`, `POST /auth/otp/send`, `POST /auth/otp/verify`, `GET|POST /auth/google*`
- **Fee Engine**: `GET /fees/calculate`
- **Instruments**: `POST|GET /instruments`, `GET /instruments/csv-template`, `POST /instruments/batch-upload`, `GET|PATCH /instruments/{id}`, `PATCH /instruments/{id}/deactivate`, `POST|DELETE /instruments/{id}/images*`
- **Applications & Payments**: `POST|GET /applications`, `GET|DELETE /applications/{id}`, `PATCH /applications/{id}/status`, `PATCH /applications/{id}/schedule`, `PATCH /applications/{id}/assignment`, `POST /applications/{id}/payment-receipt`, `POST /applications/{id}/verify-payment`, `POST /applications/{id}/request-clarification`, `POST /applications/{id}/submit-clarification`
- **Inspections & Laboratory Calibrations**: `GET /inspections`, `GET /inspections/{id}`, `POST /applications/{id}/inspection`, `POST|GET /inspections/{id}/observations`, `PATCH /inspections/{id}/result`, `POST /inspections/{id}/images`, `PATCH /inspections/{id}/certificate-image`, `POST /inspections/{id}/gatc-report`, `PATCH /inspections/{id}/lmo-approval`, `GET /inspections/{id}/report/download`
- **Certificates & Verification**: `POST|GET /applications/{id}/certificate`, `GET /certificates`, `GET /certificates/{id}`, `GET /certificates/{id}/download`, `GET /certificates/expiring`, `GET /certificates/expired`, `GET /public/certificates/verify/{token}`, `GET /public/certificates/lookup/{number}`, `POST /certificates/report-discrepancy`
- **System Health & Governance**: `GET /health`, `GET /dashboard/summary`, `GET /dashboard/charts`, `GET|POST|PATCH /notifications*`, `GET|POST|DELETE /notices*`, `GET /reports/*`

---

## 9. Quality Assurance & Engineering Standards

- **Backend Pytest Suite**: 65 comprehensive automated tests passing with 100% success rate:
  ```bash
  cd backend
  .venv\Scripts\pytest tests/
  ```
- **Frontend Type Safety & Build**: 0 TypeScript compilation errors; 21/21 App Router pages statically and dynamically optimized:
  ```bash
  cd frontend
  npm run build
  ```
- **Mandatory File Line Limits**:
  - Python files: strictly **<= 500 lines** per file.
  - TypeScript/TSX files: strictly **<= 300 lines** per file.
  - Test files: strictly **<= 500 lines** per file.
- **Architectural Principle**: Strict separation of concerns (Routers → Services → Repositories → ORM Models). Models are never directly exposed to API consumers.
