# METRIX

> **Online Verification and Digital Certification System for Weighing and Measuring Instruments**  
> *Developed for Smart India Hackathon Problem Statement SIH26036 (Department of Consumer Affairs, Legal Metrology Division)*

---

## 1. System Overview

**METRIX** is an enterprise-grade Legal Metrology automation platform designed to digitize the statutory lifecycle for commercial weighing and measuring instruments. It provides complete digital governance: equipment owners register instruments and submit verification requests; Legal Metrology Officers (LMOs) and Government Approved Test Centres (GATCs) schedule, inspect, record physical observations, and upload inspection proof; and the platform issues tamper-evident, bilingual digital certificates embedded with high-correction QR codes and SHA-256 cryptographic digests.

Consumers, enforcement officials, and businesses can verify certificate authenticity in real-time via the public verification portal using live webcam/mobile QR scanning or certificate number lookup.

---

## 2. Core Legal Metrology Lifecycle

```text
Instrument Owner / Business
        ↓
Instrument Registration (with Cloudinary Photo Upload)
        ↓
Verification / Re-verification Application
        ↓
Application Review & Allocation (Admin / LMO)
        ↓
Field / Laboratory Inspection (LMO / GATC)
        ↓
Observation Logging & Proof Photos Upload
        ↓
Certificate Stamping Image Selection
        ↓
Verification Determination (VERIFIED / REJECTED)
        ↓
Statutory Digital Certificate Issuance (A4 PDF + SHA-256 Hash + Level H QR)
        ↓
Public Verification (Webcam QR Scanner / Certificate Number Lookup)
        ↓
Statutory Expiry Tracking & Automated 30-Day Renewal Warnings
```

---

## 3. Technology Stack & Constraints

- **Backend**: Python 3.10+ (FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, PostgreSQL, Pytest)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Redux Toolkit, RTK Query
- **Media & Cloud CDN**: Cloudinary REST API & SDK with automatic local storage fallback
- **Certificates & QR**: ReportLab A4 PDF Engine, Python `qrcode` (Level H), SHA-256 Digest
- **Client Camera Scanner**: `html5-qrcode` real-time camera stream decoder
- **Architecture**: Software-Only Modular Monolith (Strictly No Docker, Kubernetes, Kafka, Redis, or AI/ML)

---

## 4. Key Functional Capabilities

### Multi-Method Authentication & RBAC
- **Password Authentication**: Bcrypt-hashed password authentication with signed JWT bearer tokens.
- **Passwordless Email OTP**: One-Time Password generation and SMTP email dispatch (Gmail TLS/SSL).
- **Google OAuth 2.0**: Single Sign-On integration via Google Identity Services.
- **4 Strict Roles**: `INSTRUMENT_OWNER`, `LMO` (Legal Metrology Officer), `GATC` (Test Centre), `ADMIN` (National Controller).

### Multi-Photo Device & Proof Management
- Device photo uploads during instrument registration (up to 3 photos max) delivered via Cloudinary CDN.
- Inspection proof photo logging by officers during physical verification.
- Official Certificate Photo Selection: Officer designates which physical inspection photo is stamped onto the legal certificate.

### Batch / CSV Instrument Registration
- High-throughput CSV batch registration allowing equipment owners and administrators to onboard up to 100 instruments per batch.
- Statutory CSV template generation (`GET /api/v1/instruments/csv-template`) with predefined headers and sample rows.
- Atomic row-by-row parsing, UTF-8/Latin-1 auto-decoding, model validation, and comprehensive error reporting (`successful_count`, `failed_count`, and row-level rejection reasons).

### Government-Standard Bilingual Certificate PDF
- Bilingual Hindi/English header (*भारत सरकार / उपभोक्ता मामले विभाग*).
- Gold and navy statutory borders, instrument particulars grid, and statutory compliance declaration.
- **Statutory Anti-Copy Watermark**: Diagonal 45-degree underlay canvas watermark (*"LEGAL METROLOGY DIGITAL CERTIFICATE" / "GOVERNMENT OF INDIA • STATUTORY VERIFICATION"*) preventing photocopied and forged physical representations.
- Embedded high-correction Level H QR code linking directly to public verification.
- Tamper-evident cryptographic SHA-256 integrity hash block and officer signature fields.

### Public QR Camera Scanner & Portal (`/verify/lookup`)
- Real-time webcam / smartphone camera QR code scanner with canvas overlay.
- Dual-mode verification: camera QR scan or direct manual Certificate Number lookup.
- Live anti-tampering verification showing statutory validity, owner, inspector, and SHA-256 hash.

### Public Notice Board & Visual Analytics
- Real-time statutory notices and circulars on the landing page, managed by administrators.
- Dashboard analytical charts: verification lifecycle distribution, monthly volume trends, instrument categories, and certificate expiry breakdown.

---

## 5. Local Development Setup

### Prerequisites
- Python 3.10+ & Node.js 18+ (Node.js 20 LTS recommended)
- PostgreSQL 14+ database service running locally or in cloud (e.g., Aiven)

### 1. Environment Configuration
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Configure your environment variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/metrix_db
SECRET_KEY=your-secure-secret-key-min-32-chars
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
PUBLIC_VERIFICATION_BASE_URL=http://localhost:3000/verify

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email OTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary Storage (Optional - falls back to local disk)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Backend Setup & Migrations
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Run migrations and seed standard accounts
alembic upgrade head
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- **Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/v1/health`

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- **Web Application**: `http://localhost:3000`
- **Public QR Scanner**: `http://localhost:3000/verify/lookup`

---

## 6. Seeded Demonstration Accounts

| Role | Email Address | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@metrix.gov.in` | `AdminPass123!` | System oversight, user provisioning, notice board control, audit stream |
| **LMO** | `lmo@metrix.gov.in` | `LmoPass123!` | Application review, inspection scheduling, observation logging, certificate issuance |
| **GATC** | `gatc@testinglab.org` | `GatcPass123!` | Laboratory calibration testing, observation records, verification determinations |
| **INSTRUMENT_OWNER** | `owner@example.com` | `OwnerPass123!` | Device registration, photo upload, verification applications, certificate tracking |

---

## 7. Frontend Route Catalog (20 Compiled Routes)

| Route | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Landing page with lifecycle explainer, public notice board, and quick search |
| `/login` | Public | Authentication portal with Password, Email OTP, Google OAuth, and 1-click test credentials |
| `/auth/google/callback` | Public | OAuth callback receiver and JWT session initializer |
| `/verify/lookup` | Public | Real-time camera QR code scanner & Certificate Unique Number lookup portal |
| `/verify/[token]` | Public | Public certificate verification view with anti-tamper SHA-256 fingerprint |
| `/dashboard` | Authenticated | Role-tailored operational metrics, analytics charts, and action workflows |
| `/instruments` | Authenticated | Instrument inventory with search, category filtering, and registration modal |
| `/instruments/[id]` | Authenticated | Instrument dossier, multi-photo gallery, verification history, and deactivation |
| `/applications` | Authenticated | Verification applications workbench with tabbed status filtering |
| `/applications/[id]` | Authenticated | Application state machine actions, scheduling, and officer allocation |
| `/inspections` | LMO, GATC, Admin | Inspection task queue with assignment filtering and quick observation links |
| `/certificates` | Authenticated | Certificate registry with active/expiring/expired filtering and PDF downloads |
| `/certificates/[id]` | Authenticated | Official certificate dossier with QR preview, SHA-256 digest, and PDF download |
| `/notices` | Authenticated | Notice management interface (admin publishing and public feed) |
| `/notifications` | Authenticated | In-app notification center with read/unread filtering and mark-all actions |
| `/profile` | Authenticated | User account settings, profile update, and password change |
| `/reports` | Authenticated | Regulatory & operational CSV export generator |
| `/search` | Authenticated | Global cross-entity search across instruments, applications, and certificates |
| `/admin/users` | Admin | User management table, role filtering, active toggling, and officer provisioning |
| `/admin/system` | Admin | Real-time system health, database metrics, and audit/error log stream |

---

## 8. REST API Architecture (65 Endpoints across 55 Paths)

- **Authentication & Profile**: `POST /auth/register`, `POST /auth/login`, `GET|PATCH /auth/me`, `PATCH /auth/me/password`, `POST /auth/otp/send`, `POST /auth/otp/verify`, `GET|POST /auth/google*`
- **Instruments**: `POST|GET /instruments`, `GET /instruments/csv-template`, `POST /instruments/batch-upload`, `GET|PATCH /instruments/{id}`, `PATCH /instruments/{id}/deactivate`, `POST|DELETE /instruments/{id}/images*`
- **Applications**: `POST|GET /applications`, `GET|DELETE /applications/{id}`, `PATCH /applications/{id}/status`, `PATCH /applications/{id}/schedule`, `PATCH /applications/{id}/assignment`
- **Inspections & Proof**: `GET /inspections`, `GET /inspections/{id}`, `POST /applications/{id}/inspection`, `POST|GET /inspections/{id}/observations`, `PATCH /inspections/{id}/result`, `POST /inspections/{id}/images`, `PATCH /inspections/{id}/certificate-image`
- **Certificates & Verification**: `POST|GET /applications/{id}/certificate`, `GET /certificates`, `GET /certificates/{id}`, `GET /certificates/{id}/download`, `GET /certificates/expiring`, `GET /certificates/expired`, `GET /public/certificates/verify/{token}`, `GET /public/certificates/lookup/{number}`
- **Public Notices & News**: `GET|POST /notices`, `DELETE /notices/{id}`
- **Analytics & Operations**: `GET /dashboard/summary`, `GET /dashboard/charts`, `GET|POST|PATCH /notifications*`, `GET /reports/*`, `POST /uploads/image`, `GET /health`

---

## 9. Automated Testing & Verification

```bash
# Backend Pytest Suite (55 tests passing across RBAC, workflows, batch uploads, certificates, domain rules)
cd backend
.\.venv\Scripts\python.exe -m pytest

# Frontend Type Safety Check
cd ../frontend
npm run type-check
```


---

## 10. Engineering Governance & Line Limits

- **Backend Python files**: Maximum **500 lines** per file.
- **Frontend TS/TSX files**: Maximum **300 lines** per file.
- **Architecture**: Strict modular monolith (Router → Service → Repository → ORM → PostgreSQL).
- **Quality**: Type-safe Pydantic contracts, strict error handling, and zero external message brokers.
