from datetime import date, datetime, timezone
from typing import Optional
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload
from app.models.certificate import Certificate
from app.models.enums import CertificateStatus


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
