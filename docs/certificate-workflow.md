# METRIX Digital Certificate, QR Verification & Validity Workflow (Phase 4)

## 1. Executive Summary
This document specifies the architecture, data model, security guarantees, and operational procedures for legal metrology digital verification certificates under Smart India Hackathon problem statement **SIH26036**. It covers certificate generation, SHA-256 integrity verification, unguessable QR token verification, statutory validity management, and re-verification pathways.

---

## 2. Separate Lifecycles: Application vs. Certificate

A fundamental domain principle of METRIX is the strict decoupling of the verification transaction from the resulting legal credential:

### 2.1 Application Lifecycle
An application (`VerificationApplication`) models a single verification transaction:
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
VERIFIED ──> CERTIFICATE_ISSUED
  OR
REJECTED (terminal)
```

### 2.2 Certificate Lifecycle
A certificate (`Certificate`) models the legally binding proof of accuracy:
```text
ACTIVE ──(when current_date > valid_until)──> EXPIRED
```

- **Invariant**: `EXPIRED` is never an application status. An application that resulted in a certificate remains permanently `CERTIFICATE_ISSUED` in the audit history.
- **Expiry Behavior**: When a certificate reaches its `valid_until` date, the certificate evaluates to `EXPIRED`.
- **Re-verification Entry Point**: When an instrument certificate expires, the instrument owner submits a **new** application with `application_type = "RE_VERIFICATION"`. The previous certificate is preserved as an immutable historical record.

---

## 3. Certificate Data Model & Relational Schema

```text
instruments (1) ────< certificates (N)
                             │
                             │ (1-to-1)
                             v
                  verification_applications (1)
```

### 3.1 Entity Attributes (`certificates`)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Autoincrement | Internal primary key |
| `certificate_number` | String(64) | UNIQUE, Index | Format: `METRIX-CERT-{YEAR}-{SEQ:06d}` |
| `application_id` | Integer | UNIQUE, FK | References `verification_applications.id` |
| `instrument_id` | Integer | FK, Index | References `instruments.id` |
| `issued_by_id` | Integer | FK, Index | References `users.id` (LMO / ADMIN) |
| `issued_at` | DateTime(UTC) | Not Null | Timestamp of issuance |
| `valid_from` | Date | Not Null | Starting date of statutory validity |
| `valid_until` | Date | Not Null | Expiration date of statutory validity |
| `status` | Enum | `ACTIVE`, `EXPIRED` | Persisted baseline lifecycle state |
| `integrity_hash` | String(64) | Index | Deterministic SHA-256 hex digest |
| `verification_token` | String(64) | UNIQUE, Index | Cryptographic URL-safe public lookup token |
| `pdf_path` | String(255) | Nullable | Local filesystem storage path |

---

## 4. Anti-Tamper SHA-256 Integrity Model

### 4.1 Canonical Serialization
To guarantee deterministic hashing across diverse environments, platforms, and database drivers, the payload is constructed from stable properties formatted as sorted, separator-normalized JSON:

```json
{
  "application_number": "APP-20260919-ABCD",
  "certificate_number": "METRIX-CERT-2026-000001",
  "inspection_result": "VERIFIED",
  "instrument_registration_number": "IND-MH-2026-0042",
  "instrument_serial_number": "SN-882194",
  "instrument_type": "WEIGHING_SCALE",
  "issued_at": "2026-09-19T10:00:00Z",
  "owner_identifier": "Apex Logistics Private Limited",
  "valid_from": "2026-09-19",
  "valid_until": "2027-09-19",
  "verification_token": "u_kX93rLp..."
}
```

$$\text{integrity\_hash} = \text{SHA-256}(\text{canonical\_payload\_utf8})$$

### 4.2 Critical Legal Metrology Notice: Digest $\neq$ Digital Signature
> [!IMPORTANT]
> The SHA-256 hash is a **tamper-evident integrity digest** that enables detection of unauthorized record alterations by matching recalculated digests against backend records. It is **NOT** an asymmetric public-key (PKI) digital signature (e.g. X.509 / DSC / RSA). The system does not claim PKI digital signature capabilities in Phase 4.

---

## 5. QR Code & Public Verification Architecture

### 5.1 QR Code Content
The QR code rendered on the official certificate PDF does **not** embed sensitive certificate JSON, applicant passwords, or private internal database IDs. Instead, it contains an HTTPS link resolving to the public portal:
```text
https://<domain>/verify/<verification_token>
```
The token is generated via Python `secrets.token_urlsafe(32)`, providing $256$ bits of entropy, rendering brute-force enumeration infeasible.

### 5.2 Public Verification API
`GET /api/v1/public/certificates/verify/{verification_token}`
- **Authentication**: None required. Open to consumers, merchants, and enforcement inspectors.
- **Dynamic Validity**: The endpoint inspects `valid_until`. If $\text{current\_date} > \text{valid\_until}$, the returned status dynamically reports `EXPIRED` regardless of database caching.
- **Privacy Enforcement**: Returns strictly metrological parameters (instrument type, serial, manufacturer, model, issue date, validity window, result, integrity hash). Owner contact details, internal credentials, and inspection remarks are excluded.

---

## 6. Role-Based Access Control (RBAC)

| Action | Instrument Owner | LMO | GATC | Admin | Public |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Issue Certificate | Denied | **Allowed** | Denied | **Allowed** | Denied |
| View Certificate Details | Own Only | Allowed | Denied | Allowed | Public View |
| Download PDF Certificate | Own Only | Allowed | Denied | Allowed | Denied |
| Public QR Verification | Allowed | Allowed | Allowed | Allowed | **Allowed** |
| Request Re-verification | **Allowed** | Denied | Denied | Allowed | Denied |

*Note: GATC test centres perform inspections and record technical observations, but final certificate issuance is reserved for statutory authorities (LMO, Admin).*

---

## 7. Re-Verification Lifecycle Flow

```text
Expired Instrument Certificate
             ↓
Instrument Owner logs in
             ↓
Submits NEW Verification Application:
  - instrument_id: <existing_id>
  - application_type: "RE_VERIFICATION"
             ↓
Normal Operational Verification Workflow:
  SUBMITTED → UNDER_REVIEW → SCHEDULED → INSPECTION → VERIFIED
             ↓
New Certificate Issued:
  - New certificate number
  - New verification token
  - New validity window (e.g. +365 days)
  - Previous certificate remains EXPIRED historical record
```
