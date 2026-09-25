"""Statutory Fee Calculation Service per Legal Metrology (General) Rules, 2011.

Implements Rule 14 and Schedule XII fee schedules across instrument types and
capacity tiers, plus Rule 14(2) late fee calculations (50% per delayed quarter).
"""
import math
import re
from datetime import date, datetime, timezone
from typing import Optional, Tuple

from app.models.enums import InstrumentType
from app.schemas.fee import FeeCalculationResponse


# Tiered base fees for weighing instruments (in kg)
WEIGHING_CAPACITY_TIERS: list[Tuple[float, int]] = [
    (50.0, 100),       # Up to 50 kg -> ₹100
    (500.0, 200),      # 51 kg to 500 kg -> ₹200
    (1000.0, 400),     # 501 kg to 1,000 kg (1 tonne) -> ₹400
    (5000.0, 1000),    # 1,001 kg to 5,000 kg (5 tonne) -> ₹1,000
    (float("inf"), 2500),  # Above 5 tonne (Weighbridges) -> ₹2,500
]

# Fixed statutory fee mapping for specific instrument categories
FIXED_FEE_BY_TYPE: dict[InstrumentType, int] = {
    # Precision / Laboratory
    InstrumentType.ANALYTICAL_BALANCE: 500,
    InstrumentType.MICRO_BALANCE: 500,
    InstrumentType.PRECISION_BALANCE: 500,
    # Medical
    InstrumentType.MEDICAL_BABY_SCALE: 100,
    InstrumentType.HOSPITAL_SCALE: 150,
    InstrumentType.BMI_SCALE: 100,
    # Fuel & Dispensing
    InstrumentType.PETROL_DISPENSER: 1000,
    InstrumentType.DIESEL_DISPENSER: 1000,
    InstrumentType.CNG_DISPENSER: 1000,
    InstrumentType.LPG_DISPENSER: 1000,
    InstrumentType.AIRCRAFT_FUEL_DISPENSER: 2500,
    # Flow & Custody
    InstrumentType.FLOW_METER: 2000,
    InstrumentType.CORIOLIS_FLOW_METER: 2500,
    InstrumentType.ULTRASONIC_FLOW_METER: 2500,
    InstrumentType.CUSTODY_TRANSFER_METER: 3000,
    InstrumentType.WATER_METER: 50,
    InstrumentType.GAS_METER: 50,
    # Volume & Bulk
    InstrumentType.TANK_LORRY: 2500,
    InstrumentType.STORAGE_TANK: 2500,
    # Length & Area
    InstrumentType.LENGTH_MEASURE: 50,
    InstrumentType.TAPE_MEASURE: 50,
    InstrumentType.AREA_MEASURING_DEVICE: 100,
    # Speed & Fare
    InstrumentType.SPEEDOMETER: 100,
    InstrumentType.TAXIMETER: 150,
    InstrumentType.AUTO_FARE_METER: 150,
    InstrumentType.FARE_METER: 150,
    # Energy
    InstrumentType.ENERGY_METER: 100,
    # Specialized
    InstrumentType.COUNTER_MACHINE: 100,
    InstrumentType.CLINICAL_THERMOMETER: 20,
    InstrumentType.RADIATION_METER: 500,
    InstrumentType.BREATH_ALCOHOL_ANALYZER: 500,
    InstrumentType.GRAIN_MOISTURE_METER: 300,
    # Large Weighing
    InstrumentType.WEIGHBRIDGE: 2500,
    InstrumentType.RAILWAY_WEIGHBRIDGE: 3500,
    InstrumentType.CRANE_SCALE: 1000,
    # Fallback
    InstrumentType.OTHER: 100,
}


def _extract_numeric_capacity(capacity_str: Optional[str]) -> Optional[float]:
    """Parse numeric capacity from string like '500', '150kg', '0 - 500 kg'."""
    if not capacity_str:
        return None
    cleaned = capacity_str.replace(",", "").strip()
    # Match the last number (e.g. max capacity in range)
    matches = re.findall(r"([0-9]+(?:\.[0-9]+)?)", cleaned)
    if not matches:
        return None
    try:
        return float(matches[-1])
    except ValueError:
        return None


def _normalize_to_kg(capacity_val: float, unit: Optional[str]) -> float:
    """Normalize capacity to kilograms for standardized tier lookup."""
    u = (unit or "kg").lower().strip()
    if u in ("g", "gram", "grams"):
        return capacity_val / 1000.0
    if u in ("mg", "milligram"):
        return capacity_val / 1000000.0
    if u in ("t", "tonne", "tonnes", "ton", "tons"):
        return capacity_val * 1000.0
    if u in ("quintal", "q"):
        return capacity_val * 100.0
    return capacity_val


class FeeService:
    """Service to compute statutory verification fees and late penalties under Rule 14."""

    def determine_base_fee(
        self,
        instrument_type: InstrumentType,
        capacity: Optional[str] = None,
        capacity_unit: Optional[str] = None,
    ) -> Tuple[int, str]:
        """Determine base verification fee under Schedule XII."""
        # 1. Check fixed fee table
        if instrument_type in FIXED_FEE_BY_TYPE:
            base = FIXED_FEE_BY_TYPE[instrument_type]
            note = f"Schedule XII statutory fee for {instrument_type.value.replace('_', ' ').title()}: ₹{base}."
            return base, note

        # 2. General weighing instrument tiers (by capacity)
        raw_num = _extract_numeric_capacity(capacity)
        if raw_num is not None:
            norm_kg = _normalize_to_kg(raw_num, capacity_unit)
            for threshold, fee in WEIGHING_CAPACITY_TIERS:
                if norm_kg <= threshold:
                    note = f"Schedule XII Tier: Capacity {norm_kg:g} kg (threshold <= {threshold:g} kg) -> ₹{fee}."
                    return fee, note

        # Default fallback
        return 100, f"Standard base fee for {instrument_type.value}: ₹100."

    def calculate_late_fee(
        self,
        base_fee: int,
        previous_expiry_date: Optional[date],
        current_date: Optional[date] = None,
    ) -> Tuple[int, int, str]:
        """Calculate Rule 14(2) late fee: 50% surcharge per delayed quarter.
        
        Grace period: If application is submitted in the same quarter as expiry,
        quarters_delayed is 0 and no penalty is assessed.
        """
        if not previous_expiry_date:
            return 0, 0, "No previous certificate expiry provided. Zero late fee assessed."

        today = current_date or datetime.now(timezone.utc).date()
        if today <= previous_expiry_date:
            return 0, 0, "Application submitted prior to certificate expiry. Zero late fee assessed."

        # Compute calendar quarter difference
        exp_q = (previous_expiry_date.month - 1) // 3
        curr_q = (today.month - 1) // 3
        quarters_diff = (today.year - previous_expiry_date.year) * 4 + (curr_q - exp_q)

        if quarters_diff <= 0:
            return 0, 0, "Within same calendar quarter grace period (Rule 14). Zero late fee."

        # 50% surcharge per quarter delayed
        penalty_per_quarter = int(math.ceil(base_fee * 0.5))
        total_late = penalty_per_quarter * quarters_diff
        note = (
            f"Rule 14(2) Late Penalty: {quarters_diff} quarter(s) overdue from {previous_expiry_date}. "
            f"Surcharge: 50% of base fee (₹{penalty_per_quarter}) × {quarters_diff} = ₹{total_late}."
        )
        return total_late, quarters_diff, note

    def calculate_fees(
        self,
        instrument_type: InstrumentType,
        capacity: Optional[str] = None,
        capacity_unit: Optional[str] = None,
        verification_type: str = "INITIAL",
        previous_expiry_date: Optional[date] = None,
        current_date: Optional[date] = None,
    ) -> FeeCalculationResponse:
        """Full statutory fee computation."""
        base_fee, base_note = self.determine_base_fee(
            instrument_type=instrument_type,
            capacity=capacity,
            capacity_unit=capacity_unit,
        )

        late_fee = 0
        quarters_delayed = 0
        late_note = ""

        if verification_type.upper() == "RE_VERIFICATION" and previous_expiry_date:
            late_fee, quarters_delayed, late_note = self.calculate_late_fee(
                base_fee=base_fee,
                previous_expiry_date=previous_expiry_date,
                current_date=current_date,
            )

        total_fee = base_fee + late_fee
        notes = f"{base_note} {late_note}".strip()

        return FeeCalculationResponse(
            instrument_type=instrument_type,
            base_fee=base_fee,
            late_fee=late_fee,
            total_fee=total_fee,
            quarters_delayed=quarters_delayed,
            is_late=late_fee > 0,
            breakdown_notes=notes,
            currency="INR",
        )


fee_service = FeeService()
