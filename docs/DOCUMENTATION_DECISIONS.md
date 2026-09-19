# METRIX — Documentation Decisions & Architecture Log

> **Document Purpose**: Authoritative log recording architectural, domain, and documentation discrepancies discovered and resolved during documentation consolidation post-Phase 6.  
> **Master Index**: See [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).

---

## 1. Overview & Decision Framework

During the development and consolidation of METRIX (SIH26036), architectural and domain questions arose across initial proposals, early draft rules, database migrations, and final code. This document records each key decision, the prior or alternative interpretation, the final verified implementation, the underlying rationale, and supporting evidence.

---

## 2. Architectural & Domain Decisions Log

### Decision 1: Application Expiry vs. Certificate Expiry
- **Topic**: Lifecycle placement of the `EXPIRED` state.
- **Earlier / Alternative Interpretation**: Early draft specifications (e.g., initial state machine in `architecture-rules.md` lines 237–245) listed `EXPIRED` and `RE_VERIFICATION_REQUESTED` as transitions on `ApplicationStatus`.
- **Final Implementation**: `EXPIRED` was explicitly removed from `ApplicationStatus` via migration `0002_inspection_workflow`. `ApplicationStatus` ends at `CERTIFICATE_ISSUED` (or `REJECTED`). `EXPIRED` is exclusively an attribute of `CertificateStatus`.
- **Rationale**: An application represents a single verification transaction that completes when a certificate is issued. Expiry is a property of the resulting legal credential over time, not of the historical administrative application.
- **Source / Evidence**: Migration `0002_inspection_workflow.py`, `app.models.enums.ApplicationStatus`, `app.models.enums.CertificateStatus`.

---

### Decision 2: Re-verification Architecture
- **Topic**: Modeling periodic instrument re-verification.
- **Earlier / Alternative Interpretation**: Reopening or recycling an existing `VerificationApplication` record.
- **Final Implementation**: Re-verification is initiated by creating a **new** `VerificationApplication` record with `application_type = "RE_VERIFICATION"` referencing the existing `instrument_id`.
- **Rationale**: Legal metrology audits require an immutable paper trail of every historical inspection, observation, and certificate issued for an instrument. Mutating past records would violate statutory non-repudiation.
- **Source / Evidence**: `app.services.application_service.py`, `backend/tests/test_phase6_hardening.py` (`test_re_verification_lifecycle_preserves_history`).

---

### Decision 3: Anti-Tamper SHA-256 Digest vs. PKI Digital Signature
- **Topic**: Legal and cryptographic classification of certificate verification.
- **Earlier / Alternative Interpretation**: Academic proposals loosely referenced "cryptographically signed digital certificates".
- **Final Implementation**: Certificates embed a deterministic SHA-256 hash computed from a canonically sorted JSON payload of statutory attributes.
- **Rationale**: SHA-256 is an anti-tamper integrity digest that detects post-issuance database or PDF modifications. It is **not** an asymmetric public-key infrastructure (PKI) digital signature (e.g., X.509, DSC token, RSA/ECDSA). METRIX explicitly does not claim PKI digital signature compliance.
- **Source / Evidence**: `app.services.certificate_service.py` (`generate_integrity_hash`), `docs/08-certificate-and-qr.md`.

---

### Decision 4: Single-Verifier Inspection Allocation (Option A)
- **Topic**: Verifier assignment structure on inspections.
- **Earlier / Alternative Interpretation**: Multi-officer inspection teams or committee assignments.
- **Final Implementation**: Each inspection is assigned to exactly one verifier (`assigned_to_id`), whose role must be `LMO` or `GATC`.
- **Rationale**: Adheres to the four-week simplicity constraint while matching standard field procedures where one designated officer or accredited laboratory carries legal accountability for the inspection.
- **Source / Evidence**: `app.models.inspection.Inspection.assigned_to_id`, `app.services.inspection_service.py`.

---

### Decision 5: GATC Assignment-Based Scoping & Isolation
- **Topic**: Data access boundaries for Government Approved Test Centres (GATC).
- **Earlier / Alternative Interpretation**: Allowing GATCs to search all regional instruments and certificates.
- **Final Implementation**: GATCs can access only those applications, inspections, certificates, and reports explicitly assigned to their user ID (`assigned_to_id = current_user.id`).
- **Rationale**: Prevents commercial test centres from viewing competitor records or unauthorized private enterprise equipment fleets.
- **Source / Evidence**: `backend/tests/test_phase6_hardening.py` (`test_gatc_access_scoping_and_isolation`), `app.services.report_service.py`.

---

### Decision 6: Alembic Revision Identifier Renaming
- **Topic**: Naming of the Phase 5/6 migration script.
- **Earlier / Alternative Interpretation**: Revision named `0004_operations_and_notifications.py` (33 characters).
- **Final Implementation**: Renamed to `0004_notifications.py` (20 characters).
- **Rationale**: PostgreSQL's default column size for `alembic_version.version_num` is `VARCHAR(32)`. A 33-character revision string fails when writing to the database. The migration logic itself was unchanged.
- **Source / Evidence**: `backend/alembic/versions/0004_notifications.py`, `backend/alembic/env.py`.

---

### Decision 7: In-App Notifications vs. External Gateways
- **Topic**: Notification transport architecture.
- **Earlier / Alternative Interpretation**: External SMS (e.g. CDAC/Twilio) and Email (SMTP/SendGrid) gateways.
- **Final Implementation**: Lightweight, in-app notification repository writing to the `notifications` PostgreSQL table.
- **Rationale**: Strictly complies with the forbidden technology rules (no external message queues, Celery brokers, or external cloud infrastructure) while providing real-time in-app alerts.
- **Source / Evidence**: `app.models.notification.Notification`, `app.services.notification_service.py`.

---

### Decision 8: Role-Based Ownership vs. "Multi-Tenant" Terminology
- **Topic**: System tenant classification.
- **Earlier / Alternative Interpretation**: Describing METRIX as a "multi-tenant" platform.
- **Final Implementation**: Explicitly classified as **Role-Based Access Control (RBAC) and ownership-based data isolation** within a single relational database.
- **Rationale**: METRIX is not a multi-tenant SaaS application with organization IDs, tenant schemas, or subdomains. Access boundaries are enforced via `owner_id` and `assigned_to_id` filters on the shared relational schema.
- **Source / Evidence**: `app.core.dependencies.py`, `docs/05-authentication-and-rbac.md`, `docs/14-security-and-data-isolation.md`.

---

### Decision 9: Software-Only Modular Monolith
- **Topic**: Infrastructure and deployment topology.
- **Earlier / Alternative Interpretation**: Containerized microservices with Docker Compose and Redis caching.
- **Final Implementation**: Pure software-only modular monolith (FastAPI backend + Next.js frontend + PostgreSQL) running natively on the host machine.
- **Rationale**: Aligned with the four-week college delivery schedule. Eliminates container overhead, network partitioning failures, and deployment complexity during evaluation.
- **Source / Evidence**: `AGENTS.md`, `.agents/rules/project-rules.md`, `docs/02-system-architecture.md`.
