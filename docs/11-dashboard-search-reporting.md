# METRIX — Dashboards, Search & Operational Reporting

> **Document Status**: CURRENT STATE (Post-Phase 6 Verified)  
> **Master Index**: See [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).

---

## 1. Role-Aware Operational Telemetry

The dashboard summary endpoint (`GET /api/v1/dashboard/summary`) executes targeted SQL aggregations via `DashboardRepository`, returning role-tailored metrics:

### 1. `INSTRUMENT_OWNER` Dashboard
- `total_instruments`: Total physical equipment registered by owner.
- `total_applications`: Count of verification requests lodged.
- `active_certificates`: Count of certified instruments currently in statutory validity.
- `expiring_certificates`: Certificates expiring within the warning threshold (30 days).
- `expired_certificates`: Certificates past statutory validity.
- `applications_by_status`: Distribution of applications across active workflow stages.

### 2. `LEGAL METROLOGY OFFICER (LMO)` Dashboard
- `pending_review`: Submitted applications awaiting administrative acceptance.
- `scheduled_inspections`: Verification appointments scheduled for field/lab testing.
- `inspections_in_progress`: Currently active field verifications.
- `inspections_completed`: Completed inspections awaiting statutory verification results.
- `certificates_issued`: Total official certificates issued across the officer's jurisdiction.

### 3. `GOVERNMENT APPROVED TEST CENTRE (GATC)` Dashboard
- `total_assigned`: Laboratory calibrations assigned to the test centre.
- `pending_inspections`: Assigned lab verifications not yet initiated.
- `in_progress_inspections`: Currently undergoing calibration procedures.
- `completed_inspections`: Completed laboratory verifications.

### 4. `ADMINISTRATOR` Dashboard
- System-wide executive telemetry: aggregate users by role, fleet totals, system verification throughput, and jurisdiction-wide compliance rates.

---

## 2. Multi-Domain Search & Filtering

All primary listing endpoints implement multi-column SQL filtering with mandatory pagination (`page` and `page_size`):

| Domain | API Endpoint | Supported Filter Parameters | Database Indexes Utilized |
| :--- | :--- | :--- | :--- |
| **Instruments** | `GET /api/v1/instruments` | `registration_number`, `serial_number`, `instrument_type`, `manufacturer`, `location`, `owner_id` | `ix_instruments_reg_no`<br>`ix_instruments_serial_no` |
| **Applications** | `GET /api/v1/applications` | `application_number`, `instrument_id`, `status`, `applicant_id`, `from_date`, `to_date` | `ix_applications_app_no`<br>`ix_applications_status` |
| **Certificates** | `GET /api/v1/certificates` | `certificate_number`, `status`, `issue_date_from`, `issue_date_to`, `expiry_date_from`, `expiry_date_to`, `owner_id` | `ix_certificates_cert_no`<br>`ix_certificates_valid_until` |

---

## 3. Operational Reporting & CSV Data Streaming

METRIX streams audit reports as formatted `text/csv` using Python's built-in `csv` module and `io.StringIO`, eliminating temporary disk files and ensuring high streaming throughput:

| Report Endpoint | Authorized Roles | Data Fields Exported |
| :--- | :--- | :--- |
| `GET /api/v1/reports/applications` | All (Tenant-Scoped) | Application ID, App Number, Instrument ID, Applicant Name, Type, Status, Submission Date |
| `GET /api/v1/reports/instruments` | Owner, LMO, Admin | Instrument ID, Reg Number, Type, Manufacturer, Model, Serial Number, Location, Status |
| `GET /api/v1/reports/verifications`| LMO, GATC, Admin | Inspection ID, App Number, Assigned Verifier, Scheduled Date, Result, Completion Date |
| `GET /api/v1/reports/certificates` | All (Tenant-Scoped) | Certificate ID, Cert Number, Instrument Reg, Valid From, Valid Until, Status, Hash |
| `GET /api/v1/reports/expiries` | Owner, LMO, Admin | Expiry Report: Cert Number, Reg Number, Owner, Valid Until, Days Remaining, Status |

### Role Scoping on Exports
- **Instrument Owners** receive CSV files scoped exclusively to their own assets.
- **GATC Centres** receive CSV files containing only their assigned calibrations.
- **LMO and Admins** export jurisdiction-wide or system-wide audit reports.
