from datetime import date, datetime, time
from typing import List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload
from app.models.application import ApplicationStatusHistory, VerificationApplication
from app.models.enums import ApplicationStatus
from app.models.instrument import Instrument


class ApplicationRepository:
    """Repository handling database queries and search for verification applications."""

    def get_by_id(
        self, db: Session, application_id: int
    ) -> Optional[VerificationApplication]:
        stmt = (
            select(VerificationApplication)
            .where(VerificationApplication.id == application_id)
        )
        return db.execute(stmt).scalar_one_or_none()

    def get_by_id_with_history(
        self, db: Session, application_id: int
    ) -> Optional[VerificationApplication]:
        stmt = (
            select(VerificationApplication)
            .options(
                selectinload(VerificationApplication.status_history),
                selectinload(VerificationApplication.inspection),
            )
            .where(VerificationApplication.id == application_id)
        )
        return db.execute(stmt).scalar_one_or_none()

    def get_by_application_number(
        self, db: Session, application_number: str
    ) -> Optional[VerificationApplication]:
        stmt = (
            select(VerificationApplication)
            .options(
                selectinload(VerificationApplication.status_history),
                selectinload(VerificationApplication.inspection),
            )
            .where(
                VerificationApplication.application_number
                == application_number.strip().upper()
            )
        )
        return db.execute(stmt).scalar_one_or_none()

    def search(
        self,
        db: Session,
        *,
        applicant_id: Optional[int] = None,
        application_number: Optional[str] = None,
        status: Optional[ApplicationStatus] = None,
        application_type: Optional[str] = None,
        instrument_id: Optional[int] = None,
        instrument_registration_number: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[VerificationApplication], int]:
        filters = []
        needs_instrument_join = bool(instrument_registration_number)

        if applicant_id is not None:
            filters.append(VerificationApplication.applicant_id == applicant_id)
        if application_number:
            filters.append(
                VerificationApplication.application_number.ilike(f"%{application_number.strip()}%")
            )
        if status is not None:
            filters.append(VerificationApplication.status == status)
        if application_type:
            filters.append(VerificationApplication.application_type.ilike(f"%{application_type.strip()}%"))
        if instrument_id is not None:
            filters.append(VerificationApplication.instrument_id == instrument_id)
        if instrument_registration_number:
            filters.append(
                Instrument.registration_number.ilike(f"%{instrument_registration_number.strip()}%")
            )
        if date_from:
            dt_from = datetime.combine(date_from, time.min)
            filters.append(VerificationApplication.created_at >= dt_from)
        if date_to:
            dt_to = datetime.combine(date_to, time.max)
            filters.append(VerificationApplication.created_at <= dt_to)

        count_stmt = select(func.count(VerificationApplication.id))
        if needs_instrument_join:
            count_stmt = count_stmt.join(Instrument, VerificationApplication.instrument_id == Instrument.id)
        if filters:
            count_stmt = count_stmt.where(*filters)
        total = db.execute(count_stmt).scalar_one()

        stmt = select(VerificationApplication)
        if needs_instrument_join:
            stmt = stmt.join(Instrument, VerificationApplication.instrument_id == Instrument.id)
        if filters:
            stmt = stmt.where(*filters)
        stmt = (
            stmt.order_by(VerificationApplication.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.execute(stmt).scalars().all())
        return items, total

    def list_by_applicant(
        self,
        db: Session,
        applicant_id: int,
        status: Optional[ApplicationStatus] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[VerificationApplication], int]:
        return self.search(
            db,
            applicant_id=applicant_id,
            status=status,
            skip=skip,
            limit=limit,
        )

    def list_all(
        self,
        db: Session,
        status: Optional[ApplicationStatus] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[VerificationApplication], int]:
        return self.search(
            db,
            status=status,
            skip=skip,
            limit=limit,
        )

    def create(
        self,
        db: Session,
        *,
        application_number: str,
        instrument_id: int,
        applicant_id: int,
        application_type: str,
        status: ApplicationStatus,
        remarks: Optional[str] = None,
        submitted_at: Optional[datetime] = None,
    ) -> VerificationApplication:
        application = VerificationApplication(
            application_number=application_number,
            instrument_id=instrument_id,
            applicant_id=applicant_id,
            application_type=application_type,
            status=status,
            remarks=remarks,
            submitted_at=submitted_at,
        )
        db.add(application)
        db.flush()
        return application

    def add_status_history(
        self,
        db: Session,
        *,
        application_id: int,
        from_status: Optional[ApplicationStatus],
        to_status: ApplicationStatus,
        changed_by_id: int,
        remarks: Optional[str] = None,
    ) -> ApplicationStatusHistory:
        history = ApplicationStatusHistory(
            application_id=application_id,
            from_status=from_status,
            to_status=to_status,
            changed_by_id=changed_by_id,
            remarks=remarks,
        )
        db.add(history)
        db.flush()
        return history


application_repository = ApplicationRepository()
