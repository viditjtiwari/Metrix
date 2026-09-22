import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.enums import ApplicationStatus, InstrumentType, UserRole
from app.models.user import User


def test_admin_user_management(client: TestClient, admin_user: User, admin_headers: dict, owner_user: User):
    """Verify admin user listing, status toggle, and user provisioning."""
    # List users
    res = client.get("/api/v1/admin/users", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 2
    assert any(u["id"] == owner_user.id for u in data["items"])

    # Non-admin cannot access
    non_admin_res = client.get("/api/v1/admin/users")
    assert non_admin_res.status_code == 401

    # Get single user
    user_res = client.get(f"/api/v1/admin/users/{owner_user.id}", headers=admin_headers)
    assert user_res.status_code == 200
    assert user_res.json()["email"] == owner_user.email

    # Toggle status (deactivate owner)
    status_res = client.patch(
        f"/api/v1/admin/users/{owner_user.id}/status",
        json={"is_active": False},
        headers=admin_headers,
    )
    assert status_res.status_code == 200
    assert status_res.json()["is_active"] is False

    # Admin cannot deactivate self
    self_res = client.patch(
        f"/api/v1/admin/users/{admin_user.id}/status",
        json={"is_active": False},
        headers=admin_headers,
    )
    assert self_res.status_code == 400

    # Create official user (LMO)
    create_res = client.post(
        "/api/v1/admin/users",
        json={
            "email": "officer.new@example.com",
            "password": "TemporaryPassword123!",
            "full_name": "Officer New",
            "role": "LMO",
        },
        headers=admin_headers,
    )
    assert create_res.status_code == 201
    assert create_res.json()["email"] == "officer.new@example.com"
    assert create_res.json()["role"] == "LMO"


def test_instrument_update_and_deactivate(client: TestClient, owner_headers: dict, other_owner_headers: dict):
    """Verify instrument update, deactivation, and ownership enforcement."""
    # Create instrument
    create_res = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "WEIGHING_SCALE",
            "manufacturer": "Avery Weigh-Tronix",
            "model_name": "ZK830",
            "serial_number": "SN-TEST-001",
            "capacity": "50kg",
            "location": "Warehouse Bay A",
        },
        headers=owner_headers,
    )
    assert create_res.status_code == 201
    inst_id = create_res.json()["id"]

    # Update instrument location and capacity
    update_res = client.patch(
        f"/api/v1/instruments/{inst_id}",
        json={"location": "Warehouse Bay B", "capacity": "60kg"},
        headers=owner_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["location"] == "Warehouse Bay B"
    assert update_res.json()["capacity"] == "60kg"

    # Other owner cannot update
    forbidden_res = client.patch(
        f"/api/v1/instruments/{inst_id}",
        json={"location": "Hacked Location"},
        headers=other_owner_headers,
    )
    assert forbidden_res.status_code == 403

    # Deactivate instrument
    deact_res = client.patch(
        f"/api/v1/instruments/{inst_id}/deactivate",
        headers=owner_headers,
    )
    assert deact_res.status_code == 200
    assert deact_res.json()["is_active"] is False


def test_application_deletion_draft_only(client: TestClient, owner_headers: dict, other_owner_headers: dict):
    """Verify draft application deletion and rejection of non-draft deletion."""
    # Create instrument
    inst_res = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "ELECTRONIC_BALANCE",
            "manufacturer": "Mettler Toledo",
            "model_name": "MS-TS",
            "serial_number": "MT-DEL-01",
            "location": "Lab 1",
        },
        headers=owner_headers,
    )
    inst_id = inst_res.json()["id"]

    # Create draft application (submit_now=False)
    draft_res = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "application_type": "INITIAL", "submit_now": False},
        headers=owner_headers,
    )
    assert draft_res.status_code == 201
    app_id = draft_res.json()["id"]
    assert draft_res.json()["status"] == "DRAFT"

    # Other owner cannot delete
    other_del = client.delete(f"/api/v1/applications/{app_id}", headers=other_owner_headers)
    assert other_del.status_code == 403

    # Owner can delete draft
    del_res = client.delete(f"/api/v1/applications/{app_id}", headers=owner_headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Create submitted application (submit_now=True)
    sub_res = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "application_type": "INITIAL", "submit_now": True},
        headers=owner_headers,
    )
    sub_app_id = sub_res.json()["id"]
    assert sub_res.json()["status"] == "SUBMITTED"

    # Deleting submitted application fails
    fail_del = client.delete(f"/api/v1/applications/{sub_app_id}", headers=owner_headers)
    assert fail_del.status_code == 400


def test_inspections_listing_endpoint(client: TestClient, lmo_headers: dict, admin_headers: dict):
    """Verify inspections listing endpoint with role-based access."""
    res = client.get("/api/v1/inspections", headers=lmo_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data

    admin_res = client.get("/api/v1/inspections", headers=admin_headers)
    assert admin_res.status_code == 200


def test_profile_update_and_password_change(client: TestClient, owner_headers: dict, owner_user: User):
    """Verify updating profile contact details and changing password."""
    # Update profile
    update_res = client.patch(
        "/api/v1/auth/me",
        json={
            "full_name": "Rajesh Kumar Verma",
            "business_name": "Verma Weighing Solutions Pvt Ltd",
            "contact_phone": "9876543210",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "address_line": "123 Industrial Area",
        },
        headers=owner_headers,
    )
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["full_name"] == "Rajesh Kumar Verma"
    assert data["profile"]["business_name"] == "Verma Weighing Solutions Pvt Ltd"
    assert data["profile"]["city"] == "Mumbai"

    # Wrong current password fails
    wrong_pass = client.patch(
        "/api/v1/auth/me/password",
        json={"current_password": "WrongPassword123!", "new_password": "NewSecretPass456!"},
        headers=owner_headers,
    )
    assert wrong_pass.status_code == 400

    # Correct password change
    change_res = client.patch(
        "/api/v1/auth/me/password",
        json={"current_password": "SecretPassword123!", "new_password": "NewSecretPass456!"},
        headers=owner_headers,
    )
    assert change_res.status_code == 200

    # Login with new password succeeds
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": owner_user.email, "password": "NewSecretPass456!"},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
