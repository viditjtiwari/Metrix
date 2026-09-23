from typing import Optional
from fastapi import APIRouter, Depends, File, Query, Response, UploadFile, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db, require_role
from app.models.enums import InstrumentType, UserRole
from app.models.user import User
from app.schemas.instrument import (
    BatchInstrumentUploadResponse,
    InstrumentCreate,
    InstrumentListResponse,
    InstrumentResponse,
    InstrumentUpdate,
)
from app.services.instrument_batch_service import instrument_batch_service
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
        require_role(UserRole.INSTRUMENT_OWNER)
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
    summary="List and Search Instruments",
)
def list_instruments(
    registration_number: Optional[str] = Query(None, description="Filter by registration number"),
    serial_number: Optional[str] = Query(None, description="Filter by serial number"),
    instrument_type: Optional[InstrumentType] = Query(None, description="Filter by instrument type"),
    manufacturer: Optional[str] = Query(None, description="Filter by manufacturer"),
    location: Optional[str] = Query(None, description="Filter by location"),
    owner_id: Optional[int] = Query(None, description="Filter by owner ID (Admin/LMO only)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InstrumentListResponse:
    """List registered instruments with optional search filters (owners view only their own)."""
    return instrument_service.list_instruments(
        db,
        current_user=current_user,
        registration_number=registration_number,
        serial_number=serial_number,
        instrument_type=instrument_type,
        manufacturer=manufacturer,
        location=location,
        owner_id=owner_id,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/csv-template",
    status_code=status.HTTP_200_OK,
    summary="Download Batch Instrument CSV Template",
)
def download_csv_template() -> Response:
    """Download standard CSV template for bulk instrument registration."""
    csv_data = instrument_batch_service.get_sample_csv_template()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="metrix_instruments_template.csv"'},
    )


@router.post(
    "/batch-upload",
    response_model=BatchInstrumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Batch Register Instruments via CSV",
)
def batch_upload_instruments(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUMENT_OWNER, UserRole.ADMIN)),
) -> BatchInstrumentUploadResponse:
    """Upload CSV file to batch-register multiple instruments at once."""
    return instrument_batch_service.process_csv_upload(db, file=file, current_user=current_user)


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


@router.patch(
    "/{instrument_id}",
    response_model=InstrumentResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Instrument Details",
)
def update_instrument(
    instrument_id: int,
    instrument_in: InstrumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InstrumentResponse:
    """Update details of a registered instrument (location, capacity, model name)."""
    instrument = instrument_service.update_instrument(
        db,
        instrument_id=instrument_id,
        update_data=instrument_in,
        current_user=current_user,
    )
    return InstrumentResponse.model_validate(instrument)


@router.patch(
    "/{instrument_id}/deactivate",
    response_model=InstrumentResponse,
    status_code=status.HTTP_200_OK,
    summary="Deactivate Instrument",
)
def deactivate_instrument(
    instrument_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InstrumentResponse:
    """Deactivate an instrument from the active registry."""
    instrument = instrument_service.deactivate_instrument(
        db, instrument_id=instrument_id, current_user=current_user
    )
    return InstrumentResponse.model_validate(instrument)

