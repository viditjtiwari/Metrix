from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_user
from app.models.enums import InstrumentType
from app.models.user import User
from app.schemas.fee import FeeCalculationResponse
from app.services.fee_service import fee_service

router = APIRouter(prefix="/fees", tags=["Statutory Fees"])


@router.get(
    "/calculate",
    response_model=FeeCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Statutory Verification & Late Fees (Rule 14)",
)
def calculate_statutory_fee(
    instrument_type: InstrumentType = Query(
        ..., description="Legal metrology instrument type"
    ),
    capacity: Optional[str] = Query(
        None, description="Nominal or max capacity, e.g. '150' or '500kg'"
    ),
    capacity_unit: Optional[str] = Query(
        None, description="Capacity unit, e.g. kg, tonne, litre"
    ),
    verification_type: str = Query(
        "INITIAL", description="INITIAL or RE_VERIFICATION"
    ),
    previous_expiry_date: Optional[date] = Query(
        None, description="Date previous certificate expired (for late fees)"
    ),
    current_user: User = Depends(get_current_user),
) -> FeeCalculationResponse:
    """Calculate statutory verification fee under Schedule XII and late fees under Rule 14(2)."""
    return fee_service.calculate_fees(
        instrument_type=instrument_type,
        capacity=capacity,
        capacity_unit=capacity_unit,
        verification_type=verification_type,
        previous_expiry_date=previous_expiry_date,
    )
