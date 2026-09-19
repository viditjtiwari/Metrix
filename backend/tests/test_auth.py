from fastapi.testclient import TestClient
from app.core.security import get_password_hash, verify_password


def test_password_hashing_and_verification() -> None:
    """Verify that password hashing produces valid salted hashes and verifies correctly."""
    raw_pass = "SuperSecurePass123!"
    hashed = get_password_hash(raw_pass)

    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_user_registration_success(client: TestClient) -> None:
    """Verify successful user registration without profile."""
    payload = {
        "email": "newuser@example.com",
        "password": "Password123!",
        "full_name": "Test User",
        "role": "INSTRUMENT_OWNER",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "Test User"
    assert data["role"] == "INSTRUMENT_OWNER"
    assert "hashed_password" not in data
    assert "id" in data


def test_user_registration_with_profile(client: TestClient) -> None:
    """Verify successful user registration including stakeholder profile."""
    payload = {
        "email": "business.owner@example.com",
        "password": "Password123!",
        "full_name": "Anita Roy",
        "role": "INSTRUMENT_OWNER",
        "profile": {
            "business_name": "Roy Scales Trading",
            "trade_license_number": "TL-2026-9988",
            "contact_phone": "+919876543210",
            "address_line": "Shop 4, Market Complex",
            "city": "Bhopal",
            "state": "Madhya Pradesh",
            "pincode": "462001",
        },
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["profile"] is not None
    assert data["profile"]["business_name"] == "Roy Scales Trading"
    assert data["profile"]["city"] == "Bhopal"


def test_duplicate_registration_rejection(client: TestClient) -> None:
    """Verify that registering an existing email returns 409 Conflict."""
    payload = {
        "email": "duplicate@example.com",
        "password": "Password123!",
        "full_name": "First Registrant",
        "role": "INSTRUMENT_OWNER",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already registered" in res2.json()["detail"].lower()


def test_login_success(client: TestClient) -> None:
    """Verify login with correct credentials yields a valid Bearer JWT."""
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login.user@example.com",
            "password": "CorrectPassword123!",
            "full_name": "Login User",
            "role": "INSTRUMENT_OWNER",
        },
    )

    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login.user@example.com", "password": "CorrectPassword123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login.user@example.com"


def test_login_invalid_password(client: TestClient) -> None:
    """Verify login fails with 401 when given an incorrect password."""
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "badpass@example.com",
            "password": "CorrectPassword123!",
            "full_name": "User",
            "role": "INSTRUMENT_OWNER",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "badpass@example.com", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    assert "incorrect email or password" in response.json()["detail"].lower()


def test_get_current_user_me(client: TestClient, owner_headers: dict) -> None:
    """Verify GET /api/v1/auth/me with valid Bearer token."""
    response = client.get("/api/v1/auth/me", headers=owner_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "owner@example.com"
    assert data["role"] == "INSTRUMENT_OWNER"
    assert "hashed_password" not in data


def test_get_current_user_me_unauthorized(client: TestClient) -> None:
    """Verify GET /api/v1/auth/me without token returns 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
