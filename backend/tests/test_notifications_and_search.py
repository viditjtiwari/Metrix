from datetime import date, datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.application import VerificationApplication
from app.models.certificate import Certificate
from app.models.enums import ApplicationStatus, CertificateStatus, InstrumentType
from app.models.instrument import Instrument
from app.models.user import User


@pytest.fixture
def base_search_environment(
    db_session: Session,
    owner_user: User,
    other_owner_user: User,
    lmo_user: User,
):
    """Seed instruments, applications, and certificates with distinct attributes for search testing."""
    now = datetime.now(timezone.utc)
    today = date.today()

    inst1 = Instrument(
        registration_number="INST-REG-SCALE-01",
        owner_id=owner_user.id,
        instrument_type=InstrumentType.WEIGHING_SCALE,
        manufacturer="Apex Weighing",
        model_name="AW-100",
        serial_number="SN-APEX-01",
        capacity="100kg",
        location="Delhi Mandi",
        is_active=True,
    )
    inst2 = Instrument(
        registration_number="INST-REG-FLOW-02",
        owner_id=other_owner_user.id,
        instrument_type=InstrumentType.FLOW_METER,
        manufacturer="Yokogawa",
        model_name="YF-200",
        serial_number="SN-YOKO-02",
        capacity="50L/min",
        location="Jaipur Depot",
        is_active=True,
    )
    db_session.add_all([inst1, inst2])
    db_session.commit()
    db_session.refresh(inst1)
    db_session.refresh(inst2)

    app1 = VerificationApplication(
        application_number="APP-SEARCH-001",
        instrument_id=inst1.id,
        applicant_id=owner_user.id,
        application_type="INITIAL",
        status=ApplicationStatus.SUBMITTED,
        submitted_at=now,
    )
    app2 = VerificationApplication(
        application_number="APP-SEARCH-002",
        instrument_id=inst2.id,
        applicant_id=other_owner_user.id,
        application_type="RE_VERIFICATION",
        status=ApplicationStatus.CERTIFICATE_ISSUED,
        submitted_at=now,
    )
    db_session.add_all([app1, app2])
    db_session.commit()
    db_session.refresh(app1)
    db_session.refresh(app2)

    # Cert expiring soon (in 15 days)
    cert_expiring = Certificate(
        certificate_number="CERT-EXPIRING-SOON-01",
        application_id=app2.id,
        instrument_id=inst2.id,
        issued_by_id=lmo_user.id,
        issued_at=now - timedelta(days=350),
        valid_from=today - timedelta(days=350),
        valid_until=today + timedelta(days=15),
        status=CertificateStatus.ACTIVE,
        integrity_hash="hash_expiring",
        verification_token="token_expiring",
    )
    # Cert already expired (30 days ago)
    cert_expired = Certificate(
        certificate_number="CERT-ALREADY-EXPIRED-02",
        application_id=app1.id,
        instrument_id=inst1.id,
        issued_by_id=lmo_user.id,
        issued_at=now - timedelta(days=400),
        valid_from=today - timedelta(days=400),
        valid_until=today - timedelta(days=30),
        status=CertificateStatus.EXPIRED,
        integrity_hash="hash_expired",
        verification_token="token_expired",
    )
    db_session.add_all([cert_expiring, cert_expired])
    db_session.commit()

    return {
        "inst1": inst1,
        "inst2": inst2,
        "app1": app1,
        "app2": app2,
        "cert_expiring": cert_expiring,
        "cert_expired": cert_expired,
    }


def test_notifications_lifecycle_generation_and_read(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    owner_user: User,
    other_owner_headers: dict,
    db_session: Session,
):
    """Test notification generation during application submission and read lifecycle."""
    # 1. Register an instrument
    reg_res = client.post(
        "/api/v1/instruments",
        headers=owner_headers,
        json={
            "instrument_type": "ELECTRONIC_BALANCE",
            "manufacturer": "Sartorius",
            "model_name": "Entris",
            "serial_number": "SN-SART-999",
            "capacity": "300g",
            "location": "Central Lab",
        },
    )
    assert reg_res.status_code == 201
    inst_id = reg_res.json()["id"]

    # 2. Submit application
    app_res = client.post(
        "/api/v1/applications",
        headers=owner_headers,
        json={
            "instrument_id": inst_id,
            "application_type": "INITIAL",
            "submit_now": True,
            "remarks": "Priority verification",
        },
    )
    assert app_res.status_code == 201
    app_id = app_res.json()["id"]

    # 3. Verify owner received APPLICATION_SUBMITTED notification
    notif_res = client.get("/api/v1/notifications", headers=owner_headers)
    assert notif_res.status_code == 200
    notif_data = notif_res.json()
    assert notif_data["total"] >= 1
    assert notif_data["unread_count"] >= 1
    found = [n for n in notif_data["items"] if n["type"] == "APPLICATION_SUBMITTED"]
    assert len(found) >= 1
    notif_id = found[0]["id"]

    # 4. User isolation: other owner has zero of this user's notifications
    other_notif_res = client.get("/api/v1/notifications", headers=other_owner_headers)
    assert other_notif_res.status_code == 200
    other_items = other_notif_res.json()["items"]
    assert not any(n["id"] == notif_id for n in other_items)

    # 5. Other user cannot mark this notification as read
    unauth_patch = client.patch(
        f"/api/v1/notifications/{notif_id}/read", headers=other_owner_headers
    )
    assert unauth_patch.status_code == 404

    # 6. Owner marks notification as read
    read_res = client.patch(
        f"/api/v1/notifications/{notif_id}/read", headers=owner_headers
    )
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # 7. Test mark-all-as-read endpoint
    read_all_res = client.patch(
        "/api/v1/notifications/read-all", headers=owner_headers
    )
    assert read_all_res.status_code == 200


def test_expiry_notification_dispatch_and_deduplication(
    client: TestClient,
    admin_headers: dict,
    owner_headers: dict,
    other_owner_headers: dict,
    base_search_environment: dict,
):
    """Test check-expiries administrative trigger and deduplication strategy."""
    # Trigger expiry check
    check_res = client.post("/api/v1/notifications/check-expiries", headers=admin_headers)
    assert check_res.status_code == 200
    data = check_res.json()
    assert data["expiring_notifications_created"] >= 1
    assert data["expired_notifications_created"] >= 1

    # Second call should deduplicate (0 new notifications created)
    check_res2 = client.post("/api/v1/notifications/check-expiries", headers=admin_headers)
    assert check_res2.status_code == 200
    data2 = check_res2.json()
    assert data2["expiring_notifications_created"] == 0
    assert data2["expired_notifications_created"] == 0

    # Other owner (who owns the expiring certificate) should have CERTIFICATE_EXPIRING notification
    notifs = client.get("/api/v1/notifications", headers=other_owner_headers).json()["items"]
    assert any(n["type"] == "CERTIFICATE_EXPIRING" for n in notifs)


def test_instrument_search_and_filtering(
    client: TestClient,
    owner_headers: dict,
    admin_headers: dict,
    base_search_environment: dict,
):
    """Test instrument filtering and role boundary enforcement."""
    # Filter by manufacturer
    res = client.get("/api/v1/instruments?manufacturer=Apex", headers=admin_headers)
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) == 1
    assert items[0]["manufacturer"] == "Apex Weighing"

    # Filter by instrument type
    res_type = client.get("/api/v1/instruments?instrument_type=FLOW_METER", headers=admin_headers)
    assert res_type.status_code == 200
    assert len(res_type.json()["items"]) == 1

    # Owner 1 cannot see Owner 2's instruments even when querying with no filters
    res_owner = client.get("/api/v1/instruments", headers=owner_headers)
    assert res_owner.status_code == 200
    owner_items = res_owner.json()["items"]
    assert all(i["registration_number"] == "INST-REG-SCALE-01" for i in owner_items)


def test_application_search_and_filtering(
    client: TestClient,
    owner_headers: dict,
    admin_headers: dict,
    base_search_environment: dict,
):
    """Test application filtering by status, application_number, and ownership."""
    # Admin search by application_number
    res = client.get("/api/v1/applications?application_number=SEARCH-001", headers=admin_headers)
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) == 1
    assert items[0]["application_number"] == "APP-SEARCH-001"

    # Filter by status
    res_status = client.get("/api/v1/applications?status=SUBMITTED", headers=admin_headers)
    assert res_status.status_code == 200
    assert len(res_status.json()["items"]) >= 1

    # Owner isolation on applications search
    res_owner = client.get("/api/v1/applications", headers=owner_headers)
    assert res_owner.status_code == 200
    owner_items = res_owner.json()["items"]
    assert all(a["application_number"] == "APP-SEARCH-001" for a in owner_items)


def test_certificate_search_and_expiry_endpoints(
    client: TestClient,
    owner_headers: dict,
    admin_headers: dict,
    base_search_environment: dict,
):
    """Test certificate search, expiring soon list, and expired list."""
    # 1. Search certificates
    res = client.get("/api/v1/certificates?certificate_number=EXPIRING", headers=admin_headers)
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) == 1
    assert items[0]["certificate_number"] == "CERT-EXPIRING-SOON-01"

    # 2. Certificates expiring soon
    res_exp = client.get("/api/v1/certificates/expiring", headers=admin_headers)
    assert res_exp.status_code == 200
    exp_items = res_exp.json()["items"]
    assert any(c["certificate_number"] == "CERT-EXPIRING-SOON-01" for c in exp_items)

    # 3. Certificates expired
    res_expired = client.get("/api/v1/certificates/expired", headers=admin_headers)
    assert res_expired.status_code == 200
    expired_items = res_expired.json()["items"]
    assert any(c["certificate_number"] == "CERT-ALREADY-EXPIRED-02" for c in expired_items)
