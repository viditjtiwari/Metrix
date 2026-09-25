import random
import string
from datetime import date, datetime, timezone
from typing import Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.application import VerificationApplication
from app.models.enums import ApplicationStatus, NotificationType, PaymentStatus, UserRole
from app.models.user import User
from app.repositories.application_repository import application_repository
from app.repositories.instrument_repository import instrument_repository
from app.repositories.user_repository import user_repository
from app.schemas.application import (
    ApplicationCreate,
    ApplicationDetailResponse,
    ApplicationListResponse,
    ApplicationResponse,
    ClarificationRequestSubmit,
    ClarificationResponseSubmit,
    PaymentReceiptSubmit,
    PaymentVerificationSubmit,
)
from app.services.notification_service import notification_service
from app.services.application_payment_service import application_payment_service

ALLOWED_TRANSITIONS: Dict[ApplicationStatus, List[ApplicationStatus]] = {
    ApplicationStatus.DRAFT: [ApplicationStatus.SUBMITTED],
    ApplicationStatus.SUBMITTED: [
        ApplicationStatus.PAYMENT_UPLOADED,
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.REJECTED,
    ],
    ApplicationStatus.PAYMENT_UPLOADED: [
        ApplicationStatus.PAYMENT_VERIFIED,
        ApplicationStatus.SUBMITTED,
        ApplicationStatus.REJECTED,
    ],
    ApplicationStatus.PAYMENT_VERIFIED: [
        ApplicationStatus.UNDER_REVIEW,
    ],
    ApplicationStatus.UNDER_REVIEW: [
        ApplicationStatus.SCHEDULED,
        ApplicationStatus.CLARIFICATION_ASKED,
        ApplicationStatus.REJECTED,
    ],
    ApplicationStatus.CLARIFICATION_ASKED: [
        ApplicationStatus.UNDER_REVIEW,
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
        if app_data.submit_now:
            notification_service.send_notification(
                db,
                user_id=current_user.id,
                type=NotificationType.APPLICATION_SUBMITTED,
                title="Application Submitted",
                message=f"Verification application {application.application_number} has been submitted.",
                entity_type="APPLICATION",
                entity_id=application.id,
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

        if target_status == ApplicationStatus.SUBMITTED:
            notification_service.send_notification(
                db,
                user_id=application.applicant_id,
                type=NotificationType.APPLICATION_SUBMITTED,
                title="Application Submitted",
                message=f"Verification application {application.application_number} has been submitted.",
                entity_type="APPLICATION",
                entity_id=application.id,
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

    def enrich_application_detail(
        self, application: VerificationApplication
    ) -> ApplicationDetailResponse:
        detail = ApplicationDetailResponse.model_validate(application)
        if application.applicant:
            detail.applicant_name = application.applicant.full_name
            detail.applicant_email = application.applicant.email
            if application.applicant.profile:
                detail.applicant_business_name = application.applicant.profile.business_name
                detail.applicant_phone = application.applicant.profile.contact_phone
        if application.instrument:
            detail.instrument_registration_number = application.instrument.registration_number
            detail.instrument_type = (
                application.instrument.instrument_type.value
                if hasattr(application.instrument.instrument_type, "value")
                else str(application.instrument.instrument_type)
            )
            detail.instrument_manufacturer = application.instrument.manufacturer
            detail.instrument_model = application.instrument.model_name
            detail.instrument_serial_number = application.instrument.serial_number
            detail.instrument_capacity = application.instrument.capacity
            detail.instrument_location = application.instrument.location
        return detail

    def get_application_detail(
        self, db: Session, application_id: int, current_user: User
    ) -> ApplicationDetailResponse:
        application = self.get_application(db, application_id, current_user)
        return self.enrich_application_detail(application)

    def list_applications(
        self,
        db: Session,
        current_user: User,
        status_filter: Optional[ApplicationStatus] = None,
        application_number: Optional[str] = None,
        application_type: Optional[str] = None,
        instrument_id: Optional[int] = None,
        instrument_registration_number: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> ApplicationListResponse:
        skip = max(0, (page - 1) * page_size)
        applicant_id = current_user.id if current_user.role == UserRole.INSTRUMENT_OWNER else None

        items, total = application_repository.search(
            db,
            applicant_id=applicant_id,
            application_number=application_number,
            status=status_filter,
            application_type=application_type,
            instrument_id=instrument_id,
            instrument_registration_number=instrument_registration_number,
            date_from=date_from,
            date_to=date_to,
            skip=skip,
            limit=page_size,
        )

        return ApplicationListResponse(
            items=[ApplicationResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    def delete_application(
        self, db: Session, application_id: int, current_user: User
    ) -> bool:
        app = self.get_application(db, application_id, current_user)
        if app.status != ApplicationStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only draft applications can be deleted. Current status is {app.status.value}.",
            )
        if current_user.role == UserRole.INSTRUMENT_OWNER and app.applicant_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this application.",
            )
        success = application_repository.delete(db, application_id)
        db.commit()
        return success

    def upload_payment_receipt(
        self,
        db: Session,
        *,
        application_id: int,
        receipt_data: PaymentReceiptSubmit,
        current_user: User,
    ) -> VerificationApplication:
        return application_payment_service.upload_payment_receipt(
            db,
            application_id=application_id,
            receipt_data=receipt_data,
            current_user=current_user,
        )

    def verify_payment(
        self,
        db: Session,
        *,
        application_id: int,
        verification_data: PaymentVerificationSubmit,
        current_user: User,
    ) -> VerificationApplication:
        return application_payment_service.verify_payment(
            db,
            application_id=application_id,
            verification_data=verification_data,
            current_user=current_user,
        )

    def request_clarification(
        self,
        db: Session,
        *,
        application_id: int,
        clarification_data: ClarificationRequestSubmit,
        current_user: User,
    ) -> VerificationApplication:
        return application_payment_service.request_clarification(
            db,
            application_id=application_id,
            clarification_data=clarification_data,
            current_user=current_user,
        )

    def respond_clarification(
        self,
        db: Session,
        *,
        application_id: int,
        response_data: ClarificationResponseSubmit,
        current_user: User,
    ) -> VerificationApplication:
        return application_payment_service.respond_clarification(
            db,
            application_id=application_id,
            response_data=response_data,
            current_user=current_user,
        )


application_service = ApplicationService()
