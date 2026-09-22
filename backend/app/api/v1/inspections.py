from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db, require_role
from app.models.enums import InspectionResult, UserRole
from app.models.user import User
from app.repositories.inspection_repository import inspection_repository
from app.repositories.user_repository import user_repository
from app.schemas.auth import UserResponse
from app.schemas.inspection import (
    InspectionDetailResponse,
    InspectionListResponse,
    InspectionResultUpdate,
    ObservationCreate,
    ObservationResponse,
)
from app.services.inspection_service import inspection_service

router = APIRouter(prefix="/inspections", tags=["Inspections"])


@router.get(
    "",
    response_model=InspectionListResponse,
    status_code=status.HTTP_200_OK,
    summary="List and Filter Inspections",
)
def list_inspections(
    verifier_id: Optional[int] = Query(None, description="Filter by assigned verifier"),
    application_id: Optional[int] = Query(None, description="Filter by application ID"),
    result: Optional[InspectionResult] = Query(None, description="Filter by outcome (VERIFIED, REJECTED)"),
    scheduled_date_from: Optional[date] = Query(None, description="Scheduled on/after (YYYY-MM-DD)"),
    scheduled_date_to: Optional[date] = Query(None, description="Scheduled on/before (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.LMO, UserRole.GATC, UserRole.ADMIN)),
) -> InspectionListResponse:
    """Retrieve inspections queue with date and status filters (LMO/GATC/Admin)."""
    return inspection_service.list_inspections(
        db,
        current_user=current_user,
        verifier_id=verifier_id,
        application_id=application_id,
        result=result,
        scheduled_date_from=scheduled_date_from,
        scheduled_date_to=scheduled_date_to,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/verifiers",
    response_model=List[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="List Available Verifiers (LMO & GATC)",
)
def list_verifiers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.LMO, UserRole.ADMIN)),
) -> List[UserResponse]:
    """Retrieve list of active officers (LMO) and test centres (GATC) available for assignment."""
    verifiers = user_repository.list_by_roles(db, [UserRole.LMO, UserRole.GATC])
    return [UserResponse.model_validate(v) for v in verifiers]


@router.get(
    "/{inspection_id}",
    response_model=InspectionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Inspection Details",
)
def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InspectionDetailResponse:
    """Retrieve detailed inspection record by ID."""
    inspection = inspection_repository.get_by_id(db, inspection_id)
    if not inspection:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with id {inspection_id} not found.",
        )
    return inspection_service._to_detail_response(inspection)


@router.post(
    "/{inspection_id}/observations",
    response_model=ObservationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record Inspection Observation",
)
def add_observation(
    inspection_id: int,
    obs_in: ObservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ObservationResponse:
    """Record a test observation parameter and result during inspection."""
    return inspection_service.add_observation(
        db,
        inspection_id=inspection_id,
        observation_in=obs_in,
        current_user=current_user,
    )


@router.get(
    "/{inspection_id}/observations",
    response_model=List[ObservationResponse],
    status_code=status.HTTP_200_OK,
    summary="List Inspection Observations",
)
def list_observations(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[ObservationResponse]:
    """List all recorded parameter observations for an inspection."""
    return inspection_service.list_observations(
        db,
        inspection_id=inspection_id,
        current_user=current_user,
    )


@router.patch(
    "/{inspection_id}/result",
    response_model=InspectionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Record Final Inspection Result",
)
def record_result(
    inspection_id: int,
    result_in: InspectionResultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InspectionDetailResponse:
    """Record final verification determination (VERIFIED or REJECTED) and advance application lifecycle."""
    return inspection_service.record_result(
        db,
        inspection_id=inspection_id,
        result_in=result_in,
        current_user=current_user,
    )
