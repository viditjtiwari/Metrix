"""Phase 6 Final Hardening, State Machine, RBAC/IDOR, and Re-Verification Tests."""
from datetime import date, datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash
from app.models.enums import ApplicationStatus, CertificateStatus, InspectionResult, UserRole
from app.models.user import User
from app.repositories.certificate_repository import certificate_repository


@pytest.fixture
def unassigned_gatc_user(db_session: Session) -> User:
    """Create a second GATC user who is NOT assigned to inspections."""
    user = User(
        email="unassigned_gatc@example.com",
        hashed_password=get_password_hash("SecretPassword123!"),
        full_name="Unassigned GATC Lab",
        role=UserRole.GATC,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def unassigned_gatc_headers(unassigned_gatc_user: User) -> dict:
    token = create_access_token(
        subject=unassigned_gatc_user.id,
        extra_claims={"role": unassigned_gatc_user.role.value, "email": unassigned_gatc_user.email},
    )
    return {"Authorization": f"Bearer {token}"}


def test_invalid_state_transitions_are_rejected(
    client: TestClient, owner_headers: dict, lmo_headers: dict
) -> None:
    """Verify that all prohibited workflow state transitions return HTTP 400."""
    # 1. Register instrument & create DRAFT application
    inst = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "WEIGHING_SCALE",
            "manufacturer": "Avery Weigh-Tronix",
            "model_name": "ZK840",
            "serial_number": "SN-PH6-001",
            "location": "Warehouse Hub 1",
        },
        headers=owner_headers,
    ).json()

    draft_app = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst["id"], "submit_now": False},
        headers=owner_headers,
    ).json()
    app_id = draft_app["id"]

    # DRAFT -> VERIFIED
    res = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "VERIFIED"},
        headers=lmo_headers,
    )
    assert res.status_code == 400
    assert "illegal state transition" in res.json()["detail"].lower()

    # DRAFT -> CERTIFICATE_ISSUED
    res = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "CERTIFICATE_ISSUED"},
        headers=lmo_headers,
    )
    assert res.status_code == 400

    # Submit to SUBMITTED
    client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "SUBMITTED"},
        headers=owner_headers,
    )

    # SUBMITTED -> CERTIFICATE_ISSUED
    res = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "CERTIFICATE_ISSUED"},
        headers=lmo_headers,
    )
    assert res.status_code == 400

    # SUBMITTED -> UNDER_REVIEW
    client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW"},
        headers=lmo_headers,
    )

    # UNDER_REVIEW -> CERTIFICATE_ISSUED
    res = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "CERTIFICATE_ISSUED"},
        headers=lmo_headers,
    )
    assert res.status_code == 400

    # Schedule inspection -> SCHEDULED
    client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json={
            "scheduled_date": (date.today() + timedelta(days=2)).isoformat(),
            "scheduled_time": "11:00 AM",
            "inspection_location": "Warehouse Hub 1",
        },
        headers=lmo_headers,
    )

    # SCHEDULED -> VERIFIED
    res = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "VERIFIED"},
        headers=lmo_headers,
    )
    assert res.status_code == 400

    # SCHEDULED -> CERTIFICATE_ISSUED
    res = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "CERTIFICATE_ISSUED"},
        headers=lmo_headers,
    )
    assert res.status_code == 400


def test_idor_cross_owner_isolation(
    client: TestClient, owner_headers: dict, other_owner_headers: dict, lmo_headers: dict
) -> None:
    """Verify Owner A cannot view, modify, or submit Owner B's instruments and applications."""
    # Owner A creates instrument and draft application
    inst_a = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "PETROL_DISPENSER",
            "manufacturer": "Tokheim",
            "model_name": "Quantium 510",
            "serial_number": "TK-8899",
            "location": "Retail Outlet 5",
        },
        headers=owner_headers,
    ).json()

    app_a = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_a["id"], "submit_now": False},
        headers=owner_headers,
    ).json()

    # Owner B attempts to view Owner A's instrument -> 403
    res = client.get(f"/api/v1/instruments/{inst_a['id']}", headers=other_owner_headers)
    assert res.status_code == 403

    # Owner B attempts to view Owner A's application -> 403
    res = client.get(f"/api/v1/applications/{app_a['id']}", headers=other_owner_headers)
    assert res.status_code == 403

    # Owner B attempts to submit Owner A's application -> 403
    res = client.patch(
        f"/api/v1/applications/{app_a['id']}/status",
        json={"status": "SUBMITTED"},
        headers=other_owner_headers,
    )
    assert res.status_code == 403


def test_gatc_access_scoping_and_isolation(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    gatc_headers: dict,
    gatc_user: User,
    unassigned_gatc_headers: dict,
) -> None:
    """Verify GATC centres can only access inspections and certificates assigned to them."""
    # Setup verified application and certificate assigned to gatc_user
    inst = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "ELECTRONIC_BALANCE",
            "manufacturer": "Sartorius",
            "model_name": "Secura 224",
            "serial_number": "SEC-7700",
            "location": "Testing Lab",
        },
        headers=owner_headers,
    ).json()

    app = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst["id"], "submit_now": True},
        headers=owner_headers,
    ).json()
    app_id = app["id"]

    client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW"},
        headers=lmo_headers,
    )

    client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json={
            "scheduled_date": date.today().isoformat(),
            "scheduled_time": "09:30 AM",
            "inspection_location": "Testing Lab",
            "assigned_to_id": gatc_user.id,
        },
        headers=lmo_headers,
    )

    # Start and complete inspection by assigned GATC
    client.post(f"/api/v1/applications/{app_id}/inspection", headers=gatc_headers)
    insp_data = client.get(f"/api/v1/applications/{app_id}/inspection", headers=gatc_headers).json()
    insp_id = insp_data["id"]

    client.post(
        f"/api/v1/inspections/{insp_id}/observations",
        json={"parameter_name": "Repeatability", "observed_value": "0.1 mg", "is_passed": True},
        headers=gatc_headers,
    )

    client.patch(
        f"/api/v1/inspections/{insp_id}/result",
        json={"result": "VERIFIED", "remarks": "Meets Class I standards"},
        headers=gatc_headers,
    )

    # LMO issues certificate
    cert_res = client.post(f"/api/v1/applications/{app_id}/certificate", headers=lmo_headers)
    assert cert_res.status_code == 201
    cert_id = cert_res.json()["id"]

    # 1. Assigned GATC can access certificate
    assigned_get = client.get(f"/api/v1/certificates/{cert_id}", headers=gatc_headers)
    assert assigned_get.status_code == 200

    # 2. Unassigned GATC cannot access certificate (403)
    unassigned_get = client.get(f"/api/v1/certificates/{cert_id}", headers=unassigned_gatc_headers)
    assert unassigned_get.status_code == 403

    # 3. Unassigned GATC cannot download certificate PDF (403)
    unassigned_dl = client.get(f"/api/v1/certificates/{cert_id}/download", headers=unassigned_gatc_headers)
    assert unassigned_dl.status_code == 403

    # 4. GATC cannot download full instrument report (403)
    gatc_inst_rep = client.get("/api/v1/reports/instruments", headers=gatc_headers)
    assert gatc_inst_rep.status_code == 403

    # 5. GATC cannot download full expiry report (403)
    gatc_exp_rep = client.get("/api/v1/reports/expiries", headers=gatc_headers)
    assert gatc_exp_rep.status_code == 403


def test_re_verification_lifecycle_preserves_history(
    client: TestClient,
    db_session: Session,
    owner_headers: dict,
    lmo_headers: dict,
    gatc_headers: dict,
    gatc_user: User,
) -> None:
    """Verify complete re-verification flow preserves previous application and certificate."""
    # 1. Register instrument
    inst = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "WEIGHING_SCALE",
            "manufacturer": "Essae",
            "model_name": "DS-852",
            "serial_number": "SN-REVERIF-01",
            "location": "Checkout 1",
        },
        headers=owner_headers,
    ).json()
    inst_id = inst["id"]

    # 2. First verification application
    app1 = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "application_type": "INITIAL", "submit_now": True},
        headers=owner_headers,
    ).json()
    app1_id = app1["id"]

    client.patch(f"/api/v1/applications/{app1_id}/status", json={"status": "UNDER_REVIEW"}, headers=lmo_headers)
    client.patch(
        f"/api/v1/applications/{app1_id}/schedule",
        json={"scheduled_date": date.today().isoformat(), "assigned_to_id": gatc_user.id},
        headers=lmo_headers,
    )
    client.post(f"/api/v1/applications/{app1_id}/inspection", headers=gatc_headers)
    insp1 = client.get(f"/api/v1/applications/{app1_id}/inspection", headers=gatc_headers).json()
    client.patch(
        f"/api/v1/inspections/{insp1['id']}/result",
        json={"result": "VERIFIED", "remarks": "Passed initial test"},
        headers=gatc_headers,
    )
    cert1 = client.post(f"/api/v1/applications/{app1_id}/certificate", headers=lmo_headers).json()
    cert1_id = cert1["id"]
    cert1_num = cert1["certificate_number"]

    # 3. Simulate certificate expiry in database
    db_cert1 = certificate_repository.get_by_id(db_session, cert1_id)
    db_cert1.valid_until = date.today() - timedelta(days=5)
    db_session.commit()

    # 4. Owner creates RE_VERIFICATION application for the same instrument
    app2_resp = client.post(
        "/api/v1/applications",
        json={
            "instrument_id": inst_id,
            "application_type": "RE_VERIFICATION",
            "submit_now": True,
            "remarks": "Annual re-verification",
        },
        headers=owner_headers,
    )
    assert app2_resp.status_code == 201
    app2 = app2_resp.json()
    app2_id = app2["id"]
    assert app2_id != app1_id
    assert app2["application_type"] == "RE_VERIFICATION"
    assert app2["status"] == "SUBMITTED"

    # 5. Process second application
    client.patch(f"/api/v1/applications/{app2_id}/status", json={"status": "UNDER_REVIEW"}, headers=lmo_headers)
    client.patch(
        f"/api/v1/applications/{app2_id}/schedule",
        json={"scheduled_date": date.today().isoformat(), "assigned_to_id": gatc_user.id},
        headers=lmo_headers,
    )
    client.post(f"/api/v1/applications/{app2_id}/inspection", headers=gatc_headers)
    insp2 = client.get(f"/api/v1/applications/{app2_id}/inspection", headers=gatc_headers).json()
    client.patch(
        f"/api/v1/inspections/{insp2['id']}/result",
        json={"result": "VERIFIED", "remarks": "Passed re-verification"},
        headers=gatc_headers,
    )
    cert2 = client.post(f"/api/v1/applications/{app2_id}/certificate", headers=lmo_headers).json()
    cert2_id = cert2["id"]
    cert2_num = cert2["certificate_number"]

    assert cert2_id != cert1_id
    assert cert2_num != cert1_num
    assert cert2["status"] == "ACTIVE"

    # 6. Verify historical certificate 1 is intact and reports EXPIRED
    old_cert = client.get(f"/api/v1/certificates/{cert1_id}", headers=owner_headers).json()
    assert old_cert["certificate_number"] == cert1_num
    assert old_cert["status"] == "EXPIRED"

    # 7. Verify historical application 1 remains CERTIFICATE_ISSUED
    old_app = client.get(f"/api/v1/applications/{app1_id}", headers=owner_headers).json()
    assert old_app["status"] == "CERTIFICATE_ISSUED"
    assert len(old_app["status_history"]) >= 4
