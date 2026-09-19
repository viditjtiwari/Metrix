from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db, require_role
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.instrument import (
    InstrumentCreate,
    InstrumentListResponse,
    InstrumentResponse,
)
from app.services.instrument_service import instrument_service

router = APIRouter(prefix="/instruments", tags=["Instruments"])


@router.post(
    "",
    response_model=InstrumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Instrument",
)
def register_instrument(
    instrument_in: InstrumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.INSTRUMENT_OWNER, UserRole.ADMIN)
    ),
) -> InstrumentResponse:
    """Register a new weighing or measuring instrument under the authenticated owner."""
    instrument = instrument_service.register_instrument(
        db, instrument_data=instrument_in, owner_id=current_user.id
    )
    return InstrumentResponse.model_validate(instrument)


@router.get(
    "",
    response_model=InstrumentListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Instruments",
)
def list_instruments(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InstrumentListResponse:
    """List registered instruments (owners view only their own; officers view all)."""
    return instrument_service.list_instruments(
        db, current_user=current_user, page=page, page_size=page_size
    )


@router.get(
    "/{instrument_id}",
    response_model=InstrumentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Instrument Details",
)
def get_instrument(
    instrument_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InstrumentResponse:
    """Retrieve details of a registered instrument."""
    instrument = instrument_service.get_instrument(
        db, instrument_id=instrument_id, current_user=current_user
    )
    return InstrumentResponse.model_validate(instrument)
