# `.agent/rules/architecture-rules.md`

# METRIX Architecture Rules

## 1. Architecture Goal

METRIX uses a simple modular monolithic architecture.

The application consists of:

```text
Next.js Frontend
        |
        | HTTP / REST API
        v
FastAPI Backend
        |
        v
Service Layer
        |
        v
Repository Layer
        |
        v
SQLAlchemy ORM
        |
        v
PostgreSQL
```

File/document storage is handled separately from relational application data.

---

## 2. No Microservices

METRIX must remain a monolith.

Do not split the application into:

* authentication service
* certificate service
* notification service
* instrument service
* verification service
* separate databases
* separate deployable backend applications

unless explicitly requested.

Logical separation inside the monolith is sufficient.

---

## 3. Backend Layering

The backend follows:

```text
API Router
    ↓
Pydantic Schema
    ↓
Service
    ↓
Repository
    ↓
SQLAlchemy
    ↓
PostgreSQL
```

### Router

Responsible for:

* HTTP endpoint
* authentication dependency
* authorization dependency
* request parsing
* response formatting

Routers should remain thin.

### Service

Responsible for:

* business rules
* workflow transitions
* orchestration
* validation requiring business context

### Repository

Responsible for:

* database queries
* persistence
* retrieval
* database-specific operations

### Model

SQLAlchemy database representation.

### Schema

Pydantic API representation.

Do not use SQLAlchemy models directly as API contracts.

---

## 4. Frontend Architecture

The frontend should follow feature-oriented organization.

Recommended structure:

```text
frontend/
└── src/
    ├── app/
    ├── components/
    │   ├── ui/
    │   ├── forms/
    │   ├── tables/
    │   ├── layout/
    │   └── common/
    ├── features/
    │   ├── auth/
    │   ├── instruments/
    │   ├── applications/
    │   ├── inspections/
    │   ├── certificates/
    │   └── notifications/
    ├── services/
    ├── store/
    ├── hooks/
    ├── types/
    └── utils/
```

Pages should compose components rather than containing all UI and business logic themselves.

---

## 5. Separation of Responsibilities

The following separation must be maintained:

```text
Frontend
    UI + client behavior
        ↓
API
    HTTP contract
        ↓
Backend
    business logic
        ↓
Database
    persistence
```

Do not place backend business rules in frontend components.

Do not make database queries directly from frontend code.

---

## 6. Golden Workflow

The primary system workflow is:

```text
User Registration
       ↓
Instrument Registration
       ↓
Verification Request
       ↓
Review
       ↓
Scheduling / Allocation
       ↓
Field Inspection
       ↓
Observations
       ↓
Verification Result
       ↓
Certificate
       ↓
QR Verification
       ↓
Expiry / Re-verification
```

Agents should protect this workflow from unnecessary complexity.

---

## 7. Domain State Machine

The application should use explicit workflow states.

Initial expected workflow:

```text
DRAFT
  ↓
SUBMITTED
  ↓
UNDER_REVIEW
  ↓
SCHEDULED
  ↓
INSPECTION_IN_PROGRESS
  ↓
INSPECTION_COMPLETED
  ↓
VERIFIED
  ↓
CERTIFICATE_ISSUED
```

Possible rejection path:

```text
UNDER_REVIEW
      ↓
  REJECTED
```

Expiry / re-verification may follow:

```text
CERTIFICATE_ISSUED
      ↓
   EXPIRED
      ↓
RE_VERIFICATION_REQUESTED
```

Agents must not invent additional states without requirement justification.

---

## 8. Dependency Direction

Dependencies should flow toward lower-level concerns.

Preferred:

```text
Router → Service → Repository → Database
```

Avoid:

```text
Repository → Router
Database → Service
Model → API Router
```

Infrastructure code should not depend on UI code.

---

## 9. Shared Code

Before creating a new utility or component, search for an existing implementation.

Prefer:

```text
existing shared utility
```

over:

```text
new duplicate utility
```

Do not create abstractions before there is a demonstrated need.

---

## 10. Development Environment

Local development is intentionally non-containerized.

The expected development model is:

```text
Terminal 1 → PostgreSQL
Terminal 2 → FastAPI
Terminal 3 → Next.js
```

Agents must not introduce Docker-specific configuration.

---

