from datetime import date, datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.application import VerificationApplication
from app.models.certificate import Certificate
from app.models.enums import ApplicationStatus, CertificateStatus, InspectionResult, InstrumentType, UserRole
from app.models.inspection import Inspection
from app.models.instrument import Instrument
from app.models.user import User


@pytest.fixture
def populated_test_environment(
    db_session: Session,
    owner_user: User,
    other_owner_user: User,
    lmo_user: User,
    gatc_user: User,
):
    """Seed data across users for dashboard metrics and report exports."""
    # 1. Owner 1 instrument
    inst1 = Instrument(
        registration_number="INST-2026-OWN1",
        owner_id=owner_user.id,
        instrument_type=InstrumentType.ELECTRONIC_BALANCE,
        manufacturer="Mettler Toledo",
        model_name="ME204",
        serial_number="SN-OWN1-001",
        capacity="220g",
        location="Mumbai Lab",
        is_active=True,
    )
    # 2. Owner 2 instrument
    inst2 = Instrument(
        registration_number="INST-2026-OWN2",
        owner_id=other_owner_user.id,
        instrument_type=InstrumentType.WEIGHING_SCALE,
        manufacturer="Avery India",
        model_name="E1205",
        serial_number="SN-OWN2-002",
        capacity="500kg",
        location="Pune Warehouse",
        is_active=True,
    )
    db_session.add_all([inst1, inst2])
    db_session.commit()
    db_session.refresh(inst1)
    db_session.refresh(inst2)

    now = datetime.now(timezone.utc)
    today = date.today()

    # Application 1 (Owner 1): SUBMITTED
    app1 = VerificationApplication(
        application_number="APP-OWN1-SUB",
        instrument_id=inst1.id,
        applicant_id=owner_user.id,
        application_type="INITIAL",
        status=ApplicationStatus.SUBMITTED,
        submitted_at=now,
    )
    # Application 2 (Owner 1): SCHEDULED and assigned to GATC
    app2 = VerificationApplication(
        application_number="APP-OWN1-SCH",
        instrument_id=inst1.id,
        applicant_id=owner_user.id,
        application_type="RE_VERIFICATION",
        status=ApplicationStatus.SCHEDULED,
        submitted_at=now,
    )
    # Application 3 (Owner 2): VERIFIED with active certificate
    app3 = VerificationApplication(
        application_number="APP-OWN2-VER",
        instrument_id=inst2.id,
        applicant_id=other_owner_user.id,
        application_type="INITIAL",
        status=ApplicationStatus.CERTIFICATE_ISSUED,
        submitted_at=now,
    )
    # Application 4 (Owner 1): REJECTED
    app4 = VerificationApplication(
        application_number="APP-OWN1-REJ",
        instrument_id=inst1.id,
        applicant_id=owner_user.id,
        application_type="INITIAL",
        status=ApplicationStatus.REJECTED,
        submitted_at=now,
    )
    db_session.add_all([app1, app2, app3, app4])
    db_session.commit()
    db_session.refresh(app1)
    db_session.refresh(app2)
    db_session.refresh(app3)
    db_session.refresh(app4)

    # Inspection for app2 assigned to GATC
    insp2 = Inspection(
        application_id=app2.id,
        assigned_to_id=gatc_user.id,
        scheduled_date=today + timedelta(days=2),
        scheduled_time="10:00 AM",
        inspection_location=inst1.location,
    )
    # Inspection for app3 completed by LMO
    insp3 = Inspection(
        application_id=app3.id,
        assigned_to_id=lmo_user.id,
        scheduled_date=today - timedelta(days=10),
        started_at=now - timedelta(days=10),
        completed_at=now - timedelta(days=10),
        result=InspectionResult.VERIFIED,
    )
    db_session.add_all([insp2, insp3])
    db_session.commit()

    # Active Certificate for app3 (Owner 2)
    cert3 = Certificate(
        certificate_number="METRIX-CERT-2026-000001",
        application_id=app3.id,
        instrument_id=inst2.id,
        issued_by_id=lmo_user.id,
        issued_at=now - timedelta(days=10),
        valid_from=today - timedelta(days=10),
        valid_until=today + timedelta(days=355),
        status=CertificateStatus.ACTIVE,
        integrity_hash="fakehash001",
        verification_token="token001",
    )
    # Expired Certificate for app4 (Owner 1)
    cert4 = Certificate(
        certificate_number="METRIX-CERT-2025-000099",
        application_id=app4.id,
        instrument_id=inst1.id,
        issued_by_id=lmo_user.id,
        issued_at=now - timedelta(days=400),
        valid_from=today - timedelta(days=400),
        valid_until=today - timedelta(days=35),
        status=CertificateStatus.EXPIRED,
        integrity_hash="fakehash099",
        verification_token="token099",
    )
    db_session.add_all([cert3, cert4])
    db_session.commit()

    return {
        "inst1": inst1,
        "inst2": inst2,
        "app1": app1,
        "app2": app2,
        "app3": app3,
        "app4": app4,
        "cert3": cert3,
        "cert4": cert4,
    }


def test_dashboard_summary_owner(
    client: TestClient,
    owner_headers: dict,
    populated_test_environment: dict,
):
    """Test OWNER dashboard metrics isolation."""
    res = client.get("/api/v1/dashboard/summary", headers=owner_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "INSTRUMENT_OWNER"
    metrics = data["metrics"]

    # Owner 1 owns 1 instrument, 3 applications (SUBMITTED, SCHEDULED, REJECTED), 0 active certs, 1 expired cert
    assert metrics["total_instruments"] == 1
    assert metrics["total_applications"] == 3
    assert metrics["pending_applications"] == 2  # SUBMITTED, SCHEDULED
    assert metrics["scheduled_inspections"] == 1
    assert metrics["rejected_applications"] == 1
    assert metrics["active_certificates"] == 0
    assert metrics["expired_certificates"] == 1


def test_dashboard_summary_lmo(
    client: TestClient,
    lmo_headers: dict,
    populated_test_environment: dict,
):
    """Test LMO dashboard metrics aggregation."""
    res = client.get("/api/v1/dashboard/summary", headers=lmo_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "LMO"
    metrics = data["metrics"]

    assert metrics["applications_pending_review"] >= 1  # APP1 is SUBMITTED
    assert metrics["scheduled_inspections"] >= 1
    assert metrics["certificates_issued"] >= 2


def test_dashboard_summary_gatc(
    client: TestClient,
    gatc_headers: dict,
    populated_test_environment: dict,
):
    """Test GATC dashboard metrics isolation to assigned inspections."""
    res = client.get("/api/v1/dashboard/summary", headers=gatc_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "GATC"
    metrics = data["metrics"]

    assert metrics["assigned_inspections"] == 1
    assert metrics["scheduled_inspections"] == 1
    assert metrics["inspections_in_progress"] == 0


def test_dashboard_summary_admin(
    client: TestClient,
    admin_headers: dict,
    populated_test_environment: dict,
):
    """Test ADMIN dashboard metrics system-wide summary."""
    res = client.get("/api/v1/dashboard/summary", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "ADMIN"
    metrics = data["metrics"]

    assert metrics["total_users"] >= 4
    assert "INSTRUMENT_OWNER" in metrics["users_by_role"]
    assert metrics["total_instruments"] >= 2
    assert metrics["total_applications"] >= 4
    assert metrics["active_certificates"] >= 1
    assert metrics["expired_certificates"] >= 1


def test_reports_export_applications_csv(
    client: TestClient,
    owner_headers: dict,
    admin_headers: dict,
    populated_test_environment: dict,
):
    """Test applications CSV export respecting RBAC isolation."""
    # Owner export: only Owner 1's applications
    owner_res = client.get("/api/v1/reports/applications", headers=owner_headers)
    assert owner_res.status_code == 200
    assert "text/csv" in owner_res.headers["content-type"]
    owner_csv = owner_res.text
    assert "Application Number,Instrument Registration Number" in owner_csv
    assert "APP-OWN1-SUB" in owner_csv
    assert "APP-OWN2-VER" not in owner_csv  # Other owner's app must NOT appear

    # Admin export: all applications appear
    admin_res = client.get("/api/v1/reports/applications", headers=admin_headers)
    assert admin_res.status_code == 200
    admin_csv = admin_res.text
    assert "APP-OWN1-SUB" in admin_csv
    assert "APP-OWN2-VER" in admin_csv


def test_reports_export_instruments_csv(
    client: TestClient,
    owner_headers: dict,
    admin_headers: dict,
    populated_test_environment: dict,
):
    """Test instruments CSV export respecting RBAC isolation."""
    owner_res = client.get("/api/v1/reports/instruments", headers=owner_headers)
    assert owner_res.status_code == 200
    owner_csv = owner_res.text
    assert "INST-2026-OWN1" in owner_csv
    assert "INST-2026-OWN2" not in owner_csv

    admin_res = client.get("/api/v1/reports/instruments", headers=admin_headers)
    assert admin_res.status_code == 200
    admin_csv = admin_res.text
    assert "INST-2026-OWN1" in admin_csv
    assert "INST-2026-OWN2" in admin_csv


def test_reports_export_verifications_csv(
    client: TestClient,
    gatc_headers: dict,
    admin_headers: dict,
    populated_test_environment: dict,
):
    """Test verifications/inspections CSV export."""
    gatc_res = client.get("/api/v1/reports/verifications", headers=gatc_headers)
    assert gatc_res.status_code == 200
    gatc_csv = gatc_res.text
    assert "APP-OWN1-SCH" in gatc_csv
    assert "APP-OWN2-VER" not in gatc_csv  # GATC was not assigned to APP3

    admin_res = client.get("/api/v1/reports/verifications", headers=admin_headers)
    assert admin_res.status_code == 200
    admin_csv = admin_res.text
    assert "APP-OWN1-SCH" in admin_csv
    assert "APP-OWN2-VER" in admin_csv


def test_reports_export_certificates_and_expiries_csv(
    client: TestClient,
    owner_headers: dict,
    admin_headers: dict,
    populated_test_environment: dict,
):
    """Test certificates and expiry CSV reports."""
    cert_res = client.get("/api/v1/reports/certificates", headers=owner_headers)
    assert cert_res.status_code == 200
    cert_csv = cert_res.text
    assert "METRIX-CERT-2025-000099" in cert_csv
    assert "METRIX-CERT-2026-000001" not in cert_csv  # belongs to owner 2

    expiry_res = client.get("/api/v1/reports/expiries", headers=admin_headers)
    assert expiry_res.status_code == 200
    expiry_csv = expiry_res.text
    assert "METRIX-CERT-2025-000099" in expiry_csv
    assert "EXPIRED" in expiry_csv


def test_dynamic_charts_rbac_series(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    gatc_headers: dict,
    admin_headers: dict,
    populated_test_environment: dict,
):
    """Verify that every RBAC role receives dynamic, real-time chart datasets."""
    # 1. Owner Charts
    owner_res = client.get("/api/v1/dashboard/charts", headers=owner_headers)
    assert owner_res.status_code == 200
    owner_data = owner_res.json()
    assert owner_data["role"] == "INSTRUMENT_OWNER"
    assert "monthly_trend" in owner_data
    assert "applications_by_status" in owner_data
    assert "certificate_health" in owner_data
    assert "instruments_by_type" in owner_data
    assert "verification_outcomes" in owner_data

    # 2. LMO Charts
    lmo_res = client.get("/api/v1/dashboard/charts", headers=lmo_headers)
    assert lmo_res.status_code == 200
    lmo_data = lmo_res.json()
    assert lmo_data["role"] == "LMO"
    assert "monthly_trend" in lmo_data
    assert "applications_by_status" in lmo_data
    assert "verification_outcomes" in lmo_data
    assert "inspection_modes" in lmo_data
    assert "instruments_by_type" in lmo_data
    assert "stamping_quarters" in lmo_data

    # 3. GATC Charts
    gatc_res = client.get("/api/v1/dashboard/charts", headers=gatc_headers)
    assert gatc_res.status_code == 200
    gatc_data = gatc_res.json()
    assert gatc_data["role"] == "GATC"
    assert "monthly_trend" in gatc_data
    assert "applications_by_status" in gatc_data
    assert "verification_outcomes" in gatc_data
    assert "instruments_by_type" in gatc_data

    # 4. Admin Charts
    admin_res = client.get("/api/v1/dashboard/charts", headers=admin_headers)
    assert admin_res.status_code == 200
    admin_data = admin_res.json()
    assert admin_data["role"] == "ADMIN"
    assert "monthly_trend" in admin_data
    assert "applications_by_status" in admin_data
    assert "users_by_role" in admin_data
    assert "instruments_by_type" in admin_data
    assert "certificate_health" in admin_data
    assert "inspection_modes" in admin_data
    assert "verification_outcomes" in admin_data

