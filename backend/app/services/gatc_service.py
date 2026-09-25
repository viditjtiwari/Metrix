from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.enums import ApplicationStatus, InspectionResult, NotificationType, UserRole
from app.models.inspection import Inspection
from app.models.user import User
from app.repositories.application_repository import application_repository
from app.repositories.inspection_repository import inspection_repository
from app.repositories.user_repository import user_repository
from app.schemas.inspection import (
    GATCReportSubmit,
    InspectionDetailResponse,
    LMOApprovalUpdate,
    ObservationCreate,
)
from app.services.notification_service import notification_service
from app.services.observation_service import observation_service, to_detail_response


class GATCService:
    """Service handling specialized GATC laboratory calibrations and LMO endorsement reviews."""

    def submit_gatc_report(
        self,
        db: Session,
        *,
        inspection_id: int,
        report_data: GATCReportSubmit,
        current_user: User,
    ) -> InspectionDetailResponse:
        inspection = inspection_repository.get_by_id(db, inspection_id)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inspection with id {inspection_id} not found.",
            )

        if current_user.role != UserRole.ADMIN:
            if current_user.role != UserRole.GATC or inspection.assigned_to_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the assigned GATC test centre or administrator can submit calibration reports.",
                )

        now = datetime.now(timezone.utc)
        inspection.gatc_test_report_url = report_data.gatc_test_report_url
        inspection.gatc_recommendation = report_data.gatc_recommendation.upper()
        inspection.lmo_approval_status = "PENDING_LMO_REVIEW"
        inspection.completed_at = now

        # Add test observations if supplied
        if report_data.observations:
            for obs in report_data.observations:
                observation_service.add_observation(
                    db,
                    inspection_id=inspection.id,
                    observation_in=obs,
                    current_user=current_user,
                )

        app = inspection.application
        if app:
            old_status = app.status
            application_repository.add_status_history(
                db,
                application_id=app.id,
                from_status=old_status,
                to_status=old_status,
                changed_by_id=current_user.id,
                remarks=(
                    f"GATC test report submitted ({report_data.gatc_recommendation.upper()}). "
                    f"Awaiting Legal Metrology Officer review."
                ),
            )

        # Notify LMOs and Admins
        officers = user_repository.list_by_roles(db, [UserRole.LMO, UserRole.ADMIN])
        for officer in officers:
            notification_service.send_notification(
                db,
                user_id=officer.id,
                type=NotificationType.APPLICATION_SUBMITTED,
                title="🔬 GATC Calibration Report Submitted",
                message=(
                    f"GATC submitted test report for {app.application_number if app else 'inspection #' + str(inspection.id)} "
                    f"with recommendation: {report_data.gatc_recommendation.upper()}."
                ),
                entity_type="APPLICATION",
                entity_id=app.id if app else None,
            )

        db.commit()
        refreshed = inspection_repository.get_by_id(db, inspection.id)
        return to_detail_response(refreshed)

    def review_gatc_report(
        self,
        db: Session,
        *,
        inspection_id: int,
        review_data: LMOApprovalUpdate,
        current_user: User,
    ) -> InspectionDetailResponse:
        if current_user.role not in [UserRole.LMO, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Legal Metrology Officers or Administrators can review GATC calibration reports.",
            )

        inspection = inspection_repository.get_by_id(db, inspection_id)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inspection with id {inspection_id} not found.",
            )

        if not inspection.gatc_test_report_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No GATC test report has been uploaded for this inspection yet.",
            )

        review_status = review_data.lmo_approval_status.upper()
        inspection.lmo_approval_status = review_status
        inspection.lmo_approval_remarks = review_data.lmo_approval_remarks

        app = inspection.application
        if not app:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Application missing")

        old_status = app.status

        if review_status == "APPROVED":
            if inspection.gatc_recommendation == "CERTIFY":
                inspection.result = InspectionResult.VERIFIED
                app.status = ApplicationStatus.VERIFIED
                target_status = ApplicationStatus.VERIFIED
            else:
                inspection.result = InspectionResult.REJECTED
                app.status = ApplicationStatus.REJECTED
                target_status = ApplicationStatus.REJECTED

            application_repository.add_status_history(
                db,
                application_id=app.id,
                from_status=old_status,
                to_status=target_status,
                changed_by_id=current_user.id,
                remarks=f"LMO approved GATC report. {review_data.lmo_approval_remarks or ''}".strip(),
            )
        elif review_status == "REJECTED":
            inspection.result = InspectionResult.REJECTED
            app.status = ApplicationStatus.REJECTED
            application_repository.add_status_history(
                db,
                application_id=app.id,
                from_status=old_status,
                to_status=ApplicationStatus.REJECTED,
                changed_by_id=current_user.id,
                remarks=f"LMO rejected GATC calibration: {review_data.lmo_approval_remarks or ''}".strip(),
            )
        elif review_status == "CLARIFICATION_ASKED":
            app.status = ApplicationStatus.CLARIFICATION_ASKED
            application_repository.add_status_history(
                db,
                application_id=app.id,
                from_status=old_status,
                to_status=ApplicationStatus.CLARIFICATION_ASKED,
                changed_by_id=current_user.id,
                remarks=f"LMO requested clarification on GATC report: {review_data.lmo_approval_remarks or ''}".strip(),
            )

        # Notify GATC and Applicant
        notify_user_ids = [app.applicant_id]
        if inspection.assigned_to_id:
            notify_user_ids.append(inspection.assigned_to_id)

        for uid in set(notify_user_ids):
            notification_service.send_notification(
                db,
                user_id=uid,
                type=NotificationType.APPLICATION_VERIFIED if app.status == ApplicationStatus.VERIFIED else NotificationType.APPLICATION_REJECTED,
                title=f"GATC Report Decision: {review_status}",
                message=f"LMO decided on GATC report for {app.application_number}: {review_status}. {review_data.lmo_approval_remarks or ''}",
                entity_type="APPLICATION",
                entity_id=app.id,
            )

        db.commit()
        refreshed = inspection_repository.get_by_id(db, inspection.id)
        return to_detail_response(refreshed)


gatc_service = GATCService()
