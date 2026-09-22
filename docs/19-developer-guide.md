# METRIX — Developer Guide & System Changes

> **Document Status**: CURRENT STATE (Production-Ready Architecture)  
> **Target Audience**: Incoming developers, code reviewers, and system integrators  
> **Master Index**: See [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## 1. Executive Summary & Purpose

METRIX is an Online Verification and Digital Certification System for Weighing and Measuring Instruments (Smart India Hackathon **SIH26036**).

This document serves as the primary onboarding and changelog reference explaining:
1. The **Full Frontend Implementation** across all 16 Next.js routes and role-based views.
2. The **Six Backend Gaps** implemented to satisfy SIH statutory requirements.
3. Architecture, design patterns, coding rules, and how to extend the codebase.

---

## 2. Full Frontend Implementation

### A. Layout Architecture & Route Protection
The authenticated frontend lives under `frontend/src/app/(authenticated)/`:
- **`AuthGuard.tsx`**: Client-side session and role guard. Checks token in Redux / local storage and redirects unauthenticated requests to `/login`.
- **`DashboardLayout.tsx`**: Shell containing the responsive `Sidebar.tsx` and `TopBar.tsx`.
- **`Sidebar.tsx` & `roleConfig.ts`**: Navigation entries are filtered dynamically by user role (`INSTRUMENT_OWNER`, `LMO`, `GATC`, `ADMIN`).
- **`TopBar.tsx`**: Displays active route context, global search trigger, real-time unread notification badge, and profile menu.

### B. UI Design System (`src/components/ui/`)
METRIX implements a modern government metrology light theme (`#059669` Emerald, `#0F172A` Slate, `#FFFFFF` / `#F8FAFC` White):
- **`StatusBadge.tsx`**: Semantic color coding for applications, instruments, and certificates.
- **`MetricCard.tsx`**: Telemetry card with value, trend indicators, and icon.
- **`DataTable.tsx`**: Reusable paginated data table with loading skeletons and empty states.
- **`Modal.tsx`**: Accessible dialog overlay (`open: boolean`, title, footer actions).
- **`PageHeader.tsx`**, **`EmptyState.tsx`**, **`LoadingSpinner.tsx`**: Shared page primitives.

### C. Route Catalog (16 Pages)
1. `/` — Public landing page (statutory workflow, live lookup).
2. `/login` — Authentication with 1-click test credential switcher.
3. `/verify/[token]` — Public QR verification with SHA-256 anti-tamper check.
4. `/dashboard` — Role-specific telemetry (Owner, LMO, GATC, Admin).
5. `/instruments` & `/instruments/[id]` — Inventory, specs, update, deactivation.
6. `/applications` & `/applications/[id]` — Verification lifecycle state machine & draft deletion.
7. `/certificates` & `/certificates/[id]` — Certificate registry, QR preview, ReportLab PDF download.
8. `/inspections` — Inspection queue for LMO and GATC verifiers.
9. `/profile` — Self-service profile editing and password change modals.
10. `/admin/users` — Admin user management, role filter, status toggle, provisioning.
11. `/admin/system` — System telemetry, database metrics, audit and error logs.
12. `/reports` — Scoped regulatory and operational CSV exports.
13. `/search` — Global cross-entity search engine.
14. `/notifications` — In-app notification center with read/unread filtering.

---

## 3. Backend Gaps Implemented

To fulfill the SIH problem statement, six essential backend features were built:

### Gap 1: Admin User Management
- **Files**: `schemas/admin.py`, `services/admin_service.py`, `api/v1/admin.py`, `repositories/user_repository.py`.
- **Endpoints**: `GET /api/v1/admin/users`, `POST /api/v1/admin/users`, `PATCH /api/v1/admin/users/{id}/status`.
- **Purpose**: Enables administrators to manage stakeholders, activate/deactivate accounts, and provision official LMO/GATC accounts.

### Gap 2: Instrument Update & Deactivation
- **Files**: `schemas/instrument.py`, `services/instrument_service.py`, `repositories/instrument_repository.py`, `api/v1/instruments.py`.
- **Endpoints**: `PATCH /api/v1/instruments/{id}`, `PATCH /api/v1/instruments/{id}/deactivate`.
- **Purpose**: Allows equipment owners to update instrument location/capacity or deactivate obsolete instruments.

### Gap 3: Draft Application Deletion
- **Files**: `services/application_service.py`, `repositories/application_repository.py`, `api/v1/applications.py`.
- **Endpoint**: `DELETE /api/v1/applications/{id}`.
- **Rule**: Deletion is permitted strictly for applications in `DRAFT` status; submitted applications are preserved for audit integrity.

### Gap 4: Inspections Listing & Observation Refactoring
- **Files**: `schemas/inspection.py`, `services/inspection_service.py`, `services/observation_service.py`, `repositories/inspection_repository.py`, `api/v1/inspections.py`.
- **Endpoint**: `GET /api/v1/inspections`.
- **Architecture Note**: Checklist observation logic was extracted into `observation_service.py` to maintain the mandatory ≤ 500 lines per file limit.

### Gap 5 & 6: Profile Update & Secure Password Change
- **Files**: `schemas/auth.py`, `services/auth_service.py`, `repositories/user_repository.py`, `api/v1/auth.py`.
- **Endpoints**: `PATCH /api/v1/auth/me`, `PATCH /api/v1/auth/me/password`.
- **Purpose**: Provides self-service user contact/business updates and secure password changes verified via bcrypt.

---

## 4. End-to-End Architectural Patterns

### Frontend-to-Backend Call Flow
```text
UI Component (e.g., ApplicationDetailPage)
       ↓ (Dispatches RTK Query Hook)
RTK Query API Client (features/applications/applicationApi.ts)
       ↓ (HTTP / REST with Bearer JWT)
FastAPI Router (app/api/v1/applications.py)
       ↓ (Validates Pydantic Request Schema)
Service Layer (app/services/application_service.py)
       ↓ (Enforces RBAC & Business State Machine)
Repository Layer (app/repositories/application_repository.py)
       ↓ (SQLAlchemy 2.x Session)
PostgreSQL Database
```

### Critical Development Rules
1. **Line Limits**:
   - Frontend TS/TSX: **≤ 300 lines**.
   - Backend Python: **≤ 500 lines**.
   - Tests: **≤ 500 lines**.
2. **Layer Separation**:
   - Routers validate HTTP and serialize responses; they must remain thin.
   - Business rules and state transitions belong exclusively in the Service layer.
   - Repositories encapsulate all database queries.
   - Never expose SQLAlchemy models directly to API clients (always serialize through Pydantic schemas).
3. **Forbidden Technologies**:
   - Strictly NO Docker, Kubernetes, Celery, Kafka, Redis, or external brokers.

---

## 5. Developer Verification & Local Commands

```bash
# 1. Backend Automated Tests (All 50 tests must pass)
cd backend
.\.venv\Scripts\python.exe -m pytest  # Windows
# or: pytest -v                       # Linux/macOS

# 2. Frontend Type Check & Build (All 16 routes must compile)
cd frontend
npm run type-check
npm run build

# 3. Line Limit Audit (PowerShell)
Get-ChildItem -Path frontend/src -Recurse -Include *.ts,*.tsx | ForEach-Object { $l = (Get-Content -LiteralPath $_.FullName | Measure-Object -Line).Lines; if ($l -gt 300) { Write-Output "$($_.FullName): $l" } }
Get-ChildItem -Path backend/app -Recurse -Include *.py | ForEach-Object { $l = (Get-Content -LiteralPath $_.FullName | Measure-Object -Line).Lines; if ($l -gt 500) { Write-Output "$($_.FullName): $l" } }
```
