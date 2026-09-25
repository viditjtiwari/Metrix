from datetime import date
from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import InstrumentType


class FeeCalculationRequest(BaseModel):
    """Query parameters or body for statutory verification fee calculation."""
    instrument_type: InstrumentType
    capacity: Optional[str] = Field(
        None, description="Numeric capacity value or range string, e.g. '150' or '500kg'"
    )
    capacity_unit: Optional[str] = Field(
        None, description="Measurement unit (e.g. kg, g, tonne, l, ml)"
    )
    verification_type: str = Field(
        "INITIAL", description="INITIAL or RE_VERIFICATION"
    )
    previous_expiry_date: Optional[date] = Field(
        None, description="Expiry date of previous certificate (for late fee calculation)"
    )


class FeeCalculationResponse(BaseModel):
    """Statutory fee computation breakdown under Legal Metrology Rule 14."""
    instrument_type: InstrumentType
    base_fee: int = Field(..., description="Statutory base verification fee in INR")
    late_fee: int = Field(0, description="Late fee penalty under Rule 14(2) in INR")
    total_fee: int = Field(..., description="Total payable fee in INR")
    quarters_delayed: int = Field(0, description="Number of delayed quarters assessed")
    is_late: bool = Field(False, description="Whether late fee penalty applies")
    breakdown_notes: str = Field(..., description="Explanation of statutory fee calculation")
    currency: str = Field("INR", description="Currency code")
