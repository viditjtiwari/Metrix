# METRIX Phase 5 — Operations, Expiry Tracking, Notifications & Reporting

## 1. Overview
Phase 5 completes the operational capabilities of METRIX (SIH26036), providing role-aware telemetry dashboards, certificate expiry forecasting, an in-app notification notification bus, multi-domain search & filtering, and audit-ready CSV exports.

---

## 2. Dashboard Statistics & Role Metrics
The dashboard summary API (`GET /api/v1/dashboard/summary`) uses targeted SQL aggregations (`func.count`, `func.sum`, `group_by`) executed directly in `DashboardRepository`:

- **INSTRUMENT_OWNER**:
  - `total_instruments`: Count of instruments registered by owner.
  - `total_applications`: Count of verification applications submitted.
  - `active_certificates`: Certificates valid and status is `ACTIVE`.
  - `expiring_certificates`: Active certificates expiring within `CERTIFICATE_EXPIRY_WARNING_DAYS` (default 30 days).
  - `expired_certificates`: Certificates past `valid_until` or marked `EXPIRED`.
  - `applications_by_status`: Count map across all application states.
- **LEGAL METROLOGY OFFICER (LMO)**:
  - `pending_review`: Applications in `SUBMITTED` or `UNDER_REVIEW`.
  - `scheduled_inspections`: Applications with status `SCHEDULED`.
  - `inspections_in_progress`: Applications in `INSPECTION_IN_PROGRESS`.
  - `inspections_completed`: Inspections finished pending officer determination.
  - `certificates_issued`: Total digital certificates issued across the jurisdiction.
- **GOVERNMENT APPROVED TEST CENTRE (GATC)**:
  - `total_assigned`: Verifications assigned to the GATC user/centre.
  - `pending_inspections`: Assigned verifications not yet started.
  - `in_progress_inspections`: Currently undergoing calibration/testing.
  - `completed_inspections`: Assigned verifications finished.
- **ADMINISTRATOR**:
  - Full system metrics: `total_users`, `total_instruments`, `total_applications`, `total_certificates`, `active_certificates`, `expired_certificates`, and breakdown of applications by status.

---

## 3. Expiry Tracking Logic
- **Source of Truth**: The `valid_until` date column on the `certificates` table serves as the single source of truth.
- **Dynamic & Persisted Status**:
  - A certificate is dynamically considered expired if `valid_until < current_utc_date` even if not yet transitioned.
  - The scanning service marks `status = CertificateStatus.EXPIRED` upon evaluation.
- **Warning Threshold**:
  - Configurable via `CERTIFICATE_EXPIRY_WARNING_DAYS` (default: 30 days) in `app.core.config.Settings`.
  - Expiring window: `current_date <= valid_until <= current_date + warning_days`.
- **Endpoints**:
  - `GET /api/v1/certificates/expiring`: Paginated certificates within the warning window.
  - `GET /api/v1/certificates/expired`: Paginated certificates that have passed validity.

---

## 4. In-App Notification Architecture
### Schema & Persistence
- Table: `notifications`
  - `id`: BigInteger PK
  - `user_id`: ForeignKey to `users.id` (Indexed)
  - `type`: Enum `NotificationType`
  - `title`: String(128)
  - `message`: Text
  - `is_read`: Boolean (Indexed, default `False`)
  - `created_at`: DateTime (Indexed)
  - `read_at`: DateTime (Nullable)
  - `entity_type`: String(64) (Nullable, indexed for deduplication)
  - `entity_id`: Integer (Nullable, indexed for deduplication)

### Lifecycle Triggers
Notifications are dispatched asynchronously or in-service during domain state transitions:
1. `APPLICATION_SUBMITTED`: Dispatched to applicant when application is lodged.
2. `APPLICATION_SCHEDULED`: Dispatched to applicant when inspection date is set.
3. `INSPECTION_ASSIGNED`: Dispatched to assigned LMO / GATC officer.
4. `INSPECTION_COMPLETED`: Dispatched to applicant and assigned inspector.
5. `APPLICATION_VERIFIED`: Dispatched to applicant upon verification pass.
6. `APPLICATION_REJECTED`: Dispatched to applicant upon rejection.
7. `CERTIFICATE_ISSUED`: Dispatched to instrument owner with certificate number.
8. `CERTIFICATE_EXPIRING`: Dispatched to owner when certificate enters warning window.
9. `CERTIFICATE_EXPIRED`: Dispatched to owner when certificate lapses.

### Expiry Alert Deduplication
To prevent flooding owners with repeated alerts:
- The notification repository checks:
  `exists(user_id, entity_type="certificate", entity_id=cert.id, type=NotificationType.CERTIFICATE_EXPIRING)`
- If an alert of that type already exists for that certificate, generation is skipped.
- Similarly, `CERTIFICATE_EXPIRED` is generated at most once per certificate.

---

## 5. Search Capabilities & Advanced Filtering
All list endpoints support multi-field querying with pagination (`page`, `page_size`):
- **Instruments** (`GET /api/v1/instruments`):
  - Filters: `registration_number`, `serial_number`, `instrument_type`, `manufacturer`, `location`, `owner_id`.
  - Database index: `ix_instruments_reg_no`, `ix_instruments_serial_no`.
- **Applications** (`GET /api/v1/applications`):
  - Filters: `application_number`, `instrument_id`, `status`, `applicant_id`, `from_date`, `to_date`.
  - Database index: `ix_applications_app_no`, `ix_applications_status`.
- **Certificates** (`GET /api/v1/certificates`):
  - Filters: `certificate_number`, `status`, `from_date`, `to_date`, `owner_id`.
  - Database index: `ix_certificates_cert_no`, `ix_certificates_status`, `ix_certificates_valid_until`.

---

## 6. Operational Reporting & CSV Exports
Reports are streamed as `text/csv` with `Content-Disposition: attachment; filename="<name>.csv"`.
Data streaming utilizes Python's built-in `csv` module and `io.StringIO`:

| Endpoint | Permitted Roles | Content |
|---|---|---|
| `GET /api/v1/reports/applications` | All (Tenant-scoped) | Application ID, Number, Instrument ID, Applicant, Type, Status, Submitted At |
| `GET /api/v1/reports/instruments` | Owner, LMO, Admin | Instrument ID, Reg Number, Type, Manufacturer, Model, Serial, Location, Status |
| `GET /api/v1/reports/verifications` | LMO, GATC, Admin | Inspection ID, App Number, Assigned Inspector, Scheduled Date, Result, Completed At |
| `GET /api/v1/reports/certificates` | All (Tenant-scoped) | Certificate ID, Cert Number, Instrument Reg, Valid From, Valid Until, Status, Hash |
| `GET /api/v1/reports/expiries` | Owner, LMO, Admin | Expiry Report: Cert Number, Instrument Reg, Valid Until, Days Remaining, Status |

---

## 7. RBAC & Data Isolation Rules
1. **Instrument Owners**:
   - Access strictly restricted to own instruments, applications, certificates, and alerts (`owner_id = current_user.id`).
2. **Legal Metrology Officers (LMO)**:
   - Access all applications, verifications, and certificates within operational purview.
3. **Government Approved Test Centres (GATC)**:
   - Access only inspections and applications assigned to them (`assigned_to_id = current_user.id`).
4. **Administrators**:
   - Unrestricted system-wide visibility across all stakeholders and records.

---

## 8. Verification & Testing Results
- **Pytest Suite**: 41 passed (28 legacy + 13 Phase 5 operational tests).
  - `test_dashboard_and_reports.py`: 8 tests covering role-based metrics and CSV generation.
  - `test_notifications_and_search.py`: 5 tests covering lifecycle triggers, deduplication, user isolation, and search filters.
- **Frontend Verification**:
  - `npm run build`: Production compilation succeeds with zero TypeScript or ESLint errors.
  - Minimal pages implemented: `/dashboard`, `/notifications`, `/search`, `/reports`.

---

## 9. Key Technical Decisions
1. **No External Scheduler / Message Broker**: Adheres to strict hackathon constraint (no Celery, Kafka, Redis). Expiry scanning is triggered via administrative service invocation (`POST /api/v1/notifications/check-expiries`) and scheduled during application boot/inspection events.
2. **In-Memory CSV Generation**: Uses Python standard `csv.writer` with `io.StringIO` streamed via `StreamingResponse(iter([output.getvalue()]), media_type="text/csv")`.
3. **Dynamic Validity Check**: Certificates whose `valid_until` has lapsed are reported as `EXPIRED` even prior to manual scan execution.

---

## 10. File Limits & Compliance
All files adhere to the mandatory limits:
- Backend files: <= 500 lines
- Frontend files: <= 300 lines
- Test files: <= 500 lines
- Documentation files: <= 300 lines
