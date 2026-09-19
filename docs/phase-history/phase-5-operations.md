# METRIX — Phase 5: Operations, Expiry Tracking, Notifications & Reporting

> **Document Status**: HISTORICAL REFERENCE  
> **Authoritative Current-State Guide**: See [docs/10-notifications.md](../10-notifications.md) and [docs/11-dashboard-search-reporting.md](../11-dashboard-search-reporting.md).

---

## 1. Phase Overview

Phase 5 introduced operational dashboards, certificate expiry monitoring, in-app notification infrastructure, multi-domain search & filtering, and CSV report streaming under migration `0004_notifications`.

---

## 2. Key Deliverables & Database Schema

1. **`notifications` Entity**:
   - `id`: BigInteger primary key.
   - `user_id`: Indexed foreign key to `users.id`.
   - `type`: Enum `NotificationType` across 9 lifecycle events.
   - `title`, `message`, `is_read`, `created_at`, `read_at`.
   - `entity_type` & `entity_id`: Indexed metadata for deduplication.

2. **Role-Aware Telemetry Dashboards** (`GET /api/v1/dashboard/summary`):
   - **Instrument Owner**: Total fleet count, active verifications, expiring and expired certificates.
   - **LMO**: Queue telemetry (pending reviews, scheduled, in-progress, completed, certificates issued).
   - **GATC**: Assigned inspection metrics (pending, in-progress, completed).
   - **Admin**: Full system health, aggregate users, applications, and compliance counts.

3. **In-App Notification Dispatch & Deduplication**:
   - In-service event hooks triggering notifications on application submission, scheduling, inspection assignment, completion, verification result, and certificate issuance.
   - Expiry alerts dispatched when certificates enter warning window (`CERTIFICATE_EXPIRY_WARNING_DAYS`, default 30 days).
   - Deduplication prevents multiple identical warning notices for the same certificate.

4. **Multi-Domain Search & Filtering**:
   - Multi-parameter filtering with pagination on `/instruments`, `/applications`, and `/certificates`.

5. **Operational CSV Reporting**:
   - Memory-efficient CSV streaming (`io.StringIO` via `StreamingResponse`) across 5 reporting domains (`/reports/applications`, `/instruments`, `/verifications`, `/certificates`, `/expiries`).

---

## 3. Key Architectural Decisions in Phase 5

1. **In-App Notifications vs. External Gateways**:
   - In-app notification table chosen over external SMS/Email brokers (Kafka/Twilio/Celery), upholding zero external dependencies.
2. **In-Memory CSV Streaming**:
   - Python built-in `csv.writer` and `io.StringIO` used to stream reports without temporary filesystem artifacts.
3. **Trigger-Based Expiry Scanning**:
   - Background scans executed via admin endpoint `POST /api/v1/notifications/check-expiries` and on application initialization, avoiding heavy external daemons.
