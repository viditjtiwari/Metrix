# METRIX — Phase 4: Digital Certificates, QR Verification & Validity

> **Document Status**: HISTORICAL REFERENCE  
> **Authoritative Current-State Guide**: See [docs/08-certificate-and-qr.md](../08-certificate-and-qr.md) and [docs/09-expiry-and-reverification.md](../09-expiry-and-reverification.md).

---

## 1. Phase Overview

Phase 4 introduced digital certification under migration `0003_certificate_management`, adding cryptographic QR code verification, ReportLab PDF rendering, anti-tampering SHA-256 integrity digests, and dynamic validity tracking.

---

## 2. Key Deliverables & Database Schema

1. **`certificates` Entity**:
   - `certificate_number`: Format `METRIX-CERT-{YEAR}-{SEQ:06d}`.
   - `application_id`: 1-to-1 link referencing `verification_applications.id`.
   - `instrument_id`: References `instruments.id`.
   - `issued_by_id`: References issuing `users.id` (LMO or ADMIN).
   - `valid_from` & `valid_until`: Statutory validity period (default 365 days).
   - `status`: Enum `CertificateStatus` (`ACTIVE`, `EXPIRED`).
   - `integrity_hash`: Deterministic SHA-256 hex digest of canonical certificate attributes.
   - `verification_token`: Cryptographic 256-bit URL-safe lookup token (`secrets.token_urlsafe(32)`).
   - `pdf_path`: Filesystem storage path in `backend/storage/certificates/`.

2. **Issuance Endpoint**:
   - `POST /api/v1/applications/{id}/certificate`: Enforces that application is in `VERIFIED` status and transitions it to `CERTIFICATE_ISSUED`.

3. **PDF Generation & QR Code**:
   - ReportLab PDF generator renders official seal, instrument specifications, statutory dates, and scannable QR code.
   - QR code embeds direct URL to public verification portal: `http://<domain>/verify/<verification_token>`.

4. **Public Verification Portal**:
   - `GET /api/v1/public/certificates/verify/{verification_token}`: Zero-login public endpoint.
   - Dynamically evaluates validity: if `current_date > valid_until`, returns `EXPIRED`.
   - Enforces data privacy: returns technical verification parameters while concealing owner private contact information.

---

## 3. Key Architectural Decisions in Phase 4

1. **Anti-Tamper Digest vs. PKI Digital Signature**:
   - SHA-256 hash is a tamper-evident digest calculated from canonical JSON representation.
   - It is explicitly **not** an asymmetric PKI public-key digital signature (X.509/DSC), which remains out of scope for the hackathon baseline.
2. **Local Filesystem PDF Storage**:
   - Certificates are written to local disk (`storage/certificates/`) rather than external cloud object stores, honoring the software-only constraint.
3. **Decoupled Re-Verification**:
   - Periodic re-verification creates a **new** application record referencing the existing instrument.
   - Historical certificates remain immutably archived.
