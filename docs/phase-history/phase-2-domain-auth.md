# METRIX — Phase 2: Domain Modeling, Authentication & RBAC

> **Document Status**: HISTORICAL REFERENCE  
> **Authoritative Current-State Guide**: See [docs/03-domain-model.md](../03-domain-model.md) and [docs/05-authentication-and-rbac.md](../05-authentication-and-rbac.md).

---

## 1. Phase Overview

Phase 2 established the core relational domain model, statutory entity relationships, cryptographic authentication, and Role-Based Access Control (RBAC) under migration revision `0001_initial_domain_and_auth`.

---

## 2. Implemented Entities & Schema Design

1. **`users`**:
   - Primary actor identity table (`id`, `email`, `hashed_password`, `full_name`, `role`, `is_active`, timestamps).
   - Role enumeration: `ADMIN`, `LMO`, `GATC`, `INSTRUMENT_OWNER`.
   - Passwords secured with salted `bcrypt`.
2. **`stakeholder_profiles`**:
   - 1-to-1 relational profile for business premises or testing laboratories (`business_name`, `trade_license_number`, `contact_phone`, address, city, state, pincode).
3. **`instruments`**:
   - Physical equipment registry (`registration_number`, `owner_id`, `instrument_type`, `manufacturer`, `model_name`, `serial_number`, `capacity`, `location`, `is_active`).
   - Types: `WEIGHING_SCALE`, `ELECTRONIC_BALANCE`, `PETROL_DISPENSER`, `FLOW_METER`, `LENGTH_MEASURE`, `OTHER`.
4. **`verification_applications`**:
   - Legal verification request (`application_number`, `instrument_id`, `applicant_id`, `application_type`, `status`, `submitted_at`, `remarks`).
   - `application_type`: `INITIAL` or `RE_VERIFICATION`.
5. **`application_status_histories`**:
   - Immutable state transition audit log (`application_id`, `from_status`, `to_status`, `changed_by_id`, `remarks`, `created_at`).

---

## 3. Authentication & RBAC Architecture

- **Token Strategy**: Stateless JWT access tokens signed with HMAC-SHA256 (`HS256`) and a 24-hour expiration window.
- **Endpoints**:
  - `POST /api/v1/auth/register`: Dual creation of `User` and `StakeholderProfile` in a single transaction.
  - `POST /api/v1/auth/login`: Credential validation returning `access_token` and `token_type: "bearer"`.
  - `GET /api/v1/auth/me`: Current session user profile retrieval.
- **Access Control Matrix**:
  - `INSTRUMENT_OWNER`: Registers physical instruments, submits initial applications, tracks status.
  - `LMO`: Reviews district applications, conducts inspections, issues certificates.
  - `GATC`: Receives specialized lab calibration tasks.
  - `ADMIN`: System-wide administration, user management, and queue allocations.

---

## 4. Key Architectural Decisions in Phase 2

1. **Instrument Catalog as Enumeration**: Modeled via `InstrumentType` enum rather than a separate table for timeline simplicity.
2. **Normalized Profiles**: Profile attributes separated from authentication credentials into `stakeholder_profiles`.
3. **Audit Immutability**: `ApplicationStatusHistory` configured without update or delete endpoints to ensure legal accountability.
