# METRIX — Phase 1: Foundation & Baseline Setup

> **Document Status**: HISTORICAL REFERENCE  
> **Authoritative Current-State Guide**: See [docs/DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md) and [docs/00-project-overview.md](../00-project-overview.md).

---

## 1. Phase Overview

Phase 1 established the engineering foundation, repository structure, and baseline dependencies for **METRIX**—a web-based Online Verification and Digital Certification System for weighing and measuring instruments developed under Smart India Hackathon problem statement **SIH26036**.

The primary objective was establishing a robust, maintainable **modular monolith** running locally without containerization or distributed middleware, adhering to a strict four-week college delivery schedule.

---

## 2. Key Objectives & Deliverables

1. **Repository Structure & Modular Monolith**:
   - Decomposed into distinct presentation (`frontend/`) and application core (`backend/`) tiers.
   - Enforced dependency direction: Routers → Services → Repositories → ORM → PostgreSQL.
2. **Backend Foundation**:
   - Python 3 with FastAPI framework.
   - Configuration management using `pydantic-settings` reading from `.env`.
   - Central database engine and session factory via SQLAlchemy 2.x.
   - Structured logging setup preventing credential leaks.
   - Alembic migration environment initialized.
3. **Frontend Foundation**:
   - Next.js 14 App Router with strict TypeScript (`tsc`).
   - Styling system configured with Tailwind CSS.
   - State management architecture prepared with Redux Toolkit (`@reduxjs/toolkit`).
4. **Engineering Constraints Established**:
   - Explicit exclusion of Docker, Kubernetes, microservices, Kafka, Redis, and AI/ML.
   - File size limits established: Backend Python files ≤ 500 lines, Frontend TS/TSX files ≤ 300 lines, Tests ≤ 500 lines.
   - Automated test baseline established with Pytest.

---

## 3. Architecture & Scaffolding

```text
Metrix/
├── .agents/rules/              # Architectural & agent engineering rules
├── backend/
│   ├── alembic/                # Migration environment
│   ├── app/
│   │   ├── api/v1/             # HTTP routing
│   │   ├── core/               # Config, logging, security
│   │   ├── db/                 # Database engine & session
│   │   ├── models/             # SQLAlchemy ORM declarations
│   │   ├── repositories/       # Persistence abstractions
│   │   ├── schemas/            # Pydantic contract schemas
│   │   └── services/           # Domain workflows
│   └── tests/                  # Pytest test suite
└── frontend/
    └── src/
        ├── app/                # Next.js App Router
        ├── components/         # Reusable UI primitives
        ├── features/           # Feature slices
        ├── store/              # Redux store
        └── types/              # TypeScript definitions
```

---

## 4. Validation & Outcomes

- **Health Check API**: `GET /api/v1/health` established to verify FastAPI engine status and database ping.
- **Dependency Audit**: Verified zero forbidden dependencies (no message brokers, no external caching layers, no container orchestration).
- **Tooling Verification**: Verified local development workflows using standard commands:
  - Backend: `uvicorn app.main:app --reload`
  - Frontend: `npm run dev`
  - Testing: `pytest`
