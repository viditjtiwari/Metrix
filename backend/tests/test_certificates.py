from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.certificate import Certificate
from app.models.enums import ApplicationStatus, CertificateStatus
from app.models.user import User
from app.repositories.certificate_repository import certificate_repository
from app.services.certificate_service import certificate_service


def _setup_verified_application(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    gatc_headers: dict,
    gatc_user: User,
) -> int:
    """Helper to take an application from submission all the way to VERIFIED."""
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "WEIGHING_SCALE",
            "manufacturer": "Avery Weigh-Tronix",
            "model_name": "ZK830",
            "serial_number": f"SN-AVERY-{inst_count()}",
            "capacity": "50 kg",
            "location": "Warehouse Platform 4",
        },
        headers=owner_headers,
    )
    inst_id = inst_resp.json()["id"]

    app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": True, "remarks": "Mandatory periodic verification"},
        headers=owner_headers,
    )
    app_id = app_resp.json()["id"]

    # 1. Review
    client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW", "remarks": "Documents accepted"},
        headers=lmo_headers,
    )

    # 2. Schedule & Assign
    sched_date = date.today().isoformat()
    client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json={
            "scheduled_date": sched_date,
            "scheduled_time": "09:30 AM",
            "inspection_location": "Warehouse Platform 4",
            "assigned_to_id": gatc_user.id,
        },
        headers=lmo_headers,
    )

    # 3. Start Inspection
    client.post(f"/api/v1/applications/{app_id}/inspection", headers=gatc_headers)

    # 4. Record Observation
    insp_resp = client.get(f"/api/v1/applications/{app_id}/inspection", headers=gatc_headers)
    insp_id = insp_resp.json()["id"]
    client.post(
        f"/api/v1/inspections/{insp_id}/observations",
        json={
            "parameter_name": "Full Span Accuracy",
            "observed_value": "50.00",
            "standard_value": "50.00",
            "unit": "kg",
            "is_passed": True,
            "remarks": "Span deviation 0.00% within tolerance",
        },
        headers=gatc_headers,
    )

    # 5. Finalize with VERIFIED
    client.patch(
        f"/api/v1/inspections/{insp_id}/result",
        json={"result": "VERIFIED", "remarks": "All metrological checks passed"},
        headers=gatc_headers,
    )

    return app_id


_counter = 0


def inst_count():
    global _counter
    _counter += 1
    return _counter


def test_cannot_issue_certificate_for_unverified_statuses(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    gatc_headers: dict,
    gatc_user: User,
) -> None:
    """Tests 1-5: Cannot issue certificate for SUBMITTED, UNDER_REVIEW, SCHEDULED, INSPECTION_IN_PROGRESS, REJECTED."""
    # 1. SUBMITTED
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "FLOW_METER",
            "manufacturer": "Endress+Hauser",
            "model_name": "Promass F",
            "serial_number": f"SN-EH-{inst_count()}",
            "location": "Dispensing Terminal",
        },
        headers=owner_headers,
    )
    app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_resp.json()["id"], "submit_now": True},
        headers=owner_headers,
    )
    app_id = app_resp.json()["id"]

    res_sub = client.post(f"/api/v1/applications/{app_id}/certificate", headers=lmo_headers)
    assert res_sub.status_code == 400
    assert "VERIFIED" in res_sub.json()["detail"]

    # 2. UNDER_REVIEW
    client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "UNDER_REVIEW"}, headers=lmo_headers)
    res_rev = client.post(f"/api/v1/applications/{app_id}/certificate", headers=lmo_headers)
    assert res_rev.status_code == 400

    # 3. SCHEDULED
    client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json={"scheduled_date": date.today().isoformat(), "assigned_to_id": gatc_user.id},
        headers=lmo_headers,
    )
    res_sch = client.post(f"/api/v1/applications/{app_id}/certificate", headers=lmo_headers)
    assert res_sch.status_code == 400

    # 4. INSPECTION_IN_PROGRESS
    client.post(f"/api/v1/applications/{app_id}/inspection", headers=gatc_headers)
    res_inp = client.post(f"/api/v1/applications/{app_id}/certificate", headers=lmo_headers)
    assert res_inp.status_code == 400

    # 5. REJECTED
    insp_id = client.get(f"/api/v1/applications/{app_id}/inspection", headers=gatc_headers).json()["id"]
    client.patch(
        f"/api/v1/inspections/{insp_id}/result",
        json={"result": "REJECTED", "remarks": "Calibration failed"},
        headers=gatc_headers,
    )
    res_rej = client.post(f"/api/v1/applications/{app_id}/certificate", headers=lmo_headers)
    assert res_rej.status_code == 400


def test_certificate_issuance_lifecycle_and_integrity(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    gatc_headers: dict,
    gatc_user: User,
) -> None:
    """Tests 6, 7, 8, 9, 10, 11, 12, 13: Issuance, uniqueness, SHA-256 determinism, PDF, status transitions."""
    app_id = _setup_verified_application(client, owner_headers, lmo_headers, gatc_headers, gatc_user)

    # 6. Issue certificate as LMO
    issue_resp = client.post(
        f"/api/v1/applications/{app_id}/certificate",
        json={"remarks": "Verified and sealed under standard tolerances"},
        headers=lmo_headers,
    )
    assert issue_resp.status_code == 201
    cert_data = issue_resp.json()

    cert_id = cert_data["id"]
    cert_num = cert_data["certificate_number"]
    token = cert_data["verification_token"]
    hash_val = cert_data["integrity_hash"]

    # 8. Certificate number format
    assert cert_num.startswith("METRIX-CERT-")

    # 9. Verification token exists and is long enough
    assert len(token) >= 32

    # 10. SHA-256 hash is 64 hex chars and deterministic
    assert len(hash_val) == 64
    recalculated_hash = certificate_service.calculate_integrity_hash(
        certificate_service.generate_canonical_payload(
            certificate_number=cert_num,
            application_number=cert_data["application_number"],
            instrument_registration_number=cert_data["instrument_registration_number"],
            instrument_serial_number=cert_data["serial_number"],
            instrument_type=cert_data["instrument_type"],
            owner_identifier="Rajesh Verma",
            inspection_result="VERIFIED",
            issued_at=cert_data["issued_at"],
            valid_from=cert_data["valid_from"],
            valid_until=cert_data["valid_until"],
            verification_token=token,
        )
    )
    assert recalculated_hash == hash_val

    # 11. PDF generation and download
    dl_resp = client.get(f"/api/v1/certificates/{cert_id}/download", headers=owner_headers)
    assert dl_resp.status_code == 200
    assert dl_resp.headers["content-type"] == "application/pdf"
    assert dl_resp.content.startswith(b"%PDF")

    # 12. Application status becomes CERTIFICATE_ISSUED
    app_resp = client.get(f"/api/v1/applications/{app_id}", headers=owner_headers)
    assert app_resp.json()["status"] == "CERTIFICATE_ISSUED"

    # 13. Status history has CERTIFICATE_ISSUED
    history = app_resp.json()["status_history"]
    assert history[-1]["from_status"] == "VERIFIED"
    assert history[-1]["to_status"] == "CERTIFICATE_ISSUED"

    # 7. Duplicate certificate cannot be created
    dup_resp = client.post(
        f"/api/v1/applications/{app_id}/certificate",
        headers=lmo_headers,
    )
    assert dup_resp.status_code == 400
    assert "already been issued" in dup_resp.json()["detail"]


def test_public_qr_verification_endpoint(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    gatc_headers: dict,
    gatc_user: User,
) -> None:
    """Tests 14, 15, 16, 21: Public verification unauthenticated, 404 on invalid token, sensitive fields hidden."""
    app_id = _setup_verified_application(client, owner_headers, lmo_headers, gatc_headers, gatc_user)
    issue_resp = client.post(f"/api/v1/applications/{app_id}/certificate", headers=lmo_headers)
    token = issue_resp.json()["verification_token"]

    # 14. Public verification works with NO auth headers
    pub_resp = client.get(f"/api/v1/public/certificates/verify/{token}")
    assert pub_resp.status_code == 200
    pub_data = pub_resp.json()

    # 16. Active certificate returns ACTIVE
    assert pub_data["status"] == "ACTIVE"
    assert pub_data["verification_result"] == "VERIFIED"
    assert pub_data["certificate_number"] == issue_resp.json()["certificate_number"]

    # 21. No sensitive fields exposed in public verification
    for forbidden in ["password", "hashed_password", "token", "applicant_id", "owner_id", "user_id"]:
        assert forbidden not in pub_data

    # 15. Invalid verification token returns 404
    bad_resp = client.get("/api/v1/public/certificates/verify/totally-nonexistent-token-xyz")
    assert bad_resp.status_code == 404
    assert "not found" in bad_resp.json()["detail"].lower()


def test_certificate_dynamic_expiry_evaluation(
    client: TestClient,
    db_session: Session,
    owner_headers: dict,
    lmo_headers: dict,
    gatc_headers: dict,
    gatc_user: User,
) -> None:
    """Test 17: Certificate with valid_until in the past dynamically evaluates to EXPIRED."""
    app_id = _setup_verified_application(client, owner_headers, lmo_headers, gatc_headers, gatc_user)
    issue_resp = client.post(f"/api/v1/applications/{app_id}/certificate", headers=lmo_headers)
    token = issue_resp.json()["verification_token"]
    cert_id = issue_resp.json()["id"]

    # Manually simulate expired validity in the database
    cert = certificate_repository.get_by_id(db_session, cert_id)
    cert.valid_until = date.today() - timedelta(days=1)
    db_session.commit()

    # Public verification should now report EXPIRED
    pub_resp = client.get(f"/api/v1/public/certificates/verify/{token}")
    assert pub_resp.status_code == 200
    assert pub_resp.json()["status"] == "EXPIRED"

    # Authenticated get also reports EXPIRED
    auth_resp = client.get(f"/api/v1/certificates/{cert_id}", headers=owner_headers)
    assert auth_resp.status_code == 200
    assert auth_resp.json()["status"] == "EXPIRED"


def test_certificate_rbac_and_isolation(
    client: TestClient,
    owner_headers: dict,
    other_owner_headers: dict,
    lmo_headers: dict,
    gatc_headers: dict,
    gatc_user: User,
) -> None:
    """Tests 18, 19, 20: Owner retrieval, cross-owner isolation, and role authorization for issuance."""
    app_id = _setup_verified_application(client, owner_headers, lmo_headers, gatc_headers, gatc_user)

    # 20. Instrument Owner cannot issue certificate
    owner_issue_resp = client.post(f"/api/v1/applications/{app_id}/certificate", headers=owner_headers)
    assert owner_issue_resp.status_code == 403

    # 20. GATC cannot issue certificate
    gatc_issue_resp = client.post(f"/api/v1/applications/{app_id}/certificate", headers=gatc_headers)
    assert gatc_issue_resp.status_code == 403

    # Issue certificate as LMO
    issue_resp = client.post(f"/api/v1/applications/{app_id}/certificate", headers=lmo_headers)
    cert_id = issue_resp.json()["id"]

    # 18. Instrument Owner can retrieve own certificate
    owner_get_resp = client.get(f"/api/v1/certificates/{cert_id}", headers=owner_headers)
    assert owner_get_resp.status_code == 200
    assert owner_get_resp.json()["id"] == cert_id

    # 18b. Owner can get certificate via application endpoint
    app_cert_resp = client.get(f"/api/v1/applications/{app_id}/certificate", headers=owner_headers)
    assert app_cert_resp.status_code == 200
    assert app_cert_resp.json()["id"] == cert_id

    # 19. Unauthorized user (other owner) cannot retrieve another owner's certificate
    forbidden_resp = client.get(f"/api/v1/certificates/{cert_id}", headers=other_owner_headers)
    assert forbidden_resp.status_code == 403

    # 19b. Other owner cannot download another owner's certificate
    forbidden_dl = client.get(f"/api/v1/certificates/{cert_id}/download", headers=other_owner_headers)
    assert forbidden_dl.status_code == 403
