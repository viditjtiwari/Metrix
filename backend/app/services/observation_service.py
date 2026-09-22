from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.enums import ApplicationStatus, UserRole
from app.models.user import User
from app.repositories.inspection_repository import inspection_repository
from app.models.inspection import Inspection
from app.schemas.inspection import (
    InspectionDetailResponse,
    ObservationCreate,
    ObservationResponse,
)


def to_detail_response(inspection: Inspection) -> InspectionDetailResponse:
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


class ObservationService:
    """Service handling parameter observations recording and validation during inspections."""

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


observation_service = ObservationService()
