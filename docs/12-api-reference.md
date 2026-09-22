# METRIX — REST API Reference

> **Document Status**: CURRENT STATE (Post-Phase 6 Verified)  
> **Base URL**: `/api/v1`  
> **Master Index**: See [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).

---

## 1. System Health & Authentication

| Method | Endpoint | Auth Required | Permitted Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/health` | No | Any | System health check and database connectivity ping |
| `POST` | `/auth/register` | No | Any | Registers a new user account with stakeholder profile |
| `POST` | `/auth/login` | No | Any | Authenticates credentials and returns JWT bearer token |
| `GET` | `/auth/me` | **Yes** | Any Authenticated | Returns current authenticated user profile and role |
| `PATCH` | `/auth/me` | **Yes** | Any Authenticated | Updates self contact info and organization details |
| `PATCH` | `/auth/me/password` | **Yes** | Any Authenticated | Changes password after verifying current password |

---

## 2. Administrator Stakeholder Management

| Method | Endpoint | Auth Required | Permitted Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/admin/users` | **Yes** | Admin | Lists system users with role/status search & pagination |
| `POST` | `/admin/users` | **Yes** | Admin | Provisions official accounts (`LMO`, `GATC`, `ADMIN`) |
| `PATCH` | `/admin/users/{id}/status` | **Yes** | Admin | Activates or deactivates a user account |

---

## 3. Instrument Management

| Method | Endpoint | Auth Required | Permitted Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/instruments` | **Yes** | Owner, LMO, Admin | Registers a physical measuring instrument |
| `GET` | `/instruments` | **Yes** | Owner, LMO, GATC, Admin | Lists instruments (scoped by user role and ownership) |
| `GET` | `/instruments/{id}` | **Yes** | Owner, LMO, GATC, Admin | Retrieves full details of a specific registered instrument |
| `PATCH` | `/instruments/{id}` | **Yes** | Owner, LMO, Admin | Updates instrument location, capacity, or specifications |
| `PATCH` | `/instruments/{id}/deactivate` | **Yes** | Owner, LMO, Admin | Deactivates instrument from verification eligibility |

---

## 4. Verification Applications

| Method | Endpoint | Auth Required | Permitted Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/applications` | **Yes** | Owner, Admin | Creates a verification application (`DRAFT` status) |
| `GET` | `/applications` | **Yes** | Owner, LMO, GATC, Admin | Lists applications with status and date filtering |
| `GET` | `/applications/{id}` | **Yes** | Owner, LMO, GATC, Admin | Retrieves application record with full audit history |
| `DELETE`| `/applications/{id}` | **Yes** | Owner, Admin | Permanently deletes an un-submitted `DRAFT` application |
| `PATCH` | `/applications/{id}/status` | **Yes** | LMO, Admin, Owner | Transitions application status (`SUBMITTED`, `UNDER_REVIEW`, `REJECTED`) |
| `PATCH` | `/applications/{id}/schedule` | **Yes** | LMO, Admin | Schedules inspection date, time slot, and premises location |
| `PATCH` | `/applications/{id}/assignment` | **Yes** | LMO, Admin | Allocates or reassigns verifier (`assigned_to_id`) |
| `POST` | `/applications/{id}/inspection` | **Yes** | Assigned Verifier, LMO, Admin | Begins inspection (`INSPECTION_IN_PROGRESS`) |
| `GET` | `/applications/{id}/inspection` | **Yes** | Owner, LMO, GATC, Admin | Retrieves inspection record associated with application |
| `POST` | `/applications/{id}/certificate` | **Yes** | LMO, Admin | Issues official digital certificate for `VERIFIED` application |
| `GET` | `/applications/{id}/certificate` | **Yes** | Owner, LMO, GATC, Admin | Retrieves certificate issued for the application |

---

## 5. Inspections & Observations

| Method | Endpoint | Auth Required | Permitted Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/inspections` | **Yes** | LMO, GATC, Admin | Lists inspections (scoped to assigned centre for GATC) |
| `GET` | `/inspections/{id}` | **Yes** | LMO, GATC, Admin | Retrieves specific inspection appointment details |
| `POST` | `/inspections/{id}/observations` | **Yes** | Assigned Verifier, LMO, Admin | Adds parameter test reading to inspection checklist |
| `GET` | `/inspections/{id}/observations` | **Yes** | Owner, LMO, GATC, Admin | Retrieves all recorded parameter readings for inspection |
| `PATCH` | `/inspections/{id}/result` | **Yes** | Assigned Verifier, LMO, Admin | Finalizes result (`VERIFIED` or `REJECTED`) and marks completed |

---

## 6. Digital Certificates & Public Verification

| Method | Endpoint | Auth Required | Permitted Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/certificates` | **Yes** | Owner, LMO, GATC, Admin | Lists and searches certificates with date and status filters |
| `GET` | `/certificates/expiring` | **Yes** | Owner, LMO, Admin | Lists active certificates within the 30-day warning period |
| `GET` | `/certificates/expired` | **Yes** | Owner, LMO, Admin | Lists certificates whose validity has lapsed |
| `GET` | `/certificates/{id}` | **Yes** | Owner, LMO, GATC, Admin | Retrieves full details of a specific certificate |
| `GET` | `/certificates/{id}/download` | **Yes** | Owner, LMO, GATC, Admin | Downloads ReportLab-rendered official PDF certificate |
| `GET` | `/public/certificates/verify/{verification_token}` | **No** | **Public (No Login)** | Zero-login verification via QR code token lookup |

---

## 7. Dashboards, Search, Notifications & Reporting

| Method | Endpoint | Auth Required | Permitted Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/dashboard/summary` | **Yes** | Any Authenticated | Aggregates role-specific operational metrics |
| `GET` | `/search` | **Yes** | Any Authenticated | Multi-domain search across instruments, apps, and certs |
| `GET` | `/notifications` | **Yes** | Any Authenticated | Retrieves paginated notifications for current user |
| `PATCH` | `/notifications/{id}/read` | **Yes** | Any Authenticated | Marks a specific notification as read |
| `PATCH` | `/notifications/read-all` | **Yes** | Any Authenticated | Bulk marks all user notifications as read |
| `POST` | `/notifications/check-expiries` | **Yes** | Admin | Triggers system scan for expiring/expired certificates |
| `GET` | `/reports/applications` | **Yes** | All (Scoped) | Streams CSV export of verification applications |
| `GET` | `/reports/instruments` | **Yes** | Owner, LMO, Admin | Streams CSV export of registered instruments |
| `GET` | `/reports/verifications` | **Yes** | LMO, GATC, Admin | Streams CSV export of inspection observations and outcomes |
| `GET` | `/reports/certificates` | **Yes** | All (Scoped) | Streams CSV export of issued verification certificates |
| `GET` | `/reports/expiries` | **Yes** | Owner, LMO, Admin | Streams CSV export of certificate validity and expiry dates |
