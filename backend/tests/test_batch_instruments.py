import io
import pytest
from fastapi.testclient import TestClient


def test_download_csv_template(client: TestClient) -> None:
    """Test downloading sample CSV template."""
    resp = client.get("/api/v1/instruments/csv-template")
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    assert "instrument_type,manufacturer,model_name" in resp.text
    assert "WEIGHING_SCALE" in resp.text


def test_batch_upload_instruments_success(
    client: TestClient, owner_headers: dict
) -> None:
    """Test successful batch upload of valid instruments via CSV."""
    csv_content = (
        "instrument_type,manufacturer,model_name,serial_number,capacity,min_capacity,max_capacity,capacity_unit,location\n"
        "WEIGHING_SCALE,Essae,DS-852,SN-BATCH-001,50 kg,0.5 kg,50 kg,kg,Retail Mart Counter 1\n"
        "ELECTRONIC_BALANCE,Shimadzu,ATX224,SN-BATCH-002,220 g,0.1 mg,220 g,g,Testing Room 3\n"
    )
    files = {"file": ("test_batch.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    resp = client.post(
        "/api/v1/instruments/batch-upload",
        files=files,
        headers=owner_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["total_processed"] == 2
    assert data["successful_count"] == 2
    assert data["failed_count"] == 0
    assert len(data["created_instruments"]) == 2
    assert len(data["errors"]) == 0

    serials = [i["serial_number"] for i in data["created_instruments"]]
    assert "SN-BATCH-001" in serials
    assert "SN-BATCH-002" in serials


def test_batch_upload_handles_row_errors(
    client: TestClient, owner_headers: dict
) -> None:
    """Test batch upload handles missing fields and invalid types gracefully without crashing."""
    csv_content = (
        "instrument_type,manufacturer,model_name,serial_number,capacity,min_capacity,max_capacity,capacity_unit,location\n"
        "WEIGHING_SCALE,Essae,DS-852,SN-BATCH-VALID-1,50 kg,,,kg,Counter 1\n"
        "INVALID_TYPE,Maker,Model,SN-BATCH-ERR-1,10 kg,,,kg,Location 2\n"
        "WEIGHING_SCALE,Maker,Model,,10 kg,,,kg,Location 3\n"
    )
    files = {"file": ("test_errors.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    resp = client.post(
        "/api/v1/instruments/batch-upload",
        files=files,
        headers=owner_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["total_processed"] == 3
    assert data["successful_count"] == 1
    assert data["failed_count"] == 2
    assert len(data["errors"]) == 2


def test_batch_upload_rejects_missing_columns(
    client: TestClient, owner_headers: dict
) -> None:
    """Test batch upload rejects CSV missing mandatory columns."""
    csv_content = "wrong_header_one,wrong_header_two\nval1,val2\n"
    files = {"file": ("bad_headers.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    resp = client.post(
        "/api/v1/instruments/batch-upload",
        files=files,
        headers=owner_headers,
    )
    assert resp.status_code == 400
    assert "missing mandatory columns" in resp.json()["detail"].lower()


def test_batch_upload_rbac(
    client: TestClient, lmo_headers: dict
) -> None:
    """Test officers who are not owners/admins cannot bulk upload instruments."""
    csv_content = "instrument_type,manufacturer,model_name,serial_number,location\n"
    files = {"file": ("test.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    resp = client.post(
        "/api/v1/instruments/batch-upload",
        files=files,
        headers=lmo_headers,
    )
    assert resp.status_code == 403
