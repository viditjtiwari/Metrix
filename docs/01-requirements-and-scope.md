# METRIX — Requirements and System Scope

> **Document Status**: CURRENT STATE (Post-Phase 6 Verified)  
> **Master Index**: See [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).

---

## 1. Functional Scope

METRIX implements the end-to-end statutory verification workflow under the Legal Metrology Act, 2009:

1. **Instrument Cataloging & Registration**:
   - Equipment owners register measuring instruments with serial numbers, make, model, capacity, and physical premises location.
   - Generation of unique, standardized registration numbers (`INST-YYYYMMDD-XXXX`).
2. **Application Lifecycle Management**:
   - Submission of initial verification and periodic re-verification applications.
   - Automatic generation of application numbers (`APP-YYYYMMDD-XXXX`).
   - Immutable audit logging of all state transitions with timestamp and actor attribution.
3. **Application Review & Scheduling**:
   - Legal Metrology Officers (LMO) and Administrators review submitted applications.
   - Scheduling of field or laboratory appointments with date, time, and location notes.
4. **Verifier Allocation**:
   - Single-verifier allocation assigning an inspection to an LMO (field inspection) or an accredited GATC (laboratory testing).
5. **Digital Inspection Checklist & Observation Logging**:
   - Verifier records discrete test parameter readings (e.g., zero-load error, repeatability, sensitivity).
   - Validation against Maximum Permissible Error (MPE) thresholds.
   - Recording of official verification outcome (`VERIFIED` or `REJECTED`).
6. **Tamper-Evident Certification & QR Embedding**:
   - Issuance of official verification certificates for verified instruments.
   - Generation of ReportLab PDF documents with embedded anti-tampering SHA-256 digests and scannable QR tokens.
7. **Public Verification**:
   - Zero-login consumer verification portal accessible via QR scan or direct URL.
   - Real-time validity verification reporting active, expiring, or expired status without disclosing confidential business information.
8. **Statutory Expiry Monitoring & Re-verification**:
   - Expiration detection based on certificate `valid_until` date.
   - Configurable warning window (default 30 days) and automated in-app notifications.
   - Clean re-verification pathways creating a new application record while preserving historical certificates.
9. **Operational Dashboards & Reporting**:
   - Role-specific telemetry dashboards for Owners, Officers, Test Centres, and Administrators.
   - Memory-efficient CSV streaming exports for operational audits.

---

## 2. Non-Functional Expectations

- **Performance**: Sub-100ms API response times for standard transactional endpoints running on standard commodity hardware.
- **Auditability**: Complete non-repudiation; state transitions and verification outcomes are recorded in append-only status histories.
- **Data Integrity**: Relational constraints, foreign keys, and atomic transactions prevent orphaned records or inconsistent states.
- **Security**: Salted `bcrypt` password hashing, stateless JWT authentication, and strict role-based data isolation.
- **Maintainability**: Strict code size constraints (Python ≤ 500 lines, TS/TSX ≤ 300 lines) and a clean modular monolith structure.

---

## 3. Explicit Constraints & Excluded Technologies

To ensure deterministic delivery within a four-week college timeline and eliminate operational fragility during evaluation:
- **No Docker / Kubernetes**: Application runs natively on local Python and Node.js environments.
- **No Microservices**: Deployed as a single unified backend and frontend codebase.
- **No External Message Queues / Celery / Kafka**: Asynchronous workflows are managed via in-service triggers and database tables.
- **No Redis / External Distributed Caching**: PostgreSQL handles caching and persistence directly.
- **No Blockchain**: Auditability is guaranteed through database constraints, immutable histories, and cryptographic digests.
- **No AI / ML Modules**: Verification outcomes are strictly deterministic based on recorded metrological readings and statutory rules.

---

## 4. Reconciling Academic Proposals vs. Implemented Reality

The academic major project proposal (`Documentation/Literature-Design-Mathology/Project_Proposal.tex`) conceptualized several future capabilities that were scoped out for the hackathon baseline:

| Feature Concept in Academic Proposal | Current Implementation Reality | Scope Classification |
| :--- | :--- | :--- |
| **Online Payment Gateway & Challan Upload** | Application created and processed directly without fee gate | Proposal Concept / Planned for Future Scope |
| **SMS / WhatsApp Gateway Alerts** | In-app notification bus writing to PostgreSQL `notifications` table | Proposal Concept / Planned for Future Scope |
| **PKI Digital Signatures (X.509 / DSC)** | Canonical SHA-256 integrity hash embedded in PDF and DB | Proposal Concept / Planned for Future Scope |
| **Dedicated Native Android/iOS App** | Mobile-responsive Next.js web portal with optical camera QR scanning | Proposal Concept / Planned for Future Scope |
| **Legacy State Portal Database Sync** | Self-contained PostgreSQL database with full domain models | Proposal Concept / Planned for Future Scope |

*Note: All original academic LaTeX files and PDFs are preserved intact in `Documentation/Literature-Design-Mathology/` for academic evaluation.*
