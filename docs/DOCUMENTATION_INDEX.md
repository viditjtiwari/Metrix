# METRIX — Documentation Index & Knowledge Base Portal

> **Project**: METRIX — Online Verification and Digital Certification System for Weighing and Measuring Instruments  
> **Problem Statement**: Smart India Hackathon (SIH 2026) — Problem Statement **SIH26036**  
> **Status**: Consolidated Post-Phase 6 Knowledge Base (Production-Ready Baseline)

Welcome to the centralized documentation repository for **METRIX**. This index serves as the master entrypoint, directory roadmap, and topic lookup guide for developers, evaluators, and system administrators.

---

## 1. Documentation Architecture (Four-Layer Model)

The METRIX documentation is structured into four clearly separated operational layers:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. CURRENT-STATE DOCUMENTATION (docs/00-... through docs/18-...)        │
│ The authoritative guide describing what METRIX currently implements.   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. DOCUMENTATION DECISIONS LOG (docs/DOCUMENTATION_DECISIONS.md)       │
│ Authoritative log of discrepancies and architectural decisions.        │
├────────────────────────────────────────────────────────────────────────┤
│ 3. PHASE HISTORY (docs/phase-history/phase-1 through phase-6)          │
│ Chronological records of phase deliverables and validation evidence.   │
├────────────────────────────────────────────────────────────────────────┤
│ 4. ACADEMIC & RESEARCH (Documentation/Literature-Design-Mathology/)    │
│ Academic project report, proposal, literature survey, and LaTeX files. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Current-State Documentation Index

| Doc # | Document Title | Primary Topics Covered |
| :--- | :--- | :--- |
| **00** | [00-project-overview.md](00-project-overview.md) | Executive summary, statutory problem statement, actors, tech stack, roadmap status |
| **01** | [01-requirements-and-scope.md](01-requirements-and-scope.md) | Functional/non-functional scope, forbidden tech, proposal vs. implementation |
| **02** | [02-system-architecture.md](02-system-architecture.md) | Modular monolith architecture, layering (Router/Service/Repo), storage boundaries |
| **03** | [03-domain-model.md](03-domain-model.md) | 9 core entities, relational mapping, enums, application vs. certificate lifecycle |
| **04** | [04-database.md](04-database.md) | PostgreSQL schema, tables, constraints, indexes, Alembic 0001–0004 chain |
| **05** | [05-authentication-and-rbac.md](05-authentication-and-rbac.md) | JWT auth, bcrypt hashing, 4 system roles, permissions matrix, ownership isolation |
| **06** | [06-verification-workflow.md](06-verification-workflow.md) | 8-stage verification lifecycle, transitions, rejection paths, audit histories |
| **07** | [07-inspection-workflow.md](07-inspection-workflow.md) | Scheduling, single-verifier allocation (LMO/GATC), checklist observation logging |
| **08** | [08-certificate-and-qr.md](08-certificate-and-qr.md) | Issuance endpoint, ReportLab PDF, SHA-256 integrity hash, QR token, public portal |
| **09** | [09-expiry-and-reverification.md](09-expiry-and-reverification.md) | `valid_until` truth, 30-day warning, ACTIVE/EXPIRED, non-destructive re-verification |
| **10** | [10-notifications.md](10-notifications.md) | In-app notification model, 9 event triggers, read tracking, alert deduplication |
| **11** | [11-dashboard-search-reporting.md](11-dashboard-search-reporting.md) | Role telemetry dashboards, multi-domain search, 5 CSV streaming exports |
| **12** | [12-api-reference.md](12-api-reference.md) | Comprehensive catalog for all 44 REST endpoints across 10 routers |
| **13** | [13-frontend.md](13-frontend.md) | Next.js 14 App Router, Redux RTK Query, 16 compiled routes, design system, feature dialogs |
| **14** | [14-security-and-data-isolation.md](14-security-and-data-isolation.md) | STRIDE threat model, IDOR defenses, GATC scoping, zero-secrets policy |
| **15** | [15-testing-and-validation.md](15-testing-and-validation.md) | 50 passing backend tests, frontend type/build checks, fresh migration audit |
| **16** | [16-development-and-local-setup.md](16-development-and-local-setup.md) | Local prerequisites, venv, migrations, demo account seed script, test commands |
| **17** | [17-deployment-and-environment.md](17-deployment-and-environment.md) | Bare-metal deployment, `.env` reference, process management, production checklist |
| **18** | [18-project-rules.md](18-project-rules.md) | Engineering rules summary, line limits (500/300), rule protection policy |
| **19** | [19-developer-guide.md](19-developer-guide.md) | Onboarding guide, changelog, frontend architecture, and backend gaps reference |
| **Diag** | [SYSTEM_DIAGRAMS.md](SYSTEM_DIAGRAMS.md) | Master diagrams: Use Case, ER Diagram, Flowcharts, and UML Class/Sequence/State/Component diagrams |

---

## 3. Decisions & Discrepancy Log

- **[DOCUMENTATION_DECISIONS.md](DOCUMENTATION_DECISIONS.md)**: Records 9 key architectural decisions and discrepancy resolutions (e.g., Application vs. Certificate expiry, re-verification architecture, SHA-256 digest vs. PKI signature, Alembic revision identifier naming, and GATC isolation).

---

## 4. Phase History Archive

These documents preserve the chronological implementation and milestone validation evidence:
- **[Phase 1 — Foundation](phase-history/phase-1-foundation.md)**: Project initialization, modular monolith structure, baseline health checks.
- **[Phase 2 — Domain & Auth](phase-history/phase-2-domain-auth.md)**: Relational domain models, JWT authentication, RBAC, early status audit.
- **[Phase 3 — Verification Workflow](phase-history/phase-3-verification-workflow.md)**: Operational inspections, observations, MPE results, verifier allocation.
- **[Phase 4 — Certificates & QR](phase-history/phase-4-certificates.md)**: Digital certificates, ReportLab PDF generator, QR verification token, dynamic validity.
- **[Phase 5 — Operations & Reporting](phase-history/phase-5-operations.md)**: Telemetry dashboards, in-app notifications, multi-domain search, CSV streaming reports.
- **[Phase 6 — Final Validation](phase-history/phase-6-final-validation.md)**: Hardening fixes, Alembic revision fix, GATC scoping, 45-test suite validation.

---

## 5. Academic & Research Layer

Located in `Documentation/Literature-Design-Mathology/`:
- **LaTeX Chapters**: `Chapter-1.tex` (Intro), `Chapter-2.tex` (Literature Survey), `Chapter-3.tex` (Methodology), `Chapter-5.tex` (Design).
- **Major Project Proposal**: `Project_Proposal.tex` (Full academic proposal submitted to JIET / BTU).
- **Bibliography & Diagrams**: `references.bib`, `process_flowchart.png`, `use_case_diagram.png`.
- **Pre-Compiled PDFs**: `METRIX_SIH26036_Project_Proposal.pdf`, `METRIX_Project_Report_Ch2_Ch3 (1).pdf`.

---

## 6. Quick Topic Lookup Guide

| If you are looking for... | Consult this Document |
| :--- | :--- |
| How to run METRIX locally from scratch | [16-development-and-local-setup.md](16-development-and-local-setup.md) |
| Complete REST API endpoint documentation | [12-api-reference.md](12-api-reference.md) |
| Database schema, tables, and Alembic migrations | [04-database.md](04-database.md) |
| How role-based access control (RBAC) works | [05-authentication-and-rbac.md](05-authentication-and-rbac.md) |
| The verification state machine & transition rules | [06-verification-workflow.md](06-verification-workflow.md) |
| How digital certificates and QR codes are generated | [08-certificate-and-qr.md](08-certificate-and-qr.md) |
| Certificate expiry logic and periodic re-verification | [09-expiry-and-reverification.md](09-expiry-and-reverification.md) |
| Automated test results and quality assurance metrics | [15-testing-and-validation.md](15-testing-and-validation.md) |
| Why certain architectural or domain decisions were made | [DOCUMENTATION_DECISIONS.md](DOCUMENTATION_DECISIONS.md) |
| Engineering constraints and file line limits | [18-project-rules.md](18-project-rules.md) |
