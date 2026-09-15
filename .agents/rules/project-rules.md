# METRIX Project Rules

## 1. Purpose

METRIX is a small college-level web application for the online verification and certification of weighing and measuring instruments.

The application should support the core workflow:

User
→ Register Instrument
→ Submit Verification Request
→ Review
→ Schedule / Allocate
→ Field Inspection
→ Record Observations
→ Verification Result
→ Certificate
→ QR Verification
→ Expiry / Re-verification

The primary objective is to build a functional, understandable, maintainable project that can be completed within the college project timeline.

Agents must optimize for correctness, simplicity, maintainability, and completion.

---

## 2. Project Scope

METRIX is a college-level project.

The implementation must remain appropriately scoped.

The project is NOT intended to demonstrate every possible enterprise technology.

Agents must not introduce complexity merely because a technology is considered "industry standard", "scalable", or "production grade".

Prefer the simplest solution that correctly satisfies the documented requirement.

---

## 3. Hard Technology Constraints

### Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy 2.x
* Alembic
* PostgreSQL

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Redux Toolkit

### Other

* JWT-based authentication
* Role-based access control
* Pytest for backend testing
* ReportLab for PDF certificate generation
* Python QR-code library for QR generation

---

## 4. Explicitly Forbidden Technologies

The following must NOT be introduced unless explicitly approved by a human developer:

* Docker
* Docker Compose
* Kubernetes
* Microservices
* Kafka
* RabbitMQ
* Redis
* Blockchain
* AI/ML systems
* LLM-based application features
* unnecessary cloud infrastructure
* unnecessary message queues
* unnecessary distributed systems
* unnecessary background-processing infrastructure

The absence of Docker is intentional.

Local development should use normal commands for each application component.

Example:

```bash
# Backend
cd backend
uvicorn app.main:app --reload
```

```bash
# Frontend
cd frontend
npm run dev
```

PostgreSQL may run as a normal local database service.

Agents must not add Docker simply because it may be useful for deployment.

---

## 5. No AI Requirement

METRIX itself is not an AI-driven application.

Agents must not add:

* AI assistants
* recommendation engines
* machine learning
* predictive analytics
* LLM features
* AI-generated verification decisions

Verification decisions must be based on explicit business rules and recorded inspection data.

---

## 6. No Hardware Requirement

METRIX is a software-only project.

Do not introduce:

* IoT devices
* sensors
* weighing hardware
* cameras as mandatory hardware
* biometric devices
* dedicated scanning hardware
* embedded systems

QR codes are software-generated identifiers and do not constitute a hardware requirement.

---

## 7. No Blockchain

Blockchain must not be used.

Certificate integrity, auditability, and verification must be handled using conventional database and application mechanisms.

---

## 8. Simplicity Rule

When multiple technically valid approaches exist:

1. Prefer the simpler approach.
2. Prefer fewer dependencies.
3. Prefer fewer moving parts.
4. Prefer existing project utilities.
5. Prefer understandable code.
6. Prefer solutions the team can explain during a college evaluation.

Do not choose an architecture because it sounds more advanced.

---

## 9. Four-Week Delivery Constraint

The project is intentionally planned around a four-week college deadline.

Agents must prioritize the working MVP over optional sophistication.

### MVP must include

* Authentication
* Role-based access
* Instrument registration
* Verification application
* Application status
* Review
* Scheduling / allocation
* Inspection recording
* Verification result
* Certificate generation
* QR verification
* Expiry tracking
* Search
* Document upload
* Basic dashboards

### Optional features

These should only be implemented after the MVP is stable:

* Email notifications
* SMS notifications
* Advanced analytics
* Advanced reports
* Dedicated mobile application
* External government API integrations
* Complex audit systems
* Advanced notification infrastructure

---

## 10. Code Quality

Code must be:

* readable
* modular
* typed where appropriate
* testable
* understandable
* reasonably reusable

Avoid:

* dead code
* commented-out old implementations
* unnecessary abstractions
* duplicate utilities
* giant functions
* giant components
* unexplained magic values
* hard-coded credentials
* silent error handling

---

## 11. File Size Limits

### Backend

Maximum:

**500 lines per source file**

### Frontend

Maximum:

**300 lines per source file**

### Tests

Maximum:

**500 lines per test file**

### Configuration / documentation files

Maximum:

**300 lines where practical**

These limits exist to encourage modularity.

Do not remove functionality simply to satisfy a line limit.

If a file becomes too large, split it by logical responsibility.

Do not split a file into meaningless fragments solely to reduce its line count.

---

## 12. Dependency Rule

Do not introduce a new dependency unless:

1. It solves a real requirement.
2. Existing project dependencies cannot reasonably solve it.
3. The dependency is maintained and appropriate.
4. The dependency does not unnecessarily increase project complexity.

Agents must explain new dependencies in their implementation summary.

---

## 13. Security Basics

The application must:

* never commit secrets
* never hard-code passwords
* never hard-code JWT secrets
* validate user input
* enforce authorization on protected operations
* hash passwords securely
* avoid exposing sensitive database information
* validate uploaded files
* restrict access to protected resources

Security must not be bypassed for convenience.

---

## 14. Domain Integrity

Agents must not invent domain behavior.

Statuses, roles, workflows, fields, validation rules, and business decisions must come from:

1. documented METRIX requirements
2. existing implementation
3. explicit human instruction

If a requirement is ambiguous, do not silently invent a complex behavior.

Choose the simplest reasonable behavior or flag the ambiguity.

---

## 15. Change Discipline

Agents must:

* modify only necessary files
* reuse existing functionality
* avoid unrelated refactoring
* avoid silently changing existing API contracts
* avoid silently changing database fields
* avoid breaking existing workflows
* preserve working functionality

A feature request is not permission to rewrite the application.

---

## 16. Rule Priority

When rules conflict, use this priority order:

1. Human instructions in the current task
2. `project-rules.md`
3. `architecture-rules.md`
4. Domain and workflow requirements
5. Technology-specific rules
6. Testing rules
7. Existing implementation conventions

A lower-priority rule must not override a higher-priority rule.

If a human explicitly requests something that conflicts with a project rule, follow the human instruction and report the conflict.

---

## 17. Agent Decision Principle

The correct question is not:

> "What is the most advanced solution?"

The correct question is:

> "What is the simplest correct solution that satisfies the METRIX requirement and can be completed and explained within the project timeline?"

This principle applies throughout the project.
