from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload
from app.models.application import ApplicationStatusHistory, VerificationApplication
from app.models.enums import ApplicationStatus


class ApplicationRepository:
    """Repository handling database queries for verification applications and status history."""

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

    def list_by_applicant(
        self,
        db: Session,
        applicant_id: int,
        status: Optional[ApplicationStatus] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[VerificationApplication], int]:
        filters = [VerificationApplication.applicant_id == applicant_id]
        if status:
            filters.append(VerificationApplication.status == status)

        count_stmt = select(func.count(VerificationApplication.id)).where(*filters)
        total = db.execute(count_stmt).scalar_one()

        stmt = (
            select(VerificationApplication)
            .where(*filters)
            .order_by(VerificationApplication.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.execute(stmt).scalars().all())
        return items, total

    def list_all(
        self,
        db: Session,
        status: Optional[ApplicationStatus] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[VerificationApplication], int]:
        filters = []
        if status:
            filters.append(VerificationApplication.status == status)

        count_stmt = select(func.count(VerificationApplication.id))
        if filters:
            count_stmt = count_stmt.where(*filters)
        total = db.execute(count_stmt).scalar_one()

        stmt = select(VerificationApplication)
        if filters:
            stmt = stmt.where(*filters)
        stmt = (
            stmt.order_by(VerificationApplication.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.execute(stmt).scalars().all())
        return items, total

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
