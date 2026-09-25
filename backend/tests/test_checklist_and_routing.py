"""Tests for GATC auto-routing, government checklist, and report PDF downloads."""
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.enums import InstrumentType
from app.models.user import User


def _create_and_review_app(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    instrument_type: str = "PLATFORM_SCALE",
) -> int:
    """Helper to register instrument, submit application, and move to UNDER_REVIEW."""
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": instrument_type,
            "manufacturer": "Avery Weigh-Tronix",
            "model_name": "ZK830",
            "serial_number": f"SN-{instrument_type[:4]}-001",
            "capacity": "150kg",
            "division": "10g",
            "location": "Warehouse Sector 4",
        },
        headers=owner_headers,
    )
    assert inst_resp.status_code == 201
    inst_id = inst_resp.json()["id"]

    app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": True, "verification_type": "INITIAL"},
        headers=owner_headers,
    )
    assert app_resp.status_code == 201
    app_id = app_resp.json()["id"]

    rev_resp = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW", "remarks": "Documents in order"},
        headers=lmo_headers,
    )
    assert rev_resp.status_code == 200
    return app_id


def test_gatc_auto_routing_and_inspection_mode(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    gatc_user: User,
    lmo_user: User,
) -> None:
    """Verify auto-routing assigns GATC for Schedule I/II instruments and LMO for field instruments."""
    # 1. GATC instrument: ANALYTICAL_BALANCE
    gatc_app_id = _create_and_review_app(
        client, owner_headers, lmo_headers, instrument_type="ANALYTICAL_BALANCE"
    )
    sch_gatc = client.patch(
        f"/api/v1/applications/{gatc_app_id}/schedule",
        json={"scheduled_date": date.today().isoformat()},
        headers=lmo_headers,
    )
    assert sch_gatc.status_code == 200
    data_gatc = sch_gatc.json()
    assert data_gatc["assigned_to_id"] == gatc_user.id
    assert data_gatc["inspection_mode"] == "GATC_LAB"

    # 2. Standard field instrument: PLATFORM_SCALE
    lmo_app_id = _create_and_review_app(
        client, owner_headers, lmo_headers, instrument_type="PLATFORM_SCALE"
    )
    sch_lmo = client.patch(
        f"/api/v1/applications/{lmo_app_id}/schedule",
        json={"scheduled_date": date.today().isoformat()},
        headers=lmo_headers,
    )
    assert sch_lmo.status_code == 200
    data_lmo = sch_lmo.json()
    assert data_lmo["assigned_to_id"] == lmo_user.id
    assert data_lmo["inspection_mode"] == "LMO_FIELD"


def test_inspection_checklist_submission_and_report_download(
    client: TestClient,
    owner_headers: dict,
    other_owner_headers: dict,
    lmo_headers: dict,
    admin_headers: dict,
    lmo_user: User,
) -> None:
    """Verify submitting structured checklist, calculating stamp quarter, and downloading PDF."""
    app_id = _create_and_review_app(
        client, owner_headers, lmo_headers, instrument_type="PLATFORM_SCALE"
    )

    # Schedule with assigned LMO
    client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json={
            "scheduled_date": date.today().isoformat(),
            "assigned_to_id": lmo_user.id,
        },
        headers=lmo_headers,
    )

    # Start inspection
    start_resp = client.post(f"/api/v1/applications/{app_id}/inspection", headers=lmo_headers)
    assert start_resp.status_code == 200
    insp_id = start_resp.json()["id"]

    # Submit structured checklist
    checklist_payload = {
        "physical_inspection": {
            "seal_intact": True,
            "display_readable": True,
            "leveling_ok": True,
            "power_stable": True,
            "overall_condition": "GOOD",
            "remarks": "Clean and well maintained",
        },
        "metrological_tests": {
            "zero_error_observed": "0.0g",
            "zero_error_passed": True,
            "span_tests": [
                {
                    "load_percentage": 50,
                    "standard_value": "50kg",
                    "observed_value": "50.01kg",
                    "error": "0.01kg",
                    "is_passed": True,
                },
                {
                    "load_percentage": 100,
                    "standard_value": "100kg",
                    "observed_value": "100.02kg",
                    "error": "0.02kg",
                    "is_passed": True,
                },
            ],
            "repeatability_passed": True,
            "eccentricity_passed": True,
            "discrimination_passed": True,
        },
        "observations": [
            {
                "parameter_name": "Zero Error",
                "observed_value": "0.0",
                "standard_value": "0.0",
                "unit": "kg",
                "is_passed": True,
            }
        ],
        "seal_number": "SL-DEL-2026-0042",
        "result": "VERIFIED",
        "result_remarks": "Meets all legal metrology standards Schedule VII",
    }

    chk_resp = client.post(
        f"/api/v1/inspections/{insp_id}/checklist",
        json=checklist_payload,
        headers=lmo_headers,
    )
    assert chk_resp.status_code == 200
    chk_data = chk_resp.json()
    assert chk_data["result"] == "VERIFIED"
    assert chk_data["seal_number"] == "SL-DEL-2026-0042"
    assert chk_data["stamp_quarter"] is not None
    assert chk_data["stamp_quarter"].startswith("Q")

    # Application should now be VERIFIED
    app_get = client.get(f"/api/v1/applications/{app_id}", headers=owner_headers)
    assert app_get.json()["status"] == "VERIFIED"

    # Download report as Admin (should succeed)
    admin_dl = client.get(
        f"/api/v1/inspections/{insp_id}/report/download", headers=admin_headers
    )
    assert admin_dl.status_code == 200
    assert admin_dl.headers["content-type"] == "application/pdf"
    assert admin_dl.content.startswith(b"%PDF")

    # Download report as conducting LMO (should succeed)
    lmo_dl = client.get(
        f"/api/v1/inspections/{insp_id}/report/download", headers=lmo_headers
    )
    assert lmo_dl.status_code == 200
    assert lmo_dl.content.startswith(b"%PDF")

    # Download report as instrument owner (should succeed)
    owner_dl = client.get(
        f"/api/v1/inspections/{insp_id}/report/download", headers=owner_headers
    )
    assert owner_dl.status_code == 200
    assert owner_dl.content.startswith(b"%PDF")

    # Download report as unrelated owner (should return 403)
    unrelated_dl = client.get(
        f"/api/v1/inspections/{insp_id}/report/download", headers=other_owner_headers
    )
    assert unrelated_dl.status_code == 403


def test_dynamic_validity_rule_13(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    lmo_user: User,
) -> None:
    """Verify Rule 13 dynamic validity periods: 24 months for storage/tank instruments."""
    app_id = _create_and_review_app(
        client, owner_headers, lmo_headers, instrument_type="TANK_LORRY"
    )
    client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json={"scheduled_date": date.today().isoformat(), "assigned_to_id": lmo_user.id},
        headers=lmo_headers,
    )
    start_resp = client.post(f"/api/v1/applications/{app_id}/inspection", headers=lmo_headers)
    assert start_resp.status_code == 200
    insp_id = start_resp.json()["id"]

    client.patch(
        f"/api/v1/inspections/{insp_id}/result",
        json={"result": "VERIFIED", "remarks": "Tank lorry capacity certified"},
        headers=lmo_headers,
    )

    cert_resp = client.post(
        f"/api/v1/applications/{app_id}/certificate",
        headers=lmo_headers,
    )
    assert cert_resp.status_code == 201
    cert_data = cert_resp.json()

    valid_from = date.fromisoformat(cert_data["valid_from"])
    valid_until = date.fromisoformat(cert_data["valid_until"])

    # Difference in days should be roughly 2 years (approx 730 days)
    diff_days = (valid_until - valid_from).days
    assert 720 <= diff_days <= 735
