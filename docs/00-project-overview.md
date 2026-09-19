# METRIX — Project Overview

> **Document Status**: CURRENT STATE (Post-Phase 6 Verified)  
> **Master Index**: See [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).

---

## 1. Executive Summary

**METRIX** is a web-based Online Verification and Digital Certification System for weighing and measuring instruments, developed for Smart India Hackathon problem statement **SIH26036** under the Department of Consumer Affairs, Government of India.

In accordance with the **Legal Metrology Act, 2009**, all commercial measuring and weighing equipment used in retail, trade, manufacturing, and distribution must undergo statutory initial and periodic verifications to protect consumer rights and guarantee fair trade.

METRIX digitizes this statutory lifecycle into a unified, transparent, and auditable web platform—replacing manual paper ledgers, physical challans, and tamper-vulnerable brass stamping with digital workflows, tamper-evident PDF certificates, and zero-login QR code verification.

---

## 2. Problem Statement & Operational Motivation

### Traditional Deficiencies
1. **Paper-Reliant Ledgers**: Manual verification records are siloed across district offices, leading to missing inspection records and delayed reporting.
2. **Brass Stamp Counterfeiting**: Physical lead seals and punch markings are prone to mechanical tampering and unauthorized recalibration.
3. **Absence of Point-of-Sale Verification**: Consumers and commercial traders have no accessible mechanism to verify whether a scale at a counter is legitimately certified.
4. **Untracked Expiration**: Equipment owners frequently miss mandatory statutory re-verification intervals, operating expired equipment in violation of the law.

### METRIX Solution
METRIX establishes an end-to-end digital lifecycle:
- Centralized instrument registry with unique registration numbers.
- Structured verification and re-verification application workflows.
- Field and laboratory inspection checklists recording load tests against Maximum Permissible Error (MPE) thresholds.
- Cryptographically verifiable PDF certificates embedded with SHA-256 integrity digests and dynamic QR codes.
- Zero-login public verification portal for citizens and enforcement inspectors.
- Proactive validity monitoring with in-app alerts and operational telemetry.

---

## 3. Major System Actors

1. **Instrument Owner / Business**: Commercial enterprises and merchants who register physical instruments, submit verification applications, monitor progress, download issued certificates, and initiate periodic re-verification.
2. **Legal Metrology Officer (LMO)**: Authorized statutory officers who review applications, schedule inspection appointments, conduct field inspections, record observation readings, and issue official digital certificates.
3. **Government Approved Test Centre (GATC)**: Accredited private or semi-government laboratories assigned to conduct specialized laboratory calibration and testing on assigned instruments.
4. **System Administrator (ADMIN)**: District or state administrators managing user accounts, overseeing verifier allocations, monitoring jurisdiction compliance, and generating system audit reports.
5. **Public / Citizen Consumer**: Consumers and commercial buyers who scan instrument QR codes on mobile devices to inspect real-time calibration validity without requiring login credentials.

---

## 4. Technology Stack & Architectural Constraints

### Approved Technologies
- **Backend Framework**: Python 3.8+ (Python 3.10+ recommended), FastAPI, Pydantic v2
- **Persistence & ORM**: PostgreSQL 14+, SQLAlchemy 2.x, Alembic migrations
- **Frontend Architecture**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Redux Toolkit
- **Certificates & QR**: ReportLab (PDF rendering), Python `qrcode`, SHA-256 hashing
- **Security**: Stateless JWT (`HS256`), salted `bcrypt` password hashing

### Explicitly Excluded Technologies (Strictly Honored)
To guarantee delivery within a four-week college timeline and ensure straightforward evaluation, METRIX deliberately excludes:
- Docker, Docker Compose, Kubernetes
- Microservices and distributed architectures
- Message brokers (Kafka, RabbitMQ, Celery)
- Redis and external distributed caches
- Blockchain and distributed ledger frameworks
- Artificial Intelligence / Machine Learning / LLM dependencies

---

## 5. Implementation Status & Roadmap

| Feature Area | Implementation Status | Implementation Notes |
| :--- | :--- | :--- |
| **Authentication & RBAC** | **Implemented** | Centralized JWT auth, bcrypt, 4 distinct roles, profile support |
| **Instrument Registry** | **Implemented** | Unique registration IDs, manufacturer, model, location tracking |
| **Verification Workflow** | **Implemented** | 8-stage state machine (`DRAFT` through `CERTIFICATE_ISSUED`) |
| **Field/Lab Inspections** | **Implemented** | Single-verifier assignment (LMO/GATC), relational observation logging |
| **Digital Certificates** | **Implemented** | ReportLab PDF generator, canonical SHA-256 digest, QR code |
| **Public QR Portal** | **Implemented** | Zero-login `/verify/[token]` route with dynamic expiry checks |
| **Expiry Monitoring** | **Implemented** | Source of truth on `valid_until`, 30-day warning threshold |
| **In-App Notifications** | **Implemented** | 9 lifecycle notification types, read/unread states, deduplication |
| **Reporting & Export** | **Implemented** | Role-scoped CSV streaming reports across 5 domains |
| **Telemetry Dashboards** | **Implemented** | Aggregated operational metrics for Owner, LMO, GATC, Admin |
| *SMS / WhatsApp Gateways* | *Planned / Out of Scope* | Deferred to post-hackathon national gateway integration |
| *Payment Gateway & Challans*| *Planned / Out of Scope* | Fee calculations & challans planned for subsequent release |
| *PKI Digital Signatures* | *Planned / Out of Scope* | SHA-256 digest implemented; asymmetric PKI tokens deferred |
| *Offline Mobile App* | *Planned / Out of Scope* | Mobile-responsive web interface implemented; PWA offline deferred |
