"""Tests for Phase 1 MVP Completion Features:
1. Rule 14 Fee calculation & late penalty engine
2. Payment receipt upload & LMO verification
3. Clarification loop (CLARIFICATION_ASKED)
4. Stakeholder KYC profile updates
5. Public whistleblower discrepancy reporting
"""
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.enums import ApplicationStatus, InstrumentType, PaymentStatus
from app.models.user import User


def test_fee_calculation_rule_14(client: TestClient, owner_headers: dict) -> None:
    """Verify Schedule XII base fee calculation and Rule 14(2) late fee penalty."""
    # 1. Weighing scale under 50 kg -> ₹100
    res1 = client.get(
        "/api/v1/fees/calculate?instrument_type=WEIGHING_SCALE&capacity=40kg",
        headers=owner_headers,
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["base_fee"] == 100
    assert data1["late_fee"] == 0
    assert data1["total_fee"] == 100

    # 2. Platform scale 500 kg -> ₹200
    res2 = client.get(
        "/api/v1/fees/calculate?instrument_type=PLATFORM_SCALE&capacity=500kg",
        headers=owner_headers,
    )
    assert res2.status_code == 200
    assert res2.json()["base_fee"] == 200

    # 3. Weighbridge 50 tonne -> ₹2,500
    res3 = client.get(
        "/api/v1/fees/calculate?instrument_type=WEIGHBRIDGE&capacity=50t",
        headers=owner_headers,
    )
    assert res3.status_code == 200
    assert res3.json()["base_fee"] == 2500

    # 4. Petrol dispenser -> ₹1,000
    res4 = client.get(
        "/api/v1/fees/calculate?instrument_type=PETROL_DISPENSER",
        headers=owner_headers,
    )
    assert res4.status_code == 200
    assert res4.json()["base_fee"] == 1000

    # 5. Late fee test: Expired 2 quarters ago (e.g. 200 days ago)
    past_date = (date.today() - timedelta(days=200)).isoformat()
    res5 = client.get(
        f"/api/v1/fees/calculate?instrument_type=WEIGHING_SCALE&capacity=40kg&verification_type=RE_VERIFICATION&previous_expiry_date={past_date}",
        headers=owner_headers,
    )
    assert res5.status_code == 200
    data5 = res5.json()
    assert data5["base_fee"] == 100
    assert data5["late_fee"] > 0
    assert data5["total_fee"] == data5["base_fee"] + data5["late_fee"]
    assert data5["is_late"] is True


def test_payment_receipt_and_verification_workflow(
    client: TestClient, owner_headers: dict, lmo_headers: dict
) -> None:
    """Verify applicant uploads challan, moves to PAYMENT_UPLOADED, and LMO verifies to UNDER_REVIEW."""
    # 1. Register instrument
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "WEIGHING_SCALE",
            "manufacturer": "Citizen Scales",
            "model_name": "CZ-50",
            "serial_number": "SN-PAY-001",
            "capacity": "50kg",
            "location": "Retail Outlet 1, Mumbai",
        },
        headers=owner_headers,
    )
    assert inst_resp.status_code == 201
    inst_id = inst_resp.json()["id"]

    # 2. Submit application
    app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": True, "verification_type": "INITIAL"},
        headers=owner_headers,
    )
    assert app_resp.status_code == 201
    app_id = app_resp.json()["id"]
    assert app_resp.json()["status"] == "SUBMITTED"

    # 3. Applicant uploads challan payment receipt
    pay_resp = client.post(
        f"/api/v1/applications/{app_id}/payment-receipt",
        json={
            "challan_reference_number": "CHAL-SBI-2026-9812",
            "challan_date": date.today().isoformat(),
            "payment_receipt_url": "https://example.com/receipts/chal_9812.pdf",
            "calculated_fee": 100,
            "late_fee": 0,
            "total_fee": 100,
        },
        headers=owner_headers,
    )
    assert pay_resp.status_code == 200
    pay_data = pay_resp.json()
    assert pay_data["status"] == "PAYMENT_UPLOADED"
    assert pay_data["payment_status"] == "UPLOADED"
    assert pay_data["challan_reference_number"] == "CHAL-SBI-2026-9812"

    # 4. LMO verifies the payment
    verify_resp = client.patch(
        f"/api/v1/applications/{app_id}/payment-verify",
        json={"is_verified": True, "remarks": "Challan verified with SBI portal"},
        headers=lmo_headers,
    )
    assert verify_resp.status_code == 200
    verify_data = verify_resp.json()
    assert verify_data["status"] == "UNDER_REVIEW"
    assert verify_data["payment_status"] == "VERIFIED"


def test_clarification_loop_workflow(
    client: TestClient, owner_headers: dict, lmo_headers: dict
) -> None:
    """Verify LMO requests clarification and applicant responds, transitioning back to UNDER_REVIEW."""
    # 1. Register and submit application
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "PLATFORM_SCALE",
            "manufacturer": "Avery",
            "model_name": "ZK830",
            "serial_number": "SN-CLAR-001",
            "capacity": "200kg",
            "location": "Depot 2",
        },
        headers=owner_headers,
    )
    assert inst_resp.status_code == 201
    inst_id = inst_resp.json()["id"]

    app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": True},
        headers=owner_headers,
    )
    app_id = app_resp.json()["id"]

    # Move to UNDER_REVIEW
    client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW", "remarks": "Initial review commenced"},
        headers=lmo_headers,
    )

    # 2. Officer requests clarification
    clar_req = client.patch(
        f"/api/v1/applications/{app_id}/clarification/request",
        json={"remarks": "Please provide clearer photo of the serial plate and manufacturer stamp."},
        headers=lmo_headers,
    )
    assert clar_req.status_code == 200
    assert clar_req.json()["status"] == "CLARIFICATION_ASKED"

    # 3. Applicant responds to clarification
    clar_resp = client.patch(
        f"/api/v1/applications/{app_id}/clarification/respond",
        json={"remarks": "High-resolution serial plate photo uploaded to instrument profile."},
        headers=owner_headers,
    )
    assert clar_resp.status_code == 200
    assert clar_resp.json()["status"] == "UNDER_REVIEW"


def test_stakeholder_kyc_update(client: TestClient, owner_headers: dict) -> None:
    """Verify updating GSTIN, PAN, and business type in stakeholder profile."""
    kyc_resp = client.patch(
        "/api/v1/auth/me",
        json={
            "business_name": "Metrix Trading Enterprises LLP",
            "gstin": "27AAPFU0939F1ZV",
            "pan": "AAPFU0939F",
            "business_type": "COMMERCIAL_USER",
            "aadhaar_reference": "XXXX-XXXX-1234",
        },
        headers=owner_headers,
    )
    assert kyc_resp.status_code == 200
    prof = kyc_resp.json()["profile"]
    assert prof["gstin"] == "27AAPFU0939F1ZV"
    assert prof["pan"] == "AAPFU0939F"
    assert prof["business_type"] == "COMMERCIAL_USER"


def test_public_discrepancy_reporting(
    client: TestClient, owner_headers: dict, lmo_headers: dict
) -> None:
    """Verify citizen whistleblower discrepancy reporting on a verified certificate."""
    # Lookup active certificate
    cert_list = client.get("/api/v1/certificates", headers=owner_headers)
    assert cert_list.status_code == 200
    items = cert_list.json()["items"]
    if not items:
        return

    cert = items[0]
    token = cert["verification_token"]

    report_resp = client.post(
        f"/api/v1/public/certificates/{token}/report-discrepancy",
        json={
            "discrepancy_type": "TAMPERED_PHYSICAL_SEAL",
            "description": "Physical lead-and-wire seal on the scale appears broken and wire is snipped.",
            "reporter_name": "Citizen Consumer",
            "reporter_phone": "+91-9876543210",
        },
    )
    assert report_resp.status_code == 201
    report_data = report_resp.json()
    assert report_data["status"] == "RECEIVED"
    assert report_data["report_reference_id"].startswith("REP-")


def test_gatc_report_submission_and_lmo_endorsement(
    client: TestClient, owner_headers: dict, lmo_headers: dict, gatc_headers: dict, gatc_user: User
) -> None:
    """Verify GATC submits calibration report with recommendation and LMO endorses it."""
    # 1. Register instrument
    inst_resp = client.post(
        "/api/v1/instruments",
        json={
            "instrument_type": "PRECISION_BALANCE",
            "manufacturer": "Sartorius Lab",
            "model_name": "SART-200",
            "serial_number": "SN-GATC-LAB-99",
            "capacity": "200g",
            "location": "Research Lab 3, Pune",
        },
        headers=owner_headers,
    )
    assert inst_resp.status_code == 201
    inst_id = inst_resp.json()["id"]

    # 2. Submit application
    app_resp = client.post(
        "/api/v1/applications",
        json={"instrument_id": inst_id, "submit_now": True, "verification_type": "INITIAL"},
        headers=owner_headers,
    )
    assert app_resp.status_code == 201
    app_id = app_resp.json()["id"]

    # 3. LMO reviews
    rev_resp = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW", "remarks": "Approved for lab calibration"},
        headers=lmo_headers,
    )
    assert rev_resp.status_code == 200

    # 4. LMO schedules inspection
    sched_resp = client.patch(
        f"/api/v1/applications/{app_id}/schedule",
        json={
            "scheduled_date": (date.today() + timedelta(days=2)).isoformat(),
            "time_slot": "10:00 AM - 01:00 PM",
            "premises": "GATC NABL Laboratory",
            "mode": "GATC_LAB",
        },
        headers=lmo_headers,
    )
    assert sched_resp.status_code == 200
    insp_id = sched_resp.json()["id"]

    # 5. LMO assigns to GATC
    assign_resp = client.patch(
        f"/api/v1/applications/{app_id}/assignment",
        json={"assigned_to_id": gatc_user.id},
        headers=lmo_headers,
    )
    assert assign_resp.status_code == 200

    # 6. GATC starts inspection
    start_resp = client.post(
        f"/api/v1/applications/{app_id}/inspection",
        headers=gatc_headers,
    )
    assert start_resp.status_code == 200

    # 7. GATC submits test report
    gatc_rep_resp = client.post(
        f"/api/v1/inspections/{insp_id}/gatc-report",
        json={
            "gatc_test_report_url": "https://storage.metrix.gov.in/gatc/calib_cert_99.pdf",
            "gatc_recommendation": "CERTIFY",
            "observations": [
                {
                    "parameter_name": "Span Linearity",
                    "observed_value": "0.001",
                    "standard_value": "0.000",
                    "unit": "g",
                    "is_passed": True,
                }
            ],
        },
        headers=gatc_headers,
    )
    assert gatc_rep_resp.status_code == 200
    gatc_data = gatc_rep_resp.json()
    assert gatc_data["gatc_test_report_url"] == "https://storage.metrix.gov.in/gatc/calib_cert_99.pdf"
    assert gatc_data["gatc_recommendation"] == "CERTIFY"
    assert gatc_data["lmo_approval_status"] == "PENDING_LMO_REVIEW"

    # 8. LMO reviews and endorses
    lmo_appr_resp = client.patch(
        f"/api/v1/inspections/{insp_id}/lmo-approval",
        json={
            "lmo_approval_status": "APPROVED",
            "lmo_approval_remarks": "Calibration dossier verified according to Legal Metrology Rule 27.",
        },
        headers=lmo_headers,
    )
    assert lmo_appr_resp.status_code == 200
    final_data = lmo_appr_resp.json()
    assert final_data["lmo_approval_status"] == "APPROVED"
    assert final_data["result"] == "VERIFIED"

