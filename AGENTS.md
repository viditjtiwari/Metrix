# METRIX Developer & AI Agent Guide

## 1. Project Overview

**METRIX** is a web-based Online Verification and Digital Certification System for weighing and measuring instruments, developed for the Smart India Hackathon problem statement **SIH26036** ("Development of an Online Verification System for Weighing and Measuring Instruments").

This is a four-week college-level project. Simplicity, correctness, maintainability, and delivery within the timeline take precedence over technological sophistication.

---

## 2. Core Business Lifecycle

The application orchestrates the legal metrology instrument verification lifecycle:

```text
Instrument Owner / Business
        ↓
Instrument Registration
        ↓
Verification / Re-verification Application
        ↓
Application Review
        ↓
Scheduling / Officer Allocation
        ↓
Inspection / Verification
        ↓
Verification Result
        ↓
Digital Certificate Generation
        ↓
QR-based Certificate Verification
        ↓
Certificate Validity / Expiry Tracking
        ↓
Re-verification
```

### Actors
1. **Instrument Owner / Business**: Registers instruments, submits verification/re-verification requests, views certificates.
2. **Legal Metrology Officer (LMO)**: Reviews applications, performs field/lab inspections, records verification observations.
3. **Government Approved Test Centre (GATC)**: Performs specialized calibrations, instrument testing, and calibration logs.
4. **Administrator**: Manages officers, centres, allocations, system audit logs, and configuration.
5. **Public / Consumer**: Scans QR codes or enters certificate IDs to verify validity and anti-tampering details.

---

## 3. Technology Stack & Constraints

### Approved Technologies
- **Backend**: Python 3, FastAPI, Pydantic, SQLAlchemy 2.x, Alembic, PostgreSQL, Pytest
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Redux Toolkit (RTK Query for server state)
- **Supporting Libraries**: ReportLab (PDF certificates), qrcode (QR code generation), python-jose / passlib (security)

### Explicitly Forbidden Technologies
Do **NOT** introduce any of the following:
- Docker / Docker Compose / Kubernetes
- Microservices
- Message brokers (Kafka, RabbitMQ, Celery with external broker)
- Redis / external caching layers
- Blockchain
- AI / ML / LLM features in the core application
- Unnecessary cloud or distributed infrastructure

---

## 4. Line Limits (Mandatory Constraints)

- **Backend Python files**: Maximum **500 lines** per file.
- **Frontend TypeScript/TSX files**: Maximum **300 lines** per file.
- **Test files**: Maximum **500 lines** per file.
- **Config & documentation files**: Maximum **300 lines** where practical.

If a file approaches the limit, decompose it logically by responsibility. Do not artificially compress code or create meaningless one-line abstractions.

---

## 5. Architectural Principles

### Modular Monolith Architecture
```text
Next.js Frontend
        ↓ (HTTP / REST)
FastAPI Routers (/api/v1)
        ↓
Service Layer (Business Logic & State Machine)
        ↓
Repository Layer (Database Persistence & Queries)
        ↓
SQLAlchemy ORM (2.x)
        ↓
PostgreSQL
```

- **Routers**: HTTP handling, authentication dependency, schema validation, response serialization. Routers must remain thin.
- **Services**: Business rules, state transitions, domain validation, orchestration.
- **Repositories**: Direct database interaction and querying.
- **Models vs Schemas**: SQLAlchemy models map database tables. Pydantic schemas represent API request/response contracts. **Never** expose SQLAlchemy models directly to the API client.

---

## 6. Persistent Rule Files

All agents must adhere to the rules located in `.agents/rules/`:
- `project-rules.md`: Four-week scope, forbidden technologies, quality standards.
- `architecture-rules.md`: Layering, dependency flow, modular monolith boundaries.
- `backend-rules.md`: FastAPI, Pydantic, service/repository patterns, logging.
- `frontend-rules.md`: Next.js, TypeScript, Tailwind CSS, Redux Toolkit guidelines.
- `database-rules.md`: PostgreSQL, SQLAlchemy 2.x, Alembic migrations, transactions.
- `api-rules.md`: REST conventions, `/api/v1` prefix, HTTP codes, error formatting.
- `testing-rules.md`: Pytest, test priorities, regression verification.
- `workflow-rules.md`: Inspect-before-edit, small changes, no requirement invention.

---

## 7. Local Development Commands

The application runs directly on the local machine without Docker:

```bash
# Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm run dev
```
