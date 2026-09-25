"""Seeds operational lifecycle records for METRIX end-to-end testing.

Attaches instruments, verification applications, inspections, certificates,
and notifications to the 4 essential development users.
"""
from datetime import date, datetime, timedelta, timezone
import hashlib
import json
from sqlalchemy import select
from app.db.database import SessionLocal
from app.models.enums import (
    ApplicationStatus,
    CertificateStatus,
    InspectionMode,
    InspectionResult,
    InstrumentType,
    NotificationType,
)
from app.models.user import User
from app.models.instrument import Instrument
from app.models.application import ApplicationStatusHistory, VerificationApplication
from app.models.inspection import Inspection
from app.models.certificate import Certificate
from app.models.notification import Notification


def seed_test_lifecycle_data() -> None:
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        today = date.today()

        admin = db.execute(select(User).where(User.email == "admin@metrix.gov.in")).scalar_one()
        lmo = db.execute(select(User).where(User.email == "lmo@metrix.gov.in")).scalar_one()
        gatc = db.execute(select(User).where(User.email == "gatc@metrix.gov.in")).scalar_one()
        owner = db.execute(select(User).where(User.email == "owner@example.com")).scalar_one()

        print("[+] Linking testing lifecycle data to the 4 primary users...")

        # =====================================================================
        # SCENARIO 1: Verified Instrument with Active Digital Certificate
        # =====================================================================
        inst_cert = Instrument(
            registration_number="IND-REG-2026-00101",
            owner_id=owner.id,
            instrument_type=InstrumentType.WEIGHING_SCALE,
            manufacturer="Essae-Teraoka Ltd",
            model_name="DS-215 Electronic Counter Scale",
            serial_number="SN-ES-2026-7841",
            capacity="30",
            location="Retail Counter #1, Mittal Logistics Hub, Pune",
            is_active=True,
        )
        db.add(inst_cert)
        db.flush()

        app_cert = VerificationApplication(
            application_number="APP-20260901-CERT1",
            instrument_id=inst_cert.id,
            applicant_id=owner.id,
            application_type="INITIAL",
            status=ApplicationStatus.CERTIFICATE_ISSUED,
            submitted_at=now - timedelta(days=15),
            remarks="Initial statutory verification for counter scale.",
        )
        db.add(app_cert)
        db.flush()

        db.add_all([
            ApplicationStatusHistory(
                application_id=app_cert.id,
                from_status=ApplicationStatus.DRAFT,
                to_status=ApplicationStatus.SUBMITTED,
                changed_by_id=owner.id,
                remarks="Application submitted by owner.",
            ),
            ApplicationStatusHistory(
                application_id=app_cert.id,
                from_status=ApplicationStatus.SUBMITTED,
                to_status=ApplicationStatus.SCHEDULED,
                changed_by_id=lmo.id,
                remarks="Officer allocated and inspection scheduled.",
            ),
            ApplicationStatusHistory(
                application_id=app_cert.id,
                from_status=ApplicationStatus.SCHEDULED,
                to_status=ApplicationStatus.VERIFIED,
                changed_by_id=lmo.id,
                remarks="Field inspection conducted and verification approved.",
            ),
            ApplicationStatusHistory(
                application_id=app_cert.id,
                from_status=ApplicationStatus.VERIFIED,
                to_status=ApplicationStatus.CERTIFICATE_ISSUED,
                changed_by_id=lmo.id,
                remarks="Digital certificate generated and stamped.",
            ),
        ])

        insp_cert = Inspection(
            application_id=app_cert.id,
            assigned_to_id=lmo.id,
            scheduled_date=today - timedelta(days=10),
            scheduled_time="10:30 AM",
            inspection_location="Retail Counter #1, Mittal Logistics Hub, Pune",
            scheduling_remarks="Routine statutory verification under Legal Metrology Act, 2009.",
            inspection_mode=InspectionMode.LMO_FIELD,
            started_at=now - timedelta(days=10, hours=2),
            completed_at=now - timedelta(days=10, hours=1),
            result=InspectionResult.VERIFIED,
            result_remarks="All tests conform to Legal Metrology Schedule tolerances.",
            seal_number="SEAL-MH-2026-8812",
            stamp_quarter="Q3-2026",
            physical_inspection_data=json.dumps({
                "manufacturer_plate": True,
                "model_approval_mark": True,
                "sealing_provision_intact": True,
                "display_readability": True,
                "leveling_device": True,
                "overall_condition": "PASSED",
            }),
            metrological_test_data=json.dumps({
                "zero_setting_error": "0.0g",
                "eccentricity_tested": True,
                "repeatability_tested": True,
                "max_observed_error": "+1.0g",
                "mpe_allowable": "+/-5.0g",
                "conclusion": "PASSED",
            }),
        )
        db.add(insp_cert)
        db.flush()

        cert_token = "METRIX-CERT-2026-IND-04829"
        hash_payload = f"{cert_token}|{inst_cert.registration_number}|{today - timedelta(days=10)}|Rajesh Sharma"
        integrity_hash = hashlib.sha256(hash_payload.encode()).hexdigest()

        cert = Certificate(
            certificate_number=cert_token,
            application_id=app_cert.id,
            instrument_id=inst_cert.id,
            issued_by_id=lmo.id,
            issued_at=now - timedelta(days=10),
            valid_from=today - timedelta(days=10),
            valid_until=today - timedelta(days=10) + timedelta(days=365),
            status=CertificateStatus.ACTIVE,
            integrity_hash=integrity_hash,
            verification_token=cert_token,
        )
        db.add(cert)

        # =====================================================================
        # SCENARIO 2: Platform Scale Scheduled for LMO Inspection
        # =====================================================================
        inst_lmo = Instrument(
            registration_number="IND-REG-2026-00102",
            owner_id=owner.id,
            instrument_type=InstrumentType.WEIGHING_SCALE,
            manufacturer="Avery Weigh-Tronix",
            model_name="H305 Industrial Platform Scale",
            serial_number="SN-AW-2026-9923",
            capacity="500 kg",
            location="Warehouse Bay 3, Mittal Logistics Hub, Pune",
            is_active=True,
        )
        db.add(inst_lmo)
        db.flush()

        app_lmo = VerificationApplication(
            application_number="APP-20260920-LMO02",
            instrument_id=inst_lmo.id,
            applicant_id=owner.id,
            application_type="PERIODIC_REVERIFICATION",
            status=ApplicationStatus.SCHEDULED,
            submitted_at=now - timedelta(days=2),
            remarks="Periodic re-verification application for 500kg warehouse platform scale.",
        )
        db.add(app_lmo)
        db.flush()

        db.add(
            ApplicationStatusHistory(
                application_id=app_lmo.id,
                from_status=ApplicationStatus.SUBMITTED,
                to_status=ApplicationStatus.SCHEDULED,
                changed_by_id=lmo.id,
                remarks="Officer allocated; scheduled for on-site inspection.",
            )
        )

        insp_lmo = Inspection(
            application_id=app_lmo.id,
            assigned_to_id=lmo.id,
            scheduled_date=today + timedelta(days=1),
            scheduled_time="11:00 AM",
            inspection_location="Warehouse Bay 3, Mittal Logistics Hub, Pune",
            scheduling_remarks="Standard field inspection for 500kg platform scale.",
            inspection_mode=InspectionMode.LMO_FIELD,
        )
        db.add(insp_lmo)

        # =====================================================================
        # SCENARIO 3: High-Capacity Flow Meter Auto-Routed to GATC Lab
        # =====================================================================
        inst_gatc = Instrument(
            registration_number="IND-REG-2026-00103",
            owner_id=owner.id,
            instrument_type=InstrumentType.FLOW_METER,
            manufacturer="Endress+Hauser",
            model_name="Promass F300 High-Capacity Flow System",
            serial_number="SN-EH-2026-3391",
            capacity="5000 L/min",
            location="Bulk Terminal, Mittal Logistics Hub, Pune",
            is_active=True,
        )
        db.add(inst_gatc)
        db.flush()

        app_gatc = VerificationApplication(
            application_number="APP-20260922-GATC3",
            instrument_id=inst_gatc.id,
            applicant_id=owner.id,
            application_type="INITIAL",
            status=ApplicationStatus.UNDER_REVIEW,
            submitted_at=now - timedelta(days=1),
            remarks="High-capacity flow meter auto-routed to accredited GATC laboratory.",
        )
        db.add(app_gatc)
        db.flush()

        db.add(
            ApplicationStatusHistory(
                application_id=app_gatc.id,
                from_status=ApplicationStatus.SUBMITTED,
                to_status=ApplicationStatus.UNDER_REVIEW,
                changed_by_id=gatc.id,
                remarks="Auto-routed to accredited GATC test laboratory for calibration schedule.",
            )
        )

        insp_gatc = Inspection(
            application_id=app_gatc.id,
            assigned_to_id=gatc.id,
            scheduled_date=today + timedelta(days=2),
            scheduled_time="02:30 PM",
            inspection_location="National Calibration Centre, Delhi",
            scheduling_remarks="High-precision laboratory calibration tests scheduled under GATC Rules.",
            inspection_mode=InspectionMode.GATC_LAB,
        )
        db.add(insp_gatc)

        # =====================================================================
        # SCENARIO 4: Fuel Dispenser (Registered - Ready for New Application)
        # =====================================================================
        inst_fresh = Instrument(
            registration_number="IND-REG-2026-00104",
            owner_id=owner.id,
            instrument_type=InstrumentType.PETROL_DISPENSER,
            manufacturer="Gilbarco Veeder-Root",
            model_name="Horizon High-Flow Single Nozzle Dispenser",
            serial_number="SN-GV-2026-1188",
            capacity="50 L/min",
            location="Fleet Fueling Bay, Mittal Logistics Hub, Pune",
            is_active=True,
        )
        db.add(inst_fresh)
        db.flush()

        # =====================================================================
        # NOTIFICATIONS
        # =====================================================================
        notifications = [
            Notification(
                user_id=owner.id,
                type=NotificationType.CERTIFICATE_ISSUED,
                title="Certificate Issued: Counter Scale",
                message="Digital Certificate METRIX-CERT-2026-IND-04829 has been issued for your Electronic Counter Scale (SN-ES-2026-7841). Valid until 2027.",
                is_read=True,
                entity_type="certificate",
                entity_id=cert.id,
            ),
            Notification(
                user_id=owner.id,
                type=NotificationType.APPLICATION_SCHEDULED,
                title="Inspection Scheduled: Platform Scale",
                message="Your application APP-20260920-LMO02 has been scheduled for on-site inspection on tomorrow at 11:00 AM by Inspector Rajesh Sharma.",
                is_read=False,
                entity_type="application",
                entity_id=app_lmo.id,
            ),
            Notification(
                user_id=lmo.id,
                type=NotificationType.INSPECTION_ASSIGNED,
                title="Inspection Assignment",
                message="You have been allocated verification inspection for application APP-20260920-LMO02 (Platform Scale, 500kg).",
                is_read=False,
                entity_type="application",
                entity_id=app_lmo.id,
            ),
            Notification(
                user_id=gatc.id,
                type=NotificationType.APPLICATION_SCHEDULED,
                title="New Calibration Routing",
                message="High-capacity Flow Meter application APP-20260922-GATC3 has been auto-routed to your centre for laboratory calibration testing.",
                is_read=False,
                entity_type="application",
                entity_id=app_gatc.id,
            ),
            Notification(
                user_id=admin.id,
                type=NotificationType.APPLICATION_SUBMITTED,
                title="Portal Ready for Testing",
                message="METRIX operational testing data is populated across all four stakeholder roles.",
                is_read=True,
            ),
        ]
        db.add_all(notifications)

        db.commit()
        print("[SUCCESS] All testing lifecycle data successfully committed.")

    except Exception as exc:
        db.rollback()
        print(f"[!] Error seeding lifecycle data: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_test_lifecycle_data()
