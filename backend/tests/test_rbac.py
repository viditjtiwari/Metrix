from fastapi.testclient import TestClient


def test_instrument_owner_can_register_instrument(
    client: TestClient, owner_headers: dict
) -> None:
    """Verify that an INSTRUMENT_OWNER can register instruments."""
    payload = {
        "instrument_type": "WEIGHING_SCALE",
        "manufacturer": "Essae-Teraoka",
        "model_name": "DS-215",
        "serial_number": "SN-998811",
        "capacity": "30 kg",
        "location": "Counter 1, Main Store, Connaught Place",
    }
    response = client.post("/api/v1/instruments", json=payload, headers=owner_headers)
    assert response.status_code == 201
    assert response.json()["manufacturer"] == "Essae-Teraoka"


def test_unauthenticated_user_cannot_register_instrument(
    client: TestClient,
) -> None:
    """Verify that an unauthenticated user is rejected with 401."""
    payload = {
        "instrument_type": "WEIGHING_SCALE",
        "manufacturer": "Essae-Teraoka",
        "model_name": "DS-215",
        "serial_number": "SN-998811",
        "location": "Warehouse",
    }
    response = client.post("/api/v1/instruments", json=payload)
    assert response.status_code == 401


def test_instrument_owner_cannot_review_applications(
    client: TestClient, owner_headers: dict
) -> None:
    """Verify that INSTRUMENT_OWNER role cannot perform officer review actions (403)."""
    # Create instrument & application
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "WEIGHING_SCALE",
            "manufacturer": "Test",
            "model_name": "M1",
            "serial_number": "SN-001",
            "location": "Loc",
        },
        headers=owner_headers,
    )
    inst_id = inst_resp.json()["id"]

    app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": True},
        headers=owner_headers,
    )
    app_id = app_resp.json()["id"]

    # Owner attempts to mark UNDER_REVIEW (officer action)
    patch_resp = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW", "remarks": "Trying to self-review"},
        headers=owner_headers,
    )
    assert patch_resp.status_code == 403
    assert "officers" in patch_resp.json()["detail"].lower()


def test_lmo_can_review_applications(
    client: TestClient, owner_headers: dict, lmo_headers: dict
) -> None:
    """Verify that an LMO can transition a SUBMITTED application to UNDER_REVIEW."""
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "ELECTRONIC_BALANCE",
            "manufacturer": "Shimadzu",
            "model_name": "ATX224",
            "serial_number": "SN-7788",
            "location": "Lab 1",
        },
        headers=owner_headers,
    )
    inst_id = inst_resp.json()["id"]

    app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": True},
        headers=owner_headers,
    )
    app_id = app_resp.json()["id"]

    # LMO performs transition to UNDER_REVIEW
    patch_resp = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW", "remarks": "Reviewing documentation"},
        headers=lmo_headers,
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "UNDER_REVIEW"
