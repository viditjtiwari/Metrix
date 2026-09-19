import random
import string
from datetime import datetime, timezone
from typing import Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.application import VerificationApplication
from app.models.enums import ApplicationStatus, UserRole
from app.models.user import User
from app.repositories.application_repository import application_repository
from app.repositories.instrument_repository import instrument_repository
from app.schemas.application import (
    ApplicationCreate,
    ApplicationListResponse,
    ApplicationResponse,
)

ALLOWED_TRANSITIONS: Dict[ApplicationStatus, List[ApplicationStatus]] = {
    ApplicationStatus.DRAFT: [ApplicationStatus.SUBMITTED],
    ApplicationStatus.SUBMITTED: [ApplicationStatus.UNDER_REVIEW],
    ApplicationStatus.UNDER_REVIEW: [
        ApplicationStatus.SCHEDULED,
        ApplicationStatus.REJECTED,
    ],
    ApplicationStatus.SCHEDULED: [ApplicationStatus.INSPECTION_IN_PROGRESS],
    ApplicationStatus.INSPECTION_IN_PROGRESS: [ApplicationStatus.INSPECTION_COMPLETED],
    ApplicationStatus.INSPECTION_COMPLETED: [
        ApplicationStatus.VERIFIED,
        ApplicationStatus.REJECTED,
    ],
    ApplicationStatus.VERIFIED: [ApplicationStatus.CERTIFICATE_ISSUED],
    ApplicationStatus.CERTIFICATE_ISSUED: [],
    ApplicationStatus.REJECTED: [],
}


class ApplicationService:
    """Service handling state transitions, validations, and auditing for applications."""

    def _generate_application_number(self) -> str:
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        rand_suffix = "".join(
            random.choices(string.ascii_uppercase + string.digits, k=4)
        )
        return f"APP-{date_str}-{rand_suffix}"

    def create_application(
        self, db: Session, app_data: ApplicationCreate, current_user: User
    ) -> VerificationApplication:
        instrument = instrument_repository.get_by_id(db, app_data.instrument_id)
        if not instrument:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Instrument with id {app_data.instrument_id} does not exist.",
            )

        # Applicant must own the instrument unless admin
        if current_user.role == UserRole.INSTRUMENT_OWNER and instrument.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only submit verification requests for instruments you own.",
            )

        now = datetime.now(timezone.utc)
        initial_status = (
            ApplicationStatus.SUBMITTED if app_data.submit_now else ApplicationStatus.DRAFT
        )
        submitted_at = now if app_data.submit_now else None

        for _ in range(5):
            app_num = self._generate_application_number()
            if not application_repository.get_by_application_number(db, app_num):
                break
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not generate unique application number.",
            )

        application = application_repository.create(
            db,
            application_number=app_num,
            instrument_id=instrument.id,
            applicant_id=current_user.id,
            application_type=app_data.application_type,
            status=initial_status,
            remarks=app_data.remarks,
            submitted_at=submitted_at,
        )

        # Record initial status history
        application_repository.add_status_history(
            db,
            application_id=application.id,
            from_status=None,
            to_status=initial_status,
            changed_by_id=current_user.id,
            remarks="Application created" + (" and submitted" if app_data.submit_now else " as draft"),
        )

        db.commit()
        db.refresh(application)
        return application

    def transition_status(
        self,
        db: Session,
        *,
        application_id: int,
        target_status: ApplicationStatus,
        current_user: User,
        remarks: Optional[str] = None,
    ) -> VerificationApplication:
        application = application_repository.get_by_id_with_history(db, application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id {application_id} not found.",
            )

        current_status = application.status
        allowed = ALLOWED_TRANSITIONS.get(current_status, [])
        if target_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Illegal state transition from {current_status.value} to {target_status.value}. "
                    f"Allowed next states: {[s.value for s in allowed]}"
                ),
            )

        # RBAC on transitions
        if target_status == ApplicationStatus.SUBMITTED:
            if current_user.role == UserRole.INSTRUMENT_OWNER and application.applicant_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the applicant can submit this application.",
                )
        elif target_status in [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REJECTED]:
            if current_user.role not in [UserRole.LMO, UserRole.ADMIN]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only Legal Metrology Officers or Administrators can review or reject applications.",
                )

        now = datetime.now(timezone.utc)
        application.status = target_status
        if target_status == ApplicationStatus.SUBMITTED and not application.submitted_at:
            application.submitted_at = now

        application_repository.add_status_history(
            db,
            application_id=application.id,
            from_status=current_status,
            to_status=target_status,
            changed_by_id=current_user.id,
            remarks=remarks,
        )

        db.commit()
        db.refresh(application)
        return application

    def get_application(
        self, db: Session, application_id: int, current_user: User
    ) -> VerificationApplication:
        application = application_repository.get_by_id_with_history(db, application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id {application_id} not found.",
            )

        if current_user.role == UserRole.INSTRUMENT_OWNER and application.applicant_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this application.",
            )

        return application

    def list_applications(
        self,
        db: Session,
        current_user: User,
        status_filter: Optional[ApplicationStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> ApplicationListResponse:
        skip = max(0, (page - 1) * page_size)

        if current_user.role == UserRole.INSTRUMENT_OWNER:
            items, total = application_repository.list_by_applicant(
                db,
                applicant_id=current_user.id,
                status=status_filter,
                skip=skip,
                limit=page_size,
            )
        else:
            items, total = application_repository.list_all(
                db, status=status_filter, skip=skip, limit=page_size
            )

        return ApplicationListResponse(
            items=[ApplicationResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
        )


application_service = ApplicationService()
