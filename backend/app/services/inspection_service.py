from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.enums import ApplicationStatus, InspectionResult, NotificationType, UserRole
from app.models.inspection import Inspection, InspectionObservation
from app.models.user import User
from app.repositories.application_repository import application_repository
from app.repositories.inspection_repository import inspection_repository
from app.repositories.user_repository import user_repository
from app.services.notification_service import notification_service
from app.schemas.inspection import (
    AssignmentRequest,
    InspectionDetailResponse,
    InspectionResponse,
    InspectionResultUpdate,
    ObservationCreate,
    ObservationResponse,
    ScheduleRequest,
)


class InspectionService:
    """Service orchestrating scheduling, verifier assignment, inspection execution,

    parameter observations, and verification outcomes for applications.
    """

    def _to_detail_response(self, inspection: Inspection) -> InspectionDetailResponse:
        observations_data = [
            ObservationResponse.model_validate(obs) for obs in inspection.observations
        ]
        assigned_to_name = (
            inspection.assigned_to.full_name if inspection.assigned_to else None
        )
        assigned_to_role = (
            inspection.assigned_to.role.value if inspection.assigned_to else None
        )
        return InspectionDetailResponse(
            id=inspection.id,
            application_id=inspection.application_id,
            assigned_to_id=inspection.assigned_to_id,
            scheduled_date=inspection.scheduled_date,
            scheduled_time=inspection.scheduled_time,
            inspection_location=inspection.inspection_location,
            scheduling_remarks=inspection.scheduling_remarks,
            started_at=inspection.started_at,
            completed_at=inspection.completed_at,
            result=inspection.result,
            result_remarks=inspection.result_remarks,
            created_at=inspection.created_at,
            updated_at=inspection.updated_at,
            observations=observations_data,
            assigned_to_name=assigned_to_name,
            assigned_to_role=assigned_to_role,
        )

    def schedule_inspection(
        self,
        db: Session,
        *,
        application_id: int,
        schedule_data: ScheduleRequest,
        current_user: User,
    ) -> InspectionDetailResponse:
        if current_user.role not in [UserRole.LMO, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Legal Metrology Officers or Administrators can schedule inspections.",
            )

        application = application_repository.get_by_id_with_history(db, application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id {application_id} not found.",
            )

        if application.status not in [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.SCHEDULED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot schedule an application in '{application.status.value}' status. Must be UNDER_REVIEW.",
            )

        assigned_to_id = schedule_data.assigned_to_id
        if assigned_to_id is not None:
            target_user = user_repository.get_by_id(db, assigned_to_id)
            if not target_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Assigned verifier with id {assigned_to_id} does not exist.",
                )
            if target_user.role not in [UserRole.LMO, UserRole.GATC]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assigned verifier must be a Legal Metrology Officer (LMO) or Government Approved Test Centre (GATC).",
                )

        inspection = inspection_repository.create_or_update_scheduling(
            db,
            application_id=application_id,
            scheduled_date=schedule_data.scheduled_date,
            scheduled_time=schedule_data.scheduled_time,
            inspection_location=schedule_data.inspection_location,
            scheduling_remarks=schedule_data.scheduling_remarks,
            assigned_to_id=assigned_to_id,
        )

        # Transition application status if currently UNDER_REVIEW
        if application.status == ApplicationStatus.UNDER_REVIEW:
            application.status = ApplicationStatus.SCHEDULED
            application_repository.add_status_history(
                db,
                application_id=application.id,
                from_status=ApplicationStatus.UNDER_REVIEW,
                to_status=ApplicationStatus.SCHEDULED,
                changed_by_id=current_user.id,
                remarks=f"Inspection scheduled for {schedule_data.scheduled_date} at {schedule_data.scheduled_time or 'TBD'}",
            )

        notification_service.send_notification(
            db,
            user_id=application.applicant_id,
            type=NotificationType.APPLICATION_SCHEDULED,
            title="Inspection Scheduled",
            message=f"Inspection for application {application.application_number} has been scheduled for {schedule_data.scheduled_date}.",
            entity_type="APPLICATION",
            entity_id=application.id,
        )
        if assigned_to_id:
            notification_service.send_notification(
                db,
                user_id=assigned_to_id,
                type=NotificationType.INSPECTION_ASSIGNED,
                title="Inspection Assigned",
                message=f"You have been assigned to inspect application {application.application_number}.",
                entity_type="APPLICATION",
                entity_id=application.id,
            )

        db.commit()
        refreshed = inspection_repository.get_by_id(db, inspection.id)
        return self._to_detail_response(refreshed)

    def assign_verifier(
        self,
        db: Session,
        *,
        application_id: int,
        assignment_data: AssignmentRequest,
        current_user: User,
    ) -> InspectionDetailResponse:
        if current_user.role not in [UserRole.LMO, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Legal Metrology Officers or Administrators can assign verifiers.",
            )

        application = application_repository.get_by_id_with_history(db, application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id {application_id} not found.",
            )

        if application.status in [ApplicationStatus.DRAFT, ApplicationStatus.VERIFIED, ApplicationStatus.REJECTED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot assign verifier when application is in '{application.status.value}' status.",
            )

        target_user = user_repository.get_by_id(db, assignment_data.assigned_to_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {assignment_data.assigned_to_id} not found.",
            )
        if target_user.role not in [UserRole.LMO, UserRole.GATC]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned verifier must have role LMO or GATC.",
            )

        inspection = inspection_repository.get_by_application_id(db, application_id)
        if not inspection:
            inspection = inspection_repository.create_or_update_scheduling(
                db,
                application_id=application_id,
                scheduled_date=None,
                scheduled_time=None,
                inspection_location=None,
                scheduling_remarks=None,
                assigned_to_id=target_user.id,
            )
        else:
            inspection = inspection_repository.update_assignment(
                db, inspection=inspection, assigned_to_id=target_user.id
            )

        application_repository.add_status_history(
            db,
            application_id=application.id,
            from_status=application.status,
            to_status=application.status,
            changed_by_id=current_user.id,
            remarks=f"Verifier assigned to {target_user.full_name} ({target_user.role.value})",
        )

        notification_service.send_notification(
            db,
            user_id=target_user.id,
            type=NotificationType.INSPECTION_ASSIGNED,
            title="Inspection Assigned",
            message=f"You have been assigned to verify application {application.application_number}.",
            entity_type="APPLICATION",
            entity_id=application.id,
        )

        db.commit()
        refreshed = inspection_repository.get_by_id(db, inspection.id)
        return self._to_detail_response(refreshed)

    def start_inspection(
        self,
        db: Session,
        *,
        application_id: int,
        current_user: User,
    ) -> InspectionDetailResponse:
        application = application_repository.get_by_id_with_history(db, application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id {application_id} not found.",
            )

        if application.status != ApplicationStatus.SCHEDULED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Inspection can only start when application is SCHEDULED (currently '{application.status.value}').",
            )

        inspection = inspection_repository.get_by_application_id(db, application_id)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inspection record not found for this scheduled application.",
            )

        # RBAC: Verifier assigned, or LMO, or ADMIN
        if current_user.role == UserRole.INSTRUMENT_OWNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Instrument owners cannot start inspections.",
            )
        if current_user.role == UserRole.GATC and inspection.assigned_to_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="GATC users can only start inspections explicitly assigned to them.",
            )

        now = datetime.now(timezone.utc)
        inspection_repository.start_inspection(db, inspection=inspection, started_at=now)

        application.status = ApplicationStatus.INSPECTION_IN_PROGRESS
        application_repository.add_status_history(
            db,
            application_id=application.id,
            from_status=ApplicationStatus.SCHEDULED,
            to_status=ApplicationStatus.INSPECTION_IN_PROGRESS,
            changed_by_id=current_user.id,
            remarks="Inspection started and testing observations in progress",
        )

        db.commit()
        refreshed = inspection_repository.get_by_id(db, inspection.id)
        return self._to_detail_response(refreshed)

    def get_inspection_by_application(
        self,
        db: Session,
        *,
        application_id: int,
        current_user: User,
    ) -> InspectionDetailResponse:
        application = application_repository.get_by_id_with_history(db, application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id {application_id} not found.",
            )

        if current_user.role == UserRole.INSTRUMENT_OWNER and application.applicant_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view inspection for this application.",
            )

        inspection = inspection_repository.get_by_application_id(db, application_id)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inspection record not found for application {application_id}.",
            )

        if current_user.role == UserRole.GATC and inspection.assigned_to_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access inspections assigned to your centre.",
            )

        return self._to_detail_response(inspection)

    def add_observation(
        self,
        db: Session,
        *,
        inspection_id: int,
        observation_in: ObservationCreate,
        current_user: User,
    ) -> ObservationResponse:
        inspection = inspection_repository.get_by_id(db, inspection_id)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inspection with id {inspection_id} not found.",
            )

        if current_user.role == UserRole.INSTRUMENT_OWNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Instrument owners cannot record observations.",
            )

        if current_user.role == UserRole.GATC and inspection.assigned_to_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only record observations for inspections assigned to you.",
            )

        if inspection.application.status != ApplicationStatus.INSPECTION_IN_PROGRESS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Observations can only be recorded when INSPECTION_IN_PROGRESS (current: '{inspection.application.status.value}').",
            )

        obs = inspection_repository.add_observation(
            db,
            inspection_id=inspection_id,
            parameter_name=observation_in.parameter_name.strip(),
            observed_value=observation_in.observed_value.strip(),
            standard_value=observation_in.standard_value.strip() if observation_in.standard_value else None,
            unit=observation_in.unit.strip() if observation_in.unit else None,
            is_passed=observation_in.is_passed,
            remarks=observation_in.remarks.strip() if observation_in.remarks else None,
        )
        db.commit()
        db.refresh(obs)
        return ObservationResponse.model_validate(obs)

    def list_observations(
        self,
        db: Session,
        *,
        inspection_id: int,
        current_user: User,
    ) -> List[ObservationResponse]:
        inspection = inspection_repository.get_by_id(db, inspection_id)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inspection with id {inspection_id} not found.",
            )

        if current_user.role == UserRole.INSTRUMENT_OWNER and inspection.application.applicant_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view observations for this inspection.",
            )

        observations = inspection_repository.list_observations(db, inspection_id)
        return [ObservationResponse.model_validate(obs) for obs in observations]

    def record_result(
        self,
        db: Session,
        *,
        inspection_id: int,
        result_in: InspectionResultUpdate,
        current_user: User,
    ) -> InspectionDetailResponse:
        inspection = inspection_repository.get_by_id(db, inspection_id)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inspection with id {inspection_id} not found.",
            )

        if current_user.role == UserRole.INSTRUMENT_OWNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Instrument owners cannot record inspection results.",
            )

        if current_user.role == UserRole.GATC and inspection.assigned_to_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only submit results for inspections assigned to you.",
            )

        application = inspection.application
        if application.status != ApplicationStatus.INSPECTION_IN_PROGRESS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Inspection result can only be submitted when INSPECTION_IN_PROGRESS (current: '{application.status.value}').",
            )

        now = datetime.now(timezone.utc)
        inspection_repository.complete_inspection(
            db,
            inspection=inspection,
            result=result_in.result,
            completed_at=now,
            result_remarks=result_in.remarks,
        )

        # 1. Advance through INSPECTION_COMPLETED
        application_repository.add_status_history(
            db,
            application_id=application.id,
            from_status=ApplicationStatus.INSPECTION_IN_PROGRESS,
            to_status=ApplicationStatus.INSPECTION_COMPLETED,
            changed_by_id=current_user.id,
            remarks="Inspection tests completed",
        )

        # 2. Advance to final result (VERIFIED or REJECTED)
        final_status = (
            ApplicationStatus.VERIFIED
            if result_in.result == InspectionResult.VERIFIED
            else ApplicationStatus.REJECTED
        )
        application.status = final_status
        application_repository.add_status_history(
            db,
            application_id=application.id,
            from_status=ApplicationStatus.INSPECTION_COMPLETED,
            to_status=final_status,
            changed_by_id=current_user.id,
            remarks=result_in.remarks or f"Verification decision: {result_in.result.value}",
        )

        notification_service.send_notification(
            db,
            user_id=application.applicant_id,
            type=NotificationType.INSPECTION_COMPLETED,
            title="Inspection Completed",
            message=f"Inspection tests completed for application {application.application_number}.",
            entity_type="APPLICATION",
            entity_id=application.id,
        )

        decision_type = (
            NotificationType.APPLICATION_VERIFIED
            if final_status == ApplicationStatus.VERIFIED
            else NotificationType.APPLICATION_REJECTED
        )
        decision_title = (
            "Application Verified"
            if final_status == ApplicationStatus.VERIFIED
            else "Application Rejected"
        )
        notification_service.send_notification(
            db,
            user_id=application.applicant_id,
            type=decision_type,
            title=decision_title,
            message=f"Verification decision for application {application.application_number}: {final_status.value}.",
            entity_type="APPLICATION",
            entity_id=application.id,
        )

        db.commit()
        refreshed = inspection_repository.get_by_id(db, inspection.id)
        return self._to_detail_response(refreshed)


inspection_service = InspectionService()
