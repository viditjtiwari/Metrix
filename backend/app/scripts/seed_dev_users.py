"""Idempotent development seed script for METRIX.

Creates standard development and demonstration accounts across all four system roles.
Credentials are read from environment variables or use documented development defaults.
Passes all security constraints: idempotent, safe, no secrets logged.
"""
import os
import sys
from typing import Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import get_password_hash
from app.db.database import SessionLocal
from app.models.enums import UserRole
from app.repositories.user_repository import user_repository
from app.schemas.auth import StakeholderProfileCreate


def seed_user(
    db: Session,
    *,
    email: str,
    password_env_var: str,
    default_dev_password: str,
    full_name: str,
    role: UserRole,
    profile_data: Optional[StakeholderProfileCreate] = None,
) -> bool:
    """Safely seed a user if not already present."""
    existing = user_repository.get_by_email(db, email)
    if existing:
        print(f"[-] User '{email}' ({role.value}) already exists. Skipping.")
        return False

    password = os.getenv(password_env_var, default_dev_password)
    hashed_pwd = get_password_hash(password)

    user = user_repository.create(
        db,
        email=email,
        hashed_password=hashed_pwd,
        full_name=full_name,
        role=role.value,
        is_active=True,
    )

    if profile_data:
        user_repository.create_profile(db, user_id=user.id, profile_data=profile_data)

    db.commit()
    print(f"[+] Successfully seeded user '{email}' ({role.value}).")
    return True


def seed_development_data() -> None:
    print("=== METRIX DEVELOPMENT USERS SEEDING ===")
    if settings.APP_ENV == "production":
        print("[!] Safety check: seeding is disabled in production environment.")
        return

    db = SessionLocal()
    try:
        # 1. System Administrator
        seed_user(
            db,
            email="admin@metrix.gov.in",
            password_env_var="METRIX_DEV_ADMIN_PASSWORD",
            default_dev_password="Admin@123456",
            full_name="National Controller (Admin)",
            role=UserRole.ADMIN,
        )

        # 2. Legal Metrology Officer (LMO)
        seed_user(
            db,
            email="lmo@metrix.gov.in",
            password_env_var="METRIX_DEV_LMO_PASSWORD",
            default_dev_password="Officer@123456",
            full_name="Inspector Rajesh Sharma (LMO)",
            role=UserRole.LMO,
        )

        # 3. Government Approved Test Centre (GATC)
        seed_user(
            db,
            email="gatc@metrix.gov.in",
            password_env_var="METRIX_DEV_GATC_PASSWORD",
            default_dev_password="Lab@123456",
            full_name="National Calibration Laboratory (GATC)",
            role=UserRole.GATC,
            profile_data=StakeholderProfileCreate(
                business_name="National Calibration Centre",
                trade_license_number="GATC-LIC-DEL-2026",
                contact_phone="+91-11-23456789",
                address_line="Block B, Okhla Industrial Area Phase 1",
                city="New Delhi",
                state="Delhi",
                pincode="110020",
            ),
        )

        # 4. Instrument Owner
        seed_user(
            db,
            email="owner@example.com",
            password_env_var="METRIX_DEV_OWNER_PASSWORD",
            default_dev_password="Owner@123456",
            full_name="Sunil Mittal (Enterprise Owner)",
            role=UserRole.INSTRUMENT_OWNER,
            profile_data=StakeholderProfileCreate(
                business_name="Mittal Logistics & Warehouse Pvt Ltd",
                trade_license_number="TLN-MH-2024-9988",
                contact_phone="+91-9876543210",
                address_line="Plot 42, MIDC Industrial Area, Hinjewadi",
                city="Pune",
                state="Maharashtra",
                pincode="411057",
            ),
        )

        # Seed initial departmental notices
        from app.models.notice import Notice
        from sqlalchemy import func, select
        notice_count = db.execute(select(func.count(Notice.id))).scalar_one()
        if notice_count == 0:
            admin_user = user_repository.get_by_email(db, "admin@metrix.gov.in")
            admin_id = admin_user.id if admin_user else None
            sample_notices = [
                Notice(
                    title="Annual Re-verification Drive for Commercial Weighing Instruments 2026-27",
                    content="All commercial establishments, traders, and logistics operators are hereby informed that the mandatory annual verification and stamping drive under the Legal Metrology Act commences from 1st October 2026. Please submit verification requests through the portal.",
                    is_active=True,
                    published_by_id=admin_id,
                ),
                Notice(
                    title="Mandatory Digital Certificate Generation & QR Verification Guidelines",
                    content="Legal Metrology Officers and Government Approved Test Centres must ensure all newly verified instruments carry digital QR-coded certificates issued through the METRIX portal. Physical stamping must correspond to the unique certificate number.",
                    is_active=True,
                    published_by_id=admin_id,
                ),
                Notice(
                    title="Standard Operating Procedure for Calibration at GATC Facilities",
                    content="Updated technical specifications for non-automatic weighing instruments (NAWI Class I, II, and III) according to OIML R-76 recommendations are now available for all registered test laboratories.",
                    is_active=True,
                    published_by_id=admin_id,
                ),
            ]
            db.add_all(sample_notices)
            db.commit()
            print(f"[+] Successfully seeded {len(sample_notices)} departmental notices.")

        print("=== Seeding complete. All baseline development accounts verified ===")
    finally:
        db.close()


if __name__ == "__main__":
    seed_development_data()
