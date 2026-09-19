from datetime import date, datetime, time, timedelta, timezone
from typing import List, Optional, Tuple
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload
from app.models.certificate import Certificate
from app.models.enums import CertificateStatus
from app.models.instrument import Instrument


class CertificateRepository:
    """Repository handling database queries and persistence for legal metrology certificates."""

    def get_by_id(self, db: Session, certificate_id: int) -> Optional[Certificate]:
        stmt = select(Certificate).where(Certificate.id == certificate_id)
        return db.execute(stmt).scalar_one_or_none()

    def get_by_id_with_relations(
        self, db: Session, certificate_id: int
    ) -> Optional[Certificate]:
        stmt = (
            select(Certificate)
            .options(
                selectinload(Certificate.application),
                selectinload(Certificate.instrument),
                selectinload(Certificate.issued_by),
            )
            .where(Certificate.id == certificate_id)
        )
        return db.execute(stmt).scalar_one_or_none()

    def get_by_application_id(
        self, db: Session, application_id: int
    ) -> Optional[Certificate]:
        stmt = (
            select(Certificate)
            .options(
                selectinload(Certificate.application),
                selectinload(Certificate.instrument),
                selectinload(Certificate.issued_by),
            )
            .where(Certificate.application_id == application_id)
        )
        return db.execute(stmt).scalar_one_or_none()

    def get_by_certificate_number(
        self, db: Session, certificate_number: str
    ) -> Optional[Certificate]:
        stmt = (
            select(Certificate)
            .options(
                selectinload(Certificate.application),
                selectinload(Certificate.instrument),
                selectinload(Certificate.issued_by),
            )
            .where(Certificate.certificate_number == certificate_number.strip().upper())
        )
        return db.execute(stmt).scalar_one_or_none()

    def get_by_verification_token(
        self, db: Session, token: str
    ) -> Optional[Certificate]:
        stmt = (
            select(Certificate)
            .options(
                selectinload(Certificate.application),
                selectinload(Certificate.instrument),
                selectinload(Certificate.issued_by),
            )
            .where(Certificate.verification_token == token.strip())
        )
        return db.execute(stmt).scalar_one_or_none()

    def count_total(self, db: Session) -> int:
        stmt = select(func.count(Certificate.id))
        return db.execute(stmt).scalar_one()

    def search(
        self,
        db: Session,
        *,
        owner_id: Optional[int] = None,
        certificate_number: Optional[str] = None,
        instrument_id: Optional[int] = None,
        instrument_registration_number: Optional[str] = None,
        status: Optional[CertificateStatus] = None,
        issue_date_from: Optional[date] = None,
        issue_date_to: Optional[date] = None,
        expiry_date_from: Optional[date] = None,
        expiry_date_to: Optional[date] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Certificate], int]:
        filters = []
        needs_instrument_join = owner_id is not None or bool(instrument_registration_number)

        if owner_id is not None:
            filters.append(Instrument.owner_id == owner_id)
        if certificate_number:
            filters.append(Certificate.certificate_number.ilike(f"%{certificate_number.strip()}%"))
        if instrument_id is not None:
            filters.append(Certificate.instrument_id == instrument_id)
        if instrument_registration_number:
            filters.append(
                Instrument.registration_number.ilike(f"%{instrument_registration_number.strip()}%")
            )
        if status is not None:
            today = date.today()
            if status == CertificateStatus.ACTIVE:
                filters.append(Certificate.status == CertificateStatus.ACTIVE)
                filters.append(Certificate.valid_until >= today)
            elif status == CertificateStatus.EXPIRED:
                filters.append(
                    or_(
                        Certificate.status == CertificateStatus.EXPIRED,
                        Certificate.valid_until < today,
                    )
                )
        if issue_date_from:
            dt_from = datetime.combine(issue_date_from, time.min)
            filters.append(Certificate.issued_at >= dt_from)
        if issue_date_to:
            dt_to = datetime.combine(issue_date_to, time.max)
            filters.append(Certificate.issued_at <= dt_to)
        if expiry_date_from:
            filters.append(Certificate.valid_until >= expiry_date_from)
        if expiry_date_to:
            filters.append(Certificate.valid_until <= expiry_date_to)

        count_stmt = select(func.count(Certificate.id))
        if needs_instrument_join:
            count_stmt = count_stmt.join(Instrument, Certificate.instrument_id == Instrument.id)
        if filters:
            count_stmt = count_stmt.where(*filters)
        total = db.execute(count_stmt).scalar_one()

        stmt = select(Certificate).options(
            selectinload(Certificate.application),
            selectinload(Certificate.instrument),
            selectinload(Certificate.issued_by),
        )
        if needs_instrument_join:
            stmt = stmt.join(Instrument, Certificate.instrument_id == Instrument.id)
        if filters:
            stmt = stmt.where(*filters)
        stmt = stmt.order_by(Certificate.issued_at.desc()).offset(skip).limit(limit)

        items = list(db.execute(stmt).scalars().all())
        return items, total

    def list_expiring(
        self,
        db: Session,
        *,
        owner_id: Optional[int] = None,
        warning_days: int = 30,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Certificate], int]:
        today = date.today()
        warning_date = today + timedelta(days=warning_days)

        filters = [
            Certificate.status == CertificateStatus.ACTIVE,
            Certificate.valid_until >= today,
            Certificate.valid_until <= warning_date,
        ]
        if owner_id is not None:
            filters.append(Instrument.owner_id == owner_id)

        count_stmt = select(func.count(Certificate.id))
        if owner_id is not None:
            count_stmt = count_stmt.join(Instrument, Certificate.instrument_id == Instrument.id)
        count_stmt = count_stmt.where(*filters)
        total = db.execute(count_stmt).scalar_one()

        stmt = (
            select(Certificate)
            .options(
                selectinload(Certificate.application),
                selectinload(Certificate.instrument),
                selectinload(Certificate.issued_by),
            )
        )
        if owner_id is not None:
            stmt = stmt.join(Instrument, Certificate.instrument_id == Instrument.id)
        stmt = (
            stmt.where(*filters)
            .order_by(Certificate.valid_until.asc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.execute(stmt).scalars().all())
        return items, total

    def list_expired(
        self,
        db: Session,
        *,
        owner_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Certificate], int]:
        today = date.today()
        filters = [
            or_(
                Certificate.status == CertificateStatus.EXPIRED,
                Certificate.valid_until < today,
            )
        ]
        if owner_id is not None:
            filters.append(Instrument.owner_id == owner_id)

        count_stmt = select(func.count(Certificate.id))
        if owner_id is not None:
            count_stmt = count_stmt.join(Instrument, Certificate.instrument_id == Instrument.id)
        count_stmt = count_stmt.where(*filters)
        total = db.execute(count_stmt).scalar_one()

        stmt = (
            select(Certificate)
            .options(
                selectinload(Certificate.application),
                selectinload(Certificate.instrument),
                selectinload(Certificate.issued_by),
            )
        )
        if owner_id is not None:
            stmt = stmt.join(Instrument, Certificate.instrument_id == Instrument.id)
        stmt = (
            stmt.where(*filters)
            .order_by(Certificate.valid_until.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.execute(stmt).scalars().all())
        return items, total

    def get_expiring_certificates_for_notification(
        self, db: Session, *, warning_days: int = 30
    ) -> List[Certificate]:
        today = date.today()
        warning_date = today + timedelta(days=warning_days)
        stmt = (
            select(Certificate)
            .options(
                selectinload(Certificate.instrument).selectinload(Instrument.owner),
            )
            .where(
                Certificate.status == CertificateStatus.ACTIVE,
                Certificate.valid_until >= today,
                Certificate.valid_until <= warning_date,
            )
        )
        return list(db.execute(stmt).scalars().all())

    def get_expired_certificates_for_notification(
        self, db: Session
    ) -> List[Certificate]:
        today = date.today()
        stmt = (
            select(Certificate)
            .options(
                selectinload(Certificate.instrument).selectinload(Instrument.owner),
            )
            .where(
                or_(
                    Certificate.status == CertificateStatus.EXPIRED,
                    Certificate.valid_until < today,
                )
            )
        )
        return list(db.execute(stmt).scalars().all())

    def create(
        self,
        db: Session,
        *,
        certificate_number: str,
        application_id: int,
        instrument_id: int,
        issued_by_id: int,
        issued_at: datetime,
        valid_from: date,
        valid_until: date,
        status: CertificateStatus = CertificateStatus.ACTIVE,
        integrity_hash: str,
        verification_token: str,
        pdf_path: Optional[str] = None,
    ) -> Certificate:
        cert = Certificate(
            certificate_number=certificate_number,
            application_id=application_id,
            instrument_id=instrument_id,
            issued_by_id=issued_by_id,
            issued_at=issued_at,
            valid_from=valid_from,
            valid_until=valid_until,
            status=status,
            integrity_hash=integrity_hash,
            verification_token=verification_token,
            pdf_path=pdf_path,
        )
        db.add(cert)
        return cert


certificate_repository = CertificateRepository()
