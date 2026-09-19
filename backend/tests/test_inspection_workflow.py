from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.models.user import User


def _setup_submitted_application(client: TestClient, owner_headers: dict) -> int:
    """Helper to create an instrument and submitted application."""
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "ELECTRONIC_BALANCE",
            "manufacturer": "Sartorius",
            "model_name": "Secura 225D",
            "serial_number": "SN-SART-8821",
            "capacity": "220 g",
            "location": "Quality Lab 1, TechPark",
        },
        headers=owner_headers,
    )
    inst_id = inst_resp.json()["id"]

    app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": True, "remarks": "Ready for initial verification"},
        headers=owner_headers,
    )
    return app_resp.json()["id"]


def test_application_review_flow_and_rbac(
    client: TestClient, owner_headers: dict, lmo_headers: dict
) -> None:
    """Verify application review from SUBMITTED to UNDER_REVIEW and RBAC enforcement."""
    app_id = _setup_submitted_application(client, owner_headers)

    # 1. Instrument Owner cannot transition to UNDER_REVIEW
    owner_review_resp = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW"},
        headers=owner_headers,
    )
    assert owner_review_resp.status_code == 403

    # 2. LMO can review application
    lmo_review_resp = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW", "remarks": "Documentation verified"},
        headers=lmo_headers,
    )
    assert lmo_review_resp.status_code == 200
    assert lmo_review_resp.json()["status"] == "UNDER_REVIEW"


def test_scheduling_flow_and_authorization(
    client: TestClient, owner_headers: dict, lmo_headers: dict, lmo_user: User
) -> None:
    """Verify scheduling rules, role enforcement, and status transition to SCHEDULED."""
    app_id = _setup_submitted_application(client, owner_headers)

    sched_date = (date.today() + timedelta(days=3)).isoformat()
    sched_payload = {
        "scheduled_date": sched_date,
        "scheduled_time": "10:30 AM",
        "inspection_location": "Quality Lab 1, TechPark",
        "scheduling_remarks": "Bring calibrated reference weights",
        "assigned_to_id": lmo_user.id,
    }

    # 1. Owner cannot schedule
    owner_sched_resp = client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json=sched_payload,
        headers=owner_headers,
    )
    assert owner_sched_resp.status_code == 403

    # 2. Scheduling while still SUBMITTED (not UNDER_REVIEW) fails
    premature_resp = client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json=sched_payload,
        headers=lmo_headers,
    )
    assert premature_resp.status_code == 400
    assert "UNDER_REVIEW" in premature_resp.json()["detail"]

    # 3. Move to UNDER_REVIEW, then schedule
    client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW"},
        headers=lmo_headers,
    )
    sched_resp = client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json=sched_payload,
        headers=lmo_headers,
    )
    assert sched_resp.status_code == 200
    data = sched_resp.json()
    assert data["scheduled_date"] == sched_date
    assert data["scheduled_time"] == "10:30 AM"
    assert data["assigned_to_id"] == lmo_user.id

    # Verify application status advanced to SCHEDULED
    app_resp = client.get(f"/api/v1/applications/{app_id}", headers=owner_headers)
    assert app_resp.json()["status"] == "SCHEDULED"


def test_assignment_flow_and_validation(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    owner_user: User,
    gatc_user: User,
) -> None:
    """Verify verifier assignment accepts only LMO/GATC and blocks non-officers."""
    app_id = _setup_submitted_application(client, owner_headers)

    # Move to UNDER_REVIEW
    client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW"},
        headers=lmo_headers,
    )

    # 1. Owner cannot assign
    owner_assign_resp = client.patch(
        f"/api/v1/applications/{app_id}/assignment",
        json={"assigned_to_id": gatc_user.id},
        headers=owner_headers,
    )
    assert owner_assign_resp.status_code == 403

    # 2. Cannot assign an INSTRUMENT_OWNER as a verifier
    invalid_role_resp = client.patch(
        f"/api/v1/applications/{app_id}/assignment",
        json={"assigned_to_id": owner_user.id},
        headers=lmo_headers,
    )
    assert invalid_role_resp.status_code == 400
    assert "LMO or GATC" in invalid_role_resp.json()["detail"]

    # 3. Authorized LMO assigns GATC test centre
    valid_assign_resp = client.patch(
        f"/api/v1/applications/{app_id}/assignment",
        json={"assigned_to_id": gatc_user.id},
        headers=lmo_headers,
    )
    assert valid_assign_resp.status_code == 200
    assert valid_assign_resp.json()["assigned_to_id"] == gatc_user.id
    assert valid_assign_resp.json()["assigned_to_role"] == "GATC"


def test_inspection_execution_observations_and_verification_result(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    gatc_headers: dict,
    gatc_user: User,
) -> None:
    """Verify complete inspection execution: start, observations recording, and VERIFIED result."""
    app_id = _setup_submitted_application(client, owner_headers)

    # Review and schedule with GATC assignment
    client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW"},
        headers=lmo_headers,
    )
    sched_date = date.today().isoformat()
    client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json={
            "scheduled_date": sched_date,
            "scheduled_time": "11:00 AM",
            "inspection_location": "GATC Calibration Bay 2",
            "assigned_to_id": gatc_user.id,
        },
        headers=lmo_headers,
    )

    # 1. Start Inspection (GATC verifier)
    start_resp = client.post(
        f"/api/v1/applications/{app_id}/inspection",
        headers=gatc_headers,
    )
    assert start_resp.status_code == 200
    insp_data = start_resp.json()
    insp_id = insp_data["id"]
    assert insp_data["started_at"] is not None

    # Application status is now INSPECTION_IN_PROGRESS
    app_resp = client.get(f"/api/v1/applications/{app_id}", headers=owner_headers)
    assert app_resp.json()["status"] == "INSPECTION_IN_PROGRESS"

    # 2. Record Observations
    obs1_resp = client.post(
        f"/api/v1/inspections/{insp_id}/observations",
        json={
            "parameter_name": "Zero Load Test",
            "observed_value": "0.000",
            "standard_value": "0.000",
            "unit": "g",
            "is_passed": True,
            "remarks": "Zero return within tolerance",
        },
        headers=gatc_headers,
    )
    assert obs1_resp.status_code == 201

    obs2_resp = client.post(
        f"/api/v1/inspections/{insp_id}/observations",
        json={
            "parameter_name": "Maximum Capacity Repeatability",
            "observed_value": "200.002",
            "standard_value": "200.000",
            "unit": "g",
            "is_passed": True,
            "remarks": "Span error +/- 0.002g permissible under Class II",
        },
        headers=gatc_headers,
    )
    assert obs2_resp.status_code == 201

    # 3. Retrieve Observations
    obs_list_resp = client.get(
        f"/api/v1/inspections/{insp_id}/observations",
        headers=owner_headers,
    )
    assert obs_list_resp.status_code == 200
    obs_list = obs_list_resp.json()
    assert len(obs_list) == 2
    assert obs_list[0]["parameter_name"] == "Zero Load Test"

    # 4. Finalize Inspection with VERIFIED result
    result_resp = client.patch(
        f"/api/v1/inspections/{insp_id}/result",
        json={"result": "VERIFIED", "remarks": "Meets all Class II metrological tolerances"},
        headers=gatc_headers,
    )
    assert result_resp.status_code == 200
    final_insp = result_resp.json()
    assert final_insp["result"] == "VERIFIED"
    assert final_insp["completed_at"] is not None

    # 5. Verify application final status & audit history
    app_final = client.get(f"/api/v1/applications/{app_id}", headers=owner_headers).json()
    assert app_final["status"] == "VERIFIED"

    history = app_final["status_history"]
    to_statuses = [h["to_status"] for h in history]
    assert "SUBMITTED" in to_statuses
    assert "UNDER_REVIEW" in to_statuses
    assert "SCHEDULED" in to_statuses
    assert "INSPECTION_IN_PROGRESS" in to_statuses
    assert "INSPECTION_COMPLETED" in to_statuses
    assert "VERIFIED" in to_statuses


def test_inspection_result_rejected(
    client: TestClient,
    owner_headers: dict,
    lmo_headers: dict,
    lmo_user: User,
) -> None:
    """Verify inspection resulting in REJECTED due to failed observations."""
    app_id = _setup_submitted_application(client, owner_headers)

    client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW"},
        headers=lmo_headers,
    )
    client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json={
            "scheduled_date": date.today().isoformat(),
            "assigned_to_id": lmo_user.id,
        },
        headers=lmo_headers,
    )
    start_resp = client.post(
        f"/api/v1/applications/{app_id}/inspection",
        headers=lmo_headers,
    )
    insp_id = start_resp.json()["id"]

    # Record failed observation
    client.post(
        f"/api/v1/inspections/{insp_id}/observations",
        json={
            "parameter_name": "Corner Load Error",
            "observed_value": "+0.150",
            "standard_value": "<= 0.020",
            "unit": "g",
            "is_passed": False,
            "remarks": "Eccentricity error exceeds allowable maximum permissible error",
        },
        headers=lmo_headers,
    )

    # Submit REJECTED outcome
    result_resp = client.patch(
        f"/api/v1/inspections/{insp_id}/result",
        json={"result": "REJECTED", "remarks": "Failed eccentricity tolerance"},
        headers=lmo_headers,
    )
    assert result_resp.status_code == 200
    assert result_resp.json()["result"] == "REJECTED"

    app_final = client.get(f"/api/v1/applications/{app_id}", headers=owner_headers).json()
    assert app_final["status"] == "REJECTED"


def test_ownership_isolation_on_inspection(
    client: TestClient,
    owner_headers: dict,
    other_owner_headers: dict,
    lmo_headers: dict,
    lmo_user: User,
) -> None:
    """Verify that User A cannot view or manipulate User B's inspection."""
    app_id = _setup_submitted_application(client, owner_headers)

    client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW"},
        headers=lmo_headers,
    )
    client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json={
            "scheduled_date": date.today().isoformat(),
            "assigned_to_id": lmo_user.id,
        },
        headers=lmo_headers,
    )

    # User B attempts to access User A's inspection details -> 403
    forbidden_resp = client.get(
        f"/api/v1/applications/{app_id}/inspection",
        headers=other_owner_headers,
    )
    assert forbidden_resp.status_code == 403
