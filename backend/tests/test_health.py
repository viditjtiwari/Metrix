from fastapi.testclient import TestClient


def test_health_check_endpoint(client: TestClient) -> None:
    """Verify that GET /api/v1/health returns 200 and a valid schema."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert "status" in data
    assert data["status"] in ["ok", "degraded"]
    assert "environment" in data
    assert "version" in data
    assert "database" in data
    assert data["version"] == "0.1.0"
