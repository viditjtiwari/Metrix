# METRIX

> **Online Verification and Digital Certification System for Weighing and Measuring Instruments**  
> *Developed for Smart India Hackathon Problem Statement SIH26036 (Department of Consumer Affairs)*

---

## 1. Project Summary

**METRIX** is a web-based legal metrology verification platform designed to digitize the statutory lifecycle for commercial weighing and measuring instruments. It enables equipment owners to register instruments and apply for verification/re-verification, enables Legal Metrology Officers (LMOs) and Government Approved Test Centres (GATCs) to schedule, inspect, and record metrological observations, and generates tamper-evident digital certificates embedded with verifiable QR codes and anti-tamper SHA-256 digests.

**Master Documentation**: For the complete, authoritative knowledge base, consult the [Documentation Index](docs/DOCUMENTATION_INDEX.md).

---

## 2. Core Legal Metrology Lifecycle

```text
Instrument Owner / Business
        ↓
Instrument Registration
        ↓
Verification / Re-verification Application
        ↓
Application Review (LMO / Admin)
        ↓
Scheduling & Verifier Allocation (LMO / GATC)
        ↓
Field / Laboratory Inspection
        ↓
Observation Logging (Checklist Readings)
        ↓
Verification Determination (VERIFIED / REJECTED)
        ↓
Digital Certificate Generation (PDF + SHA-256 Digest)
        ↓
Public QR-based Certificate Verification
        ↓
Statutory Expiry Tracking (valid_until)
        ↓
Periodic Re-verification (New Application)
```

---

## 3. Technology Stack

- **Backend**: Python 3.8+ (FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, PostgreSQL, Pytest)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Redux Toolkit, RTK Query
- **Certificates & QR**: ReportLab PDF Engine, Python `qrcode`, SHA-256 integrity digest
- **Architecture**: Software-Only Modular Monolith (Strictly No Docker, Kubernetes, Kafka, Redis, or AI/ML)

---

## 4. Documentation Layers

METRIX documentation is organized into four distinct layers in `docs/`:
1. **[Current-State Knowledge Base](docs/DOCUMENTATION_INDEX.md)** (`docs/00-...` through `docs/19-...`): The authoritative guide for what METRIX implements.
2. **[Developer & Onboarding Guide](docs/19-developer-guide.md)**: Comprehensive architectural guide and changelog for incoming developers.
3. **[Decisions Log](docs/DOCUMENTATION_DECISIONS.md)**: Architectural and domain decisions log.
4. **[Phase History](docs/phase-history/)**: Historical phase records (Phases 1 through 6).
5. **Academic & Research** (`Documentation/Literature-Design-Mathology/`): College project report, proposal, literature survey, and LaTeX source files.

---

## 5. Getting Started (Local Setup)

### Prerequisites
- Python 3.8+ (Python 3.10+ recommended)
- Node.js 18+ (Node.js 20 LTS recommended) & npm
- PostgreSQL 14+ database service running locally on port 5432

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Ensure your PostgreSQL connection string (`DATABASE_URL`) and `SECRET_KEY` are configured in `.env`.

### 2. Backend Setup, Migrations & Seeding
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Apply migrations
alembic upgrade head

# Seed standard demonstration accounts
python seed.py
```

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- **Web Portal**: `http://localhost:3000`
- **Sign In / Registration**: `http://localhost:3000/login`

### 4. Start Backend Server
```bash
cd backend
source .venv/bin/activate  # On Windows: .\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```
- **API Swagger Documentation**: `http://localhost:8000/docs`
- **System Health Check**: `http://localhost:8000/api/v1/health`

---

## 6. Seeded Demo Accounts

| Role | Email Address | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@metrix.gov.in` | `AdminPass123!` | Officer & GATC provisioning, system audit telemetry, overrides |
| **LMO** | `lmo@metrix.gov.in` | `LmoPass123!` | Application review, field inspection scheduling, test observations, certificate issuance |
| **GATC** | `gatc@testinglab.org` | `GatcPass123!` | Lab calibration testing, observation recording, verification result determination |
| **INSTRUMENT_OWNER** | `owner@example.com` | `OwnerPass123!` | Instrument registration, verification applications, certificate tracking, self-service profile |

---

## 7. Frontend Route Catalog (16 Compiled Routes)

The Next.js 14 frontend implements role-based access control (RBAC), accessible navigation, and a modern metrology light theme:

| Path | Access / Role | Description |
| :--- | :--- | :--- |
| `/` | Public | Landing page with 6-stage lifecycle explainer and direct certificate verification lookup |
| `/login` | Public | Authentication portal with 1-click test credential switching for all 4 roles |
| `/verify/[token]` | Public | Tamper-evident QR code certificate verification with SHA-256 hash checks |
| `/dashboard` | Authenticated | Dynamic dashboard rendering tailored metrics & action cards per role |
| `/instruments` | Authenticated | Instrument inventory with search, category filtering, and registration modal |
| `/instruments/[id]` | Authenticated | Detailed instrument dossier, metrological specs, live update, and deactivation |
| `/applications` | Authenticated | Application workbench with tabbed status filtering (Draft, Under Review, etc.) |
| `/applications/[id]` | Authenticated | End-to-end verification lifecycle state machine actions and draft deletion |
| `/certificates` | Authenticated | Certificate registry with active/expiring/expired filtering |
| `/certificates/[id]` | Authenticated | Certificate details with QR preview, SHA-256 digest, and PDF download |
| `/inspections` | LMO, GATC, Admin | Inspection task queue with assignment filtering and quick observation links |
| `/profile` | Authenticated | User account details with edit profile and password change modals |
| `/admin/users` | Admin | User management table, role filtering, active toggling, and official provisioning |
| `/admin/system` | Admin | Real-time system health, database metrics, and audit/error log stream |
| `/reports` | Authenticated | Regulatory & operational CSV report generator |
| `/search` | Authenticated | Global cross-entity search across instruments, applications, and certificates |
| `/notifications` | Authenticated | In-app notification center with read/unread filtering and mark-as-read actions |

---

## 8. Core REST API Summary (44 Endpoints)

- **System & Auth**: `GET /api/v1/health`, `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `PATCH /api/v1/auth/me`, `PATCH /api/v1/auth/me/password`
- **Admin Management**: `GET /api/v1/admin/users`, `POST /api/v1/admin/users`, `PATCH /api/v1/admin/users/{id}/status`
- **Instruments**: `POST|GET /api/v1/instruments`, `GET|PATCH /api/v1/instruments/{id}`, `PATCH /api/v1/instruments/{id}/deactivate`
- **Applications**: `POST|GET /api/v1/applications`, `GET|DELETE /api/v1/applications/{id}`, `PATCH /api/v1/applications/{id}/status`, `PATCH /api/v1/applications/{id}/schedule`, `PATCH /api/v1/applications/{id}/assignment`
- **Inspections**: `GET /api/v1/inspections`, `GET /api/v1/inspections/{id}`, `POST /api/v1/applications/{id}/inspection`, `POST|GET /api/v1/inspections/{id}/observations`, `PATCH /api/v1/inspections/{id}/result`
- **Certificates**: `POST /api/v1/applications/{id}/certificate`, `GET /api/v1/certificates`, `GET /api/v1/certificates/{id}`, `GET /api/v1/certificates/{id}/download`, `GET /api/v1/public/certificates/verify/{token}`
- **Operations & Reports**: `GET /api/v1/dashboard/summary`, `GET|PATCH /api/v1/notifications/*`, `GET /api/v1/reports/*`, `GET /api/v1/search`

See [docs/12-api-reference.md](docs/12-api-reference.md) for full endpoint specifications.

---

## 9. Running Automated Tests & Quality Checks

```bash
# Backend Automated Pytest Suite (50 tests passing)
cd backend
.\.venv\Scripts\python.exe -m pytest  # Windows
# or: pytest -v                       # Linux/macOS

# Frontend Type Safety & Production Build (16 routes passing)
cd ../frontend
npm run type-check
npm run build
```

---

## 10. Engineering Constraints & Rules

- **Backend Python files**: Maximum **500 lines** per file.
- **Frontend TypeScript/TSX files**: Maximum **300 lines** per file.
- **Documentation files**: Target **≤300 lines** where practical.
- **Strictly Prohibited**: Docker, Kubernetes, Microservices, Kafka, RabbitMQ, Redis, Blockchain, or AI/ML.
- **Developer Guide**: For detailed architectural patterns, see [docs/19-developer-guide.md](docs/19-developer-guide.md).
