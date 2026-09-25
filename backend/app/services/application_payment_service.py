from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.application import VerificationApplication
from app.models.enums import ApplicationStatus, NotificationType, PaymentStatus, UserRole
from app.models.user import User
from app.repositories.application_repository import application_repository
from app.repositories.user_repository import user_repository
from app.schemas.application import (
    ClarificationRequestSubmit,
    ClarificationResponseSubmit,
    PaymentReceiptSubmit,
    PaymentVerificationSubmit,
)
from app.services.notification_service import notification_service


class ApplicationPaymentService:
    """Service handling statutory fee payments, challan verification, and clarification loops."""

    def upload_payment_receipt(
        self,
        db: Session,
        *,
        application_id: int,
        receipt_data: PaymentReceiptSubmit,
        current_user: User,
    ) -> VerificationApplication:
        app = application_repository.get_by_id_with_history(db, application_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id {application_id} not found.",
            )
        if current_user.role == UserRole.INSTRUMENT_OWNER and app.applicant_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only upload payment receipts for your own applications.",
            )

        now = datetime.now(timezone.utc)
        app.challan_reference_number = receipt_data.challan_reference_number
        app.challan_date = receipt_data.challan_date
        app.payment_receipt_url = receipt_data.payment_receipt_url
        app.calculated_fee = receipt_data.calculated_fee
        app.late_fee = receipt_data.late_fee
        app.total_fee = receipt_data.total_fee
        app.payment_status = PaymentStatus.UPLOADED
        app.payment_uploaded_at = now

        old_status = app.status
        app.status = ApplicationStatus.PAYMENT_UPLOADED

        application_repository.add_status_history(
            db,
            application_id=app.id,
            from_status=old_status,
            to_status=ApplicationStatus.PAYMENT_UPLOADED,
            changed_by_id=current_user.id,
            remarks=f"Payment receipt uploaded. Challan: {receipt_data.challan_reference_number}. Amount: ₹{receipt_data.total_fee}.",
        )

        officers = user_repository.list_by_roles(db, [UserRole.LMO, UserRole.ADMIN])
        for officer in officers:
            notification_service.send_notification(
                db,
                user_id=officer.id,
                type=NotificationType.APPLICATION_SUBMITTED,
                title="Payment Receipt Uploaded",
                message=f"Challan receipt uploaded for application {app.application_number} (₹{receipt_data.total_fee}). Ready for verification.",
                entity_type="APPLICATION",
                entity_id=app.id,
            )

        db.commit()
        db.refresh(app)
        return app

    def verify_payment(
        self,
        db: Session,
        *,
        application_id: int,
        verification_data: PaymentVerificationSubmit,
        current_user: User,
    ) -> VerificationApplication:
        if current_user.role not in [UserRole.LMO, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Legal Metrology Officers or Administrators can verify payment receipts.",
            )

        app = application_repository.get_by_id_with_history(db, application_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application {application_id} not found.",
            )

        now = datetime.now(timezone.utc)
        old_status = app.status

        if verification_data.is_verified:
            app.payment_status = PaymentStatus.VERIFIED
            app.payment_verified_at = now
            app.payment_verified_by_id = current_user.id
            app.payment_remarks = verification_data.remarks or "Payment verified by officer"
            app.status = ApplicationStatus.UNDER_REVIEW

            application_repository.add_status_history(
                db,
                application_id=app.id,
                from_status=old_status,
                to_status=ApplicationStatus.UNDER_REVIEW,
                changed_by_id=current_user.id,
                remarks=f"Payment verified (Challan: {app.challan_reference_number}). Application moved to Under Review.",
            )

            notification_service.send_notification(
                db,
                user_id=app.applicant_id,
                type=NotificationType.PAYMENT_VERIFIED,
                title="Payment Receipt Verified",
                message=f"Your challan receipt for application {app.application_number} has been verified.",
                entity_type="APPLICATION",
                entity_id=app.id,
            )
        else:
            app.payment_status = PaymentStatus.REJECTED
            app.payment_remarks = verification_data.remarks or "Payment challan rejected"
            app.status = ApplicationStatus.SUBMITTED

            application_repository.add_status_history(
                db,
                application_id=app.id,
                from_status=old_status,
                to_status=ApplicationStatus.SUBMITTED,
                changed_by_id=current_user.id,
                remarks=f"Payment challan rejected: {verification_data.remarks}",
            )

            notification_service.send_notification(
                db,
                user_id=app.applicant_id,
                type=NotificationType.PAYMENT_REJECTED,
                title="Payment Receipt Rejected",
                message=f"Challan receipt for application {app.application_number} was rejected: {verification_data.remarks}",
                entity_type="APPLICATION",
                entity_id=app.id,
            )

        db.commit()
        db.refresh(app)
        return app

    def request_clarification(
        self,
        db: Session,
        *,
        application_id: int,
        clarification_data: ClarificationRequestSubmit,
        current_user: User,
    ) -> VerificationApplication:
        if current_user.role not in [UserRole.LMO, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Legal Metrology Officers or Administrators can request clarifications.",
            )

        app = application_repository.get_by_id_with_history(db, application_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application {application_id} not found.",
            )

        if app.status != ApplicationStatus.UNDER_REVIEW:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Clarifications can only be requested when application is Under Review. Current status is {app.status.value}.",
            )

        app.status = ApplicationStatus.CLARIFICATION_ASKED
        application_repository.add_status_history(
            db,
            application_id=app.id,
            from_status=ApplicationStatus.UNDER_REVIEW,
            to_status=ApplicationStatus.CLARIFICATION_ASKED,
            changed_by_id=current_user.id,
            remarks=clarification_data.remarks,
        )

        notification_service.send_notification(
            db,
            user_id=app.applicant_id,
            type=NotificationType.CLARIFICATION_ASKED,
            title="Clarification Requested by Officer",
            message=f"Legal Metrology Officer requested clarification on application {app.application_number}: {clarification_data.remarks}",
            entity_type="APPLICATION",
            entity_id=app.id,
        )

        db.commit()
        db.refresh(app)
        return app

    def respond_clarification(
        self,
        db: Session,
        *,
        application_id: int,
        response_data: ClarificationResponseSubmit,
        current_user: User,
    ) -> VerificationApplication:
        app = application_repository.get_by_id_with_history(db, application_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application {application_id} not found.",
            )
        if current_user.role == UserRole.INSTRUMENT_OWNER and app.applicant_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only respond to clarifications for your own applications.",
            )

        if app.status != ApplicationStatus.CLARIFICATION_ASKED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Application is not awaiting clarification. Current status is {app.status.value}.",
            )

        app.status = ApplicationStatus.UNDER_REVIEW
        application_repository.add_status_history(
            db,
            application_id=app.id,
            from_status=ApplicationStatus.CLARIFICATION_ASKED,
            to_status=ApplicationStatus.UNDER_REVIEW,
            changed_by_id=current_user.id,
            remarks=f"Applicant response: {response_data.remarks}",
        )

        officers = user_repository.list_by_roles(db, [UserRole.LMO, UserRole.ADMIN])
        for officer in officers:
            notification_service.send_notification(
                db,
                user_id=officer.id,
                type=NotificationType.APPLICATION_SUBMITTED,
                title="Clarification Response Submitted",
                message=f"Applicant responded to clarification on {app.application_number}. Resumed review.",
                entity_type="APPLICATION",
                entity_id=app.id,
            )

        db.commit()
        db.refresh(app)
        return app


application_payment_service = ApplicationPaymentService()
