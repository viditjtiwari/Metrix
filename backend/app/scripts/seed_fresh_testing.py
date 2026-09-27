"""Fresh comprehensive seed script for full METRIX system testing.

Wipes ALL existing data and seeds fresh accounts across all 4 RBAC roles
with realistic Indian business profiles, instruments at various lifecycle
stages, applications in different statuses, notices, and notifications.

This script is designed to let a tester see EVERY feature and behaviour
of the METRIX portal by logging in as different roles.

Usage:
    cd backend
    .venv/Scripts/python.exe app/scripts/seed_fresh_testing.py
"""
import sys
from pathlib import Path

# Ensure backend is on sys.path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from datetime import date, datetime, timedelta, timezone
from sqlalchemy import text
from app.core.security import get_password_hash
from app.db.database import SessionLocal, engine
from app.models.enums import (
    ApplicationStatus, InspectionMode, InstrumentType,
    NotificationType, PaymentStatus, UserRole,
)
from app.models.user import StakeholderProfile, User
from app.models.instrument import Instrument
from app.models.application import VerificationApplication
from app.models.inspection import Inspection
from app.models.notification import Notification
from app.models.notice import Notice


# ?????????????????????????????????????????????????????????????????????
# Step 1: Wipe all data
# ?????????????????????????????????????????????????????????????????????
def wipe_database() -> None:
    """Truncate all application tables and reset identity counters."""
    tables = [
        "inspection_observations", "inspections", "certificates",
        "application_status_histories", "verification_applications",
        "instruments", "notices", "notifications",
        "stakeholder_profiles", "users",
    ]
    print("================================================")
    print("  WIPING ALL DATA FROM METRIX DATABASE...")
    print("================================================")
    with engine.begin() as conn:
        conn.execute(text(
            f"TRUNCATE TABLE {', '.join(tables)} RESTART IDENTITY CASCADE;"
        ))
    print("[OK] All tables truncated. Database is clean.\n")


# -----------------------------------------------------------------
# Step 2: Seed users with complete profiles
# -----------------------------------------------------------------
def seed_users(db) -> dict:
    """Create all 4 RBAC role users with realistic Indian profiles."""
    print("-- Seeding Users -----------------------------------")
    users = {}

    # 1. ADMIN
    admin = User(
        email="admin@metrix.gov.in",
        hashed_password=get_password_hash("Admin@123"),
        full_name="Dr. Priya Nair (National Controller)",
        role=UserRole.ADMIN, is_active=True,
    )
    db.add(admin)
    db.flush()
    users["admin"] = admin
    print(f"  [+] ADMIN:  admin@metrix.gov.in / Admin@123")

    # 2. LMO Officer
    lmo = User(
        email="lmo.officer@metrix.gov.in",
        hashed_password=get_password_hash("Officer@123"),
        full_name="Inspector Rajesh Kumar Sharma",
        role=UserRole.LMO, is_active=True,
    )
    db.add(lmo)
    db.flush()
    users["lmo"] = lmo
    print(f"  [+] LMO:    lmo.officer@metrix.gov.in / Officer@123")

    # 3. GATC Lab
    gatc = User(
        email="gatc.lab@metrix.gov.in",
        hashed_password=get_password_hash("Lab@123"),
        full_name="NABL Calibration Laboratory",
        role=UserRole.GATC, is_active=True,
    )
    db.add(gatc)
    db.flush()
    gatc_profile = StakeholderProfile(
        user_id=gatc.id,
        business_name="Central Institute of Metrology & Calibration",
        trade_license_number="GATC-NABL-DEL-2024-001",
        contact_phone="+91-11-26567890",
        address_line="CSIR Campus, Dr K.S. Krishnan Marg",
        city="New Delhi", state="Delhi", pincode="110012",
        gstin="07AABCU9603R1ZP", pan="AABCU9603R",
        business_type="GOVERNMENT_LAB",
    )
    db.add(gatc_profile)
    users["gatc"] = gatc
    print(f"  [+] GATC:   gatc.lab@metrix.gov.in / Lab@123")

    # 4. Instrument Owner / Trader
    owner = User(
        email="trader.owner@metrix.gov.in",
        hashed_password=get_password_hash("Owner@123"),
        full_name="Sunil Agarwal",
        role=UserRole.INSTRUMENT_OWNER, is_active=True,
    )
    db.add(owner)
    db.flush()
    owner_profile = StakeholderProfile(
        user_id=owner.id,
        business_name="Agarwal Traders & Wholesale Pvt Ltd",
        trade_license_number="TLN-MH-2024-7721",
        contact_phone="+91-9876543210",
        address_line="Plot 42, APMC Market, Vashi",
        city="Navi Mumbai", state="Maharashtra", pincode="400703",
        gstin="27AADCA1234F1ZT", pan="AADCA1234F",
        business_type="TRADER",
    )
    db.add(owner_profile)
    users["owner"] = owner
    print(f"  [+] OWNER:  trader.owner@metrix.gov.in / Owner@123")

    db.flush()
    return users


# -----------------------------------------------------------------
# Step 3: Seed instruments across different categories
# -----------------------------------------------------------------
def seed_instruments(db, owner) -> list:
    """Register diverse instruments to test all categories and routing."""
    print("\n-- Seeding Instruments -----------------------------")
    instruments_data = [
        {
            "registration_number": "INS-2026-MH-0001",
            "instrument_type": InstrumentType.ELECTRONIC_WEIGHING_SCALE,
            "manufacturer": "Essae Teraoka", "model_name": "DS-252",
            "serial_number": "ET-DS252-48291", "capacity": "30kg", "capacity_unit": "kg",
            "location": "Shop 14, APMC Market, Vashi, Navi Mumbai",
        },
        {
            "registration_number": "INS-2026-MH-0002",
            "instrument_type": InstrumentType.PLATFORM_SCALE,
            "manufacturer": "Avery India", "model_name": "HL-300",
            "serial_number": "AV-HL300-99012", "capacity": "300kg", "capacity_unit": "kg",
            "location": "Warehouse B3, APMC Market, Vashi",
        },
        {
            "registration_number": "INS-2026-MH-0003",
            "instrument_type": InstrumentType.PETROL_DISPENSER,
            "manufacturer": "Gilbarco Veeder-Root", "model_name": "Encore 700",
            "serial_number": "GVR-E700-55123", "capacity": "50 litres/min", "capacity_unit": "l",
            "location": "HP Petrol Pump, NH-48, Panvel",
        },
        {
            "registration_number": "INS-2026-MH-0004",
            "instrument_type": InstrumentType.PRECISION_BALANCE,
            "manufacturer": "Mettler Toledo", "model_name": "ML204T",
            "serial_number": "MT-ML204-12877", "capacity": "220g", "capacity_unit": "g",
            "location": "Research Lab 3, IIT Bombay, Powai",
        },
        {
            "registration_number": "INS-2026-MH-0005",
            "instrument_type": InstrumentType.COUNTER_SCALE,
            "manufacturer": "Essae Teraoka", "model_name": "SI-810",
            "serial_number": "ET-SI810-33456", "capacity": "5kg", "capacity_unit": "kg",
            "location": "Retail Counter, Gold Bazaar, Zaveri Bazar",
        },
        {
            "registration_number": "INS-2026-MH-0006",
            "instrument_type": InstrumentType.WEIGHBRIDGE,
            "manufacturer": "Schenck Process", "model_name": "MultiDec",
            "serial_number": "SP-MD-67890", "capacity": "60 tonne", "capacity_unit": "tonne",
            "location": "Gate 2, Reliance Logistics Hub, Nhava Sheva",
        },
    ]
    result = []
    for d in instruments_data:
        inst = Instrument(owner_id=owner.id, is_active=True, **d)
        db.add(inst)
        result.append(inst)
    db.flush()
    for inst in result:
        print(f"  [+] {inst.registration_number} -- {inst.instrument_type.value} ({inst.capacity})")
    return result


# -----------------------------------------------------------------
# Step 4: Seed applications at various lifecycle stages
# -----------------------------------------------------------------
def seed_applications(db, users, instruments) -> list:
    """Create applications in different statuses to showcase all states."""
    print("\n-- Seeding Applications ----------------------------")
    owner = users["owner"]
    lmo = users["lmo"]
    now = datetime.now(timezone.utc)
    apps = []

    # App 1: SUBMITTED (owner just submitted, payment pending)
    # App 1: SUBMITTED (owner just submitted, payment pending)
    app1 = VerificationApplication(
        application_number="APP-2026-0001", instrument_id=instruments[0].id,
        applicant_id=owner.id, application_type="INITIAL", status=ApplicationStatus.SUBMITTED,
        submitted_at=now - timedelta(days=3), payment_status=PaymentStatus.PENDING,
        calculated_fee=500, late_fee=0, total_fee=500,
    )
    db.add(app1)
    apps.append(("APP-2026-0001", "SUBMITTED", instruments[0]))

    # App 2: PAYMENT_UPLOADED (owner uploaded receipt, LMO needs to verify)
    app2 = VerificationApplication(
        application_number="APP-2026-0002", instrument_id=instruments[1].id,
        applicant_id=owner.id, application_type="INITIAL", status=ApplicationStatus.PAYMENT_UPLOADED,
        submitted_at=now - timedelta(days=5), payment_status=PaymentStatus.UPLOADED,
        payment_receipt_url="https://storage.metrix.gov.in/receipts/challan_0002.pdf",
        challan_reference_number="UTR-SBIN-2026-998877", challan_date=date.today() - timedelta(days=2),
        payment_uploaded_at=now - timedelta(days=2), calculated_fee=1500, late_fee=0, total_fee=1500,
    )
    db.add(app2)
    apps.append(("APP-2026-0002", "PAYMENT_UPLOADED", instruments[1]))

    # App 3: UNDER_REVIEW (payment verified, LMO reviewing documents)
    app3 = VerificationApplication(
        application_number="APP-2026-0003", instrument_id=instruments[2].id,
        applicant_id=owner.id, application_type="INITIAL", status=ApplicationStatus.UNDER_REVIEW,
        submitted_at=now - timedelta(days=7), payment_status=PaymentStatus.VERIFIED,
        payment_receipt_url="https://storage.metrix.gov.in/receipts/challan_0003.pdf",
        challan_reference_number="UTR-HDFC-2026-554433", challan_date=date.today() - timedelta(days=5),
        payment_uploaded_at=now - timedelta(days=5), payment_verified_at=now - timedelta(days=4),
        payment_verified_by_id=lmo.id, calculated_fee=2000, late_fee=0, total_fee=2000,
    )
    db.add(app3)
    apps.append(("APP-2026-0003", "UNDER_REVIEW", instruments[2]))

    # App 4: SCHEDULED -- LMO_FIELD for counter scale (ready for inspection)
    app4 = VerificationApplication(
        application_number="APP-2026-0004",
        instrument_id=instruments[4].id,
        applicant_id=owner.id,
        application_type="INITIAL",
        status=ApplicationStatus.SCHEDULED,
        submitted_at=now - timedelta(days=10),
        payment_status=PaymentStatus.VERIFIED,
        payment_receipt_url="https://storage.metrix.gov.in/receipts/challan_0004.pdf",
        challan_reference_number="UTR-ICIC-2026-112233",
        challan_date=date.today() - timedelta(days=9),
        payment_uploaded_at=now - timedelta(days=9),
        payment_verified_at=now - timedelta(days=8),
        payment_verified_by_id=lmo.id,
        calculated_fee=500, late_fee=0, total_fee=500,
    )
    db.add(app4)
    db.flush()
    # Create inspection record for scheduled app
    insp4 = Inspection(
        application_id=app4.id,
        assigned_to_id=lmo.id,
        scheduled_date=date.today() + timedelta(days=2),
        scheduled_time="10:00 AM - 01:00 PM",
        inspection_location="Retail Counter, Gold Bazaar, Zaveri Bazar",
        inspection_mode=InspectionMode.LMO_FIELD,
    )
    db.add(insp4)
    apps.append(("APP-2026-0004", "SCHEDULED (LMO_FIELD)", instruments[4]))

    # App 5: SCHEDULED -- GATC_LAB for precision balance (for GATC to test)
    app5 = VerificationApplication(
        application_number="APP-2026-0005",
        instrument_id=instruments[3].id,
        applicant_id=owner.id,
        application_type="INITIAL",
        status=ApplicationStatus.SCHEDULED,
        submitted_at=now - timedelta(days=12),
        payment_status=PaymentStatus.VERIFIED,
        payment_receipt_url="https://storage.metrix.gov.in/receipts/challan_0005.pdf",
        challan_reference_number="UTR-BARB-2026-667788",
        challan_date=date.today() - timedelta(days=11),
        payment_uploaded_at=now - timedelta(days=11),
        payment_verified_at=now - timedelta(days=10),
        payment_verified_by_id=lmo.id,
        calculated_fee=3000, late_fee=0, total_fee=3000,
    )
    db.add(app5)
    db.flush()
    gatc = users["gatc"]
    insp5 = Inspection(
        application_id=app5.id,
        assigned_to_id=gatc.id,
        scheduled_date=date.today() + timedelta(days=1),
        scheduled_time="09:00 AM - 12:00 PM",
        inspection_location="NABL Lab, CSIR Campus, New Delhi",
        inspection_mode=InspectionMode.GATC_LAB,
    )
    db.add(insp5)
    apps.append(("APP-2026-0005", "SCHEDULED (GATC_LAB)", instruments[3]))

    # App 6: DRAFT (owner started but didn't submit -- for weighbridge)
    app6 = VerificationApplication(
        application_number="APP-2026-0006",
        instrument_id=instruments[5].id,
        applicant_id=owner.id,
        application_type="INITIAL",
        status=ApplicationStatus.DRAFT,
        payment_status=PaymentStatus.PENDING,
        calculated_fee=5000, late_fee=2500, total_fee=7500,
    )
    db.add(app6)
    apps.append(("APP-2026-0006", "DRAFT", instruments[5]))

    db.flush()
    for num, status, inst in apps:
        print(f"  [+] {num} -> {status} "
              f"({inst.instrument_type.value})")
    return apps


# -----------------------------------------------------------------
# Step 5: Seed departmental notices
# -----------------------------------------------------------------
def seed_notices(db, admin) -> None:
    """Seed official gazette notices for the public landing page."""
    print("\n-- Seeding Notices ---------------------------------")
    notices = [
        Notice(
            title="Annual Re-verification Drive 2026-27: "
                  "Commercial Weighing Instruments",
            content=(
                "All commercial establishments, traders, and logistics "
                "operators are hereby informed that the mandatory annual "
                "verification and stamping drive under the Legal Metrology "
                "Act, 2009 commences from 1st October 2026. Submit "
                "verification requests through the METRIX portal."
            ),
            is_active=True, published_by_id=admin.id,
        ),
        Notice(
            title="Mandatory QR-Coded Digital Certificates for All "
                  "Newly Verified Instruments",
            content=(
                "Effective immediately, all Legal Metrology Officers and "
                "Government Approved Test Centres must ensure that newly "
                "verified instruments carry QR-coded digital certificates "
                "issued exclusively through the METRIX portal. Physical "
                "stamping must correspond to the unique certificate number."
            ),
            is_active=True, published_by_id=admin.id,
        ),
        Notice(
            title="GATC Calibration SOP Update: OIML R-76 Compliance",
            content=(
                "Updated technical specifications for non-automatic weighing "
                "instruments (NAWI Class I, II, III) per OIML R-76 "
                "recommendations are now available for all registered GATC "
                "test laboratories. Download the updated SOP from the "
                "department portal."
            ),
            is_active=True, published_by_id=admin.id,
        ),
        Notice(
            title="Schedule XII Fee Revision: Effective April 2026",
            content=(
                "The statutory verification fees under Schedule XII of the "
                "Legal Metrology (General) Rules, 2011 have been revised. "
                "All stakeholders must use the METRIX Fee Calculator to "
                "compute applicable fees before submitting applications."
            ),
            is_active=True, published_by_id=admin.id,
        ),
    ]
    db.add_all(notices)
    db.flush()
    print(f"  [+] {len(notices)} departmental notices published.")


# -----------------------------------------------------------------
# Step 6: Seed notifications for different users
# -----------------------------------------------------------------
def seed_notifications(db, users) -> None:
    """Seed in-app notifications so each role sees unread items."""
    print("\n-- Seeding Notifications ---------------------------")
    now = datetime.now(timezone.utc)

    notifs = [
        # Owner notifications
        Notification(
            user_id=users["owner"].id,
            type=NotificationType.APPLICATION_SCHEDULED,
            title="Inspection Scheduled",
            message="Your counter scale (INS-2026-MH-0005) inspection "
                    "has been scheduled for field verification.",
            is_read=False, created_at=now - timedelta(hours=6),
        ),
        Notification(
            user_id=users["owner"].id,
            type=NotificationType.PAYMENT_VERIFIED,
            title="Payment Verified",
            message="Payment for application APP-2026-0003 (Petrol "
                    "Dispenser) has been verified by the LMO.",
            is_read=True, created_at=now - timedelta(days=4),
        ),
        # LMO notifications
        Notification(
            user_id=users["lmo"].id,
            type=NotificationType.APPLICATION_SUBMITTED,
            title="New Application Received",
            message="Application APP-2026-0001 for Electronic Weighing "
                    "Scale has been submitted by Sunil Agarwal.",
            is_read=False, created_at=now - timedelta(days=3),
        ),
        Notification(
            user_id=users["lmo"].id,
            type=NotificationType.APPLICATION_SUBMITTED,
            title="Payment Receipt Uploaded",
            message="Payment receipt for APP-2026-0002 (Platform Scale) "
                    "has been uploaded and awaits your verification.",
            is_read=False, created_at=now - timedelta(days=2),
        ),
        # GATC notifications
        Notification(
            user_id=users["gatc"].id,
            type=NotificationType.INSPECTION_ASSIGNED,
            title="Calibration Assigned to Your Lab",
            message="Precision Balance ML204T (INS-2026-MH-0004) has been "
                    "routed to your laboratory for NABL calibration testing.",
            is_read=False, created_at=now - timedelta(days=1),
        ),
        # Admin notifications
        Notification(
            user_id=users["admin"].id,
            type=NotificationType.APPLICATION_SUBMITTED,
            title="System Activity Alert",
            message="6 new verification applications have been submitted "
                    "in the current quarter across Maharashtra jurisdiction.",
            is_read=False, created_at=now - timedelta(hours=12),
        ),
    ]
    db.add_all(notifs)
    db.flush()
    print(f"  [+] {len(notifs)} notifications seeded across all roles.")


# -----------------------------------------------------------------
# Main entry point
# -----------------------------------------------------------------
def main() -> None:
    wipe_database()

    db = SessionLocal()
    try:
        users = seed_users(db)
        instruments = seed_instruments(db, users["owner"])
        seed_applications(db, users, instruments)
        seed_notices(db, users["admin"])
        seed_notifications(db, users)

        db.commit()
        print("\n================================================")
        print("  FRESH SEED COMPLETE - SYSTEM READY!")
        print("================================================")
        print("")
        print("  ADMIN : admin@metrix.gov.in / Admin@123")
        print("  LMO   : lmo.officer@metrix.gov.in / Officer@123")
        print("  GATC  : gatc.lab@metrix.gov.in / Lab@123")
        print("  OWNER : trader.owner@metrix.gov.in / Owner@123")
        print("")
        print("  6 Instruments | 6 Applications | 4 Notices")
        print("  6 Notifications | 2 Inspections Scheduled")
        print("================================================")
    except Exception as exc:
        db.rollback()
        print(f"\n[FAILED] SEED FAILED: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
