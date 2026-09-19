from fastapi.testclient import TestClient


def test_instrument_creation_and_ownership(
    client: TestClient, owner_headers: dict, other_owner_headers: dict
) -> None:
    """Verify instrument registration, registration number format, and ownership isolation."""
    inst_payload = {
        "instrument_type": "PETROL_DISPENSER",
        "manufacturer": "Tokheim",
        "model_name": "Quantium 510",
        "serial_number": "SN-PETROL-101",
        "capacity": "50 LPM",
        "location": "Dispenser 2, Shell Fuel Station, Ring Road",
    }
    create_resp = client.post("/api/v1/instruments", json=inst_payload, headers=owner_headers)
    assert create_resp.status_code == 201
    inst_data = create_resp.json()
    assert inst_data["registration_number"].startswith("INST-")
    inst_id = inst_data["id"]

    # Owner can access instrument
    get_resp = client.get(f"/api/v1/instruments/{inst_id}", headers=owner_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == inst_id

    # Another owner CANNOT access this instrument (ownership boundary)
    forbidden_resp = client.get(f"/api/v1/instruments/{inst_id}", headers=other_owner_headers)
    assert forbidden_resp.status_code == 403


def test_application_creation_and_ownership_check(
    client: TestClient, owner_headers: dict, other_owner_headers: dict
) -> None:
    """Verify that only the owner of an instrument can apply for verification."""
    # Owner registers an instrument
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "WEIGHING_SCALE",
            "manufacturer": "Mettler Toledo",
            "model_name": "BBA231",
            "serial_number": "MT-12345",
            "location": "Terminal A",
        },
        headers=owner_headers,
    )
    inst_id = inst_resp.json()["id"]

    # Other owner tries to apply for this instrument -> 403
    other_app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": False},
        headers=other_owner_headers,
    )
    assert other_app_resp.status_code == 403
    assert "instruments you own" in other_app_resp.json()["detail"].lower()

    # Legitimate owner applies -> 201
    valid_app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": False, "remarks": "Draft application"},
        headers=owner_headers,
    )
    assert valid_app_resp.status_code == 201
    app_data = valid_app_resp.json()
    assert app_data["status"] == "DRAFT"
    assert app_data["application_number"].startswith("APP-")


def test_valid_status_transitions_and_history(
    client: TestClient, owner_headers: dict, lmo_headers: dict
) -> None:
    """Verify full valid lifecycle flow: DRAFT -> SUBMITTED -> UNDER_REVIEW -> REJECTED."""
    # 1. Register Instrument
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "FLOW_METER",
            "manufacturer": "KROHNE",
            "model_name": "OPTIMASS",
            "serial_number": "KM-9900",
            "location": "Pipeline 3",
        },
        headers=owner_headers,
    )
    inst_id = inst_resp.json()["id"]

    # 2. Create Application as DRAFT
    app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": False},
        headers=owner_headers,
    )
    app_id = app_resp.json()["id"]
    assert app_resp.json()["status"] == "DRAFT"

    # 3. Applicant transitions DRAFT -> SUBMITTED
    submit_resp = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "SUBMITTED", "remarks": "Submitting all required certificates"},
        headers=owner_headers,
    )
    assert submit_resp.status_code == 200
    assert submit_resp.json()["status"] == "SUBMITTED"
    assert submit_resp.json()["submitted_at"] is not None

    # 4. LMO transitions SUBMITTED -> UNDER_REVIEW
    review_resp = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW", "remarks": "Reviewing metrological specs"},
        headers=lmo_headers,
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["status"] == "UNDER_REVIEW"

    # 5. LMO rejects application: UNDER_REVIEW -> REJECTED
    reject_resp = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "REJECTED", "remarks": "Serial number plate illegible during pre-check"},
        headers=lmo_headers,
    )
    assert reject_resp.status_code == 200
    assert reject_resp.json()["status"] == "REJECTED"

    # 6. Verify audit history logs every transition
    detail_resp = client.get(f"/api/v1/applications/{app_id}", headers=owner_headers)
    assert detail_resp.status_code == 200
    history = detail_resp.json()["status_history"]
    # Created (DRAFT), SUBMITTED, UNDER_REVIEW, REJECTED = 4 entries
    assert len(history) == 4
    assert history[0]["to_status"] == "DRAFT"
    assert history[1]["from_status"] == "DRAFT" and history[1]["to_status"] == "SUBMITTED"
    assert history[2]["from_status"] == "SUBMITTED" and history[2]["to_status"] == "UNDER_REVIEW"
    assert history[3]["from_status"] == "UNDER_REVIEW" and history[3]["to_status"] == "REJECTED"


def test_invalid_status_transition_rejected(
    client: TestClient, owner_headers: dict, lmo_headers: dict
) -> None:
    """Verify that an illegal state transition is rejected with 400 Bad Request."""
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "LENGTH_MEASURE",
            "manufacturer": "Stanley",
            "model_name": "PowerLock 5m",
            "serial_number": "ST-500",
            "location": "Retail counter",
        },
        headers=owner_headers,
    )
    inst_id = inst_resp.json()["id"]

    app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": False},
        headers=owner_headers,
    )
    app_id = app_resp.json()["id"]

    # Attempt illegal leap: DRAFT -> VERIFIED
    invalid_resp = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "VERIFIED", "remarks": "Skipping review and inspection"},
        headers=lmo_headers,
    )
    assert invalid_resp.status_code == 400
    assert "illegal state transition" in invalid_resp.json()["detail"].lower()
