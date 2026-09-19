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
1. **[Current-State Knowledge Base](docs/DOCUMENTATION_INDEX.md)** (`docs/00-...` through `docs/18-...`): The authoritative guide for what METRIX implements post-Phase 6.
2. **[Decisions Log](docs/DOCUMENTATION_DECISIONS.md)**: Architectural and domain decisions log.
3. **[Phase History](docs/phase-history/)**: Historical phase records (Phases 1 through 6).
4. **Academic & Research** (`Documentation/Literature-Design-Mathology/`): College project report, proposal, literature survey, and LaTeX source files.

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
source .venv/bin/activate
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
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
- **API Swagger Documentation**: `http://localhost:8000/docs`
- **System Health Check**: `http://localhost:8000/api/v1/health`

---

## 6. Seeded Demo Accounts

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin@metrix.gov.in` | `AdminPass123!` |
| **LMO** | `lmo@metrix.gov.in` | `LmoPass123!` |
| **GATC** | `gatc@testinglab.org` | `GatcPass123!` |
| **INSTRUMENT_OWNER** | `owner@example.com` | `OwnerPass123!` |

---

## 7. Core REST API Summary

- **Health & Auth**: `GET /api/v1/health`, `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- **Instruments**: `POST|GET /api/v1/instruments`, `GET /api/v1/instruments/{id}`
- **Applications**: `POST|GET /api/v1/applications`, `GET|PATCH /api/v1/applications/{id}/*`
- **Inspections**: `POST /api/v1/applications/{id}/inspection`, `POST|GET /api/v1/inspections/{id}/observations`, `PATCH /api/v1/inspections/{id}/result`
- **Certificates**: `POST /api/v1/applications/{id}/certificate`, `GET /api/v1/certificates/{id}`, `GET /api/v1/certificates/verify/{token}` (Public QR)
- **Operations**: `GET /api/v1/dashboard/summary`, `GET|PATCH /api/v1/notifications/*`, `GET /api/v1/reports/*`

See [docs/12-api-reference.md](docs/12-api-reference.md) for full endpoint specifications.

---

## 8. Running Automated Tests

```bash
# Backend Automated Pytest Suite (45 tests)
cd backend
.venv/bin/pytest -v

# Frontend Type Safety & Build
cd ../frontend
npm run type-check
npm run build
```

---

## 9. Engineering Constraints & Rules

- **Backend Python files**: Maximum **500 lines** per file.
- **Frontend TypeScript/TSX files**: Maximum **300 lines** per file.
- **Documentation files**: Target **≤300 lines** where practical.
- **Strictly Prohibited**: Docker, Kubernetes, Microservices, Kafka, RabbitMQ, Redis, Blockchain, or AI/ML.
