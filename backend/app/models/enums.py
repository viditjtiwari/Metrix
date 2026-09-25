import enum
from typing import FrozenSet


class UserRole(str, enum.Enum):
    """System actor roles for RBAC."""
    ADMIN = "ADMIN"
    LMO = "LMO"
    GATC = "GATC"
    INSTRUMENT_OWNER = "INSTRUMENT_OWNER"


class AuthProvider(str, enum.Enum):
    """Authentication provider for user accounts."""
    LOCAL = "local"
    GOOGLE = "google"


class ApplicationStatus(str, enum.Enum):
    """Legal metrology verification application workflow statuses.

    Full lifecycle: DRAFT → SUBMITTED → PAYMENT_UPLOADED → PAYMENT_VERIFIED
    → UNDER_REVIEW → (CLARIFICATION_ASKED → UNDER_REVIEW) → SCHEDULED
    → INSPECTION_IN_PROGRESS → INSPECTION_COMPLETED → VERIFIED
    → CERTIFICATE_ISSUED | REJECTED
    """
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    PAYMENT_UPLOADED = "PAYMENT_UPLOADED"
    PAYMENT_VERIFIED = "PAYMENT_VERIFIED"
    UNDER_REVIEW = "UNDER_REVIEW"
    CLARIFICATION_ASKED = "CLARIFICATION_ASKED"
    SCHEDULED = "SCHEDULED"
    INSPECTION_IN_PROGRESS = "INSPECTION_IN_PROGRESS"
    INSPECTION_COMPLETED = "INSPECTION_COMPLETED"
    VERIFIED = "VERIFIED"
    CERTIFICATE_ISSUED = "CERTIFICATE_ISSUED"
    REJECTED = "REJECTED"


class PaymentStatus(str, enum.Enum):
    """Payment tracking for manual challan-based fee collection."""
    PENDING = "PENDING"
    UPLOADED = "UPLOADED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class InspectionResult(str, enum.Enum):
    """Verification inspection outcome."""
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class InspectionMode(str, enum.Enum):
    """Whether inspection is field-based (LMO) or laboratory (GATC)."""
    LMO_FIELD = "LMO_FIELD"
    GATC_LAB = "GATC_LAB"


class InstrumentType(str, enum.Enum):
    """Comprehensive categories of weighing and measuring instruments
    per Legal Metrology Act, 2009 Schedule III and GATC Rules, 2013."""
    # --- Backward-compatible base types ---
    WEIGHING_SCALE = "WEIGHING_SCALE"
    ELECTRONIC_BALANCE = "ELECTRONIC_BALANCE"
    # --- Weighing Instruments ---
    ELECTRONIC_WEIGHING_SCALE = "ELECTRONIC_WEIGHING_SCALE"
    PLATFORM_SCALE = "PLATFORM_SCALE"
    COUNTER_SCALE = "COUNTER_SCALE"
    SPRING_BALANCE = "SPRING_BALANCE"
    BEAM_SCALE = "BEAM_SCALE"
    HANGING_SCALE = "HANGING_SCALE"
    CRANE_SCALE = "CRANE_SCALE"
    WEIGHBRIDGE = "WEIGHBRIDGE"
    RAILWAY_WEIGHBRIDGE = "RAILWAY_WEIGHBRIDGE"
    # --- Precision / Laboratory ---
    ANALYTICAL_BALANCE = "ANALYTICAL_BALANCE"
    MICRO_BALANCE = "MICRO_BALANCE"
    PRECISION_BALANCE = "PRECISION_BALANCE"
    # --- Medical ---
    MEDICAL_BABY_SCALE = "MEDICAL_BABY_SCALE"
    HOSPITAL_SCALE = "HOSPITAL_SCALE"
    BMI_SCALE = "BMI_SCALE"
    # --- Liquid / Flow ---
    PETROL_DISPENSER = "PETROL_DISPENSER"
    DIESEL_DISPENSER = "DIESEL_DISPENSER"
    CNG_DISPENSER = "CNG_DISPENSER"
    LPG_DISPENSER = "LPG_DISPENSER"
    AIRCRAFT_FUEL_DISPENSER = "AIRCRAFT_FUEL_DISPENSER"
    FLOW_METER = "FLOW_METER"
    CORIOLIS_FLOW_METER = "CORIOLIS_FLOW_METER"
    ULTRASONIC_FLOW_METER = "ULTRASONIC_FLOW_METER"
    CUSTODY_TRANSFER_METER = "CUSTODY_TRANSFER_METER"
    WATER_METER = "WATER_METER"
    # --- Volume ---
    TANK_LORRY = "TANK_LORRY"
    STORAGE_TANK = "STORAGE_TANK"
    # --- Length / Area / Speed ---
    LENGTH_MEASURE = "LENGTH_MEASURE"
    TAPE_MEASURE = "TAPE_MEASURE"
    AREA_MEASURING_DEVICE = "AREA_MEASURING_DEVICE"
    SPEEDOMETER = "SPEEDOMETER"
    TAXIMETER = "TAXIMETER"
    AUTO_FARE_METER = "AUTO_FARE_METER"
    FARE_METER = "FARE_METER"
    # --- Energy / Electrical ---
    ENERGY_METER = "ENERGY_METER"
    GAS_METER = "GAS_METER"
    # --- Specialized ---
    COUNTER_MACHINE = "COUNTER_MACHINE"
    CLINICAL_THERMOMETER = "CLINICAL_THERMOMETER"
    RADIATION_METER = "RADIATION_METER"
    BREATH_ALCOHOL_ANALYZER = "BREATH_ALCOHOL_ANALYZER"
    GRAIN_MOISTURE_METER = "GRAIN_MOISTURE_METER"
    # --- Fallback ---
    OTHER = "OTHER"


# --- GATC Routing: Instruments requiring GATC lab testing ---
# Per GATC Rules, 2013 Schedule I & II
GATC_MANDATORY_INSTRUMENTS: FrozenSet[InstrumentType] = frozenset({
    InstrumentType.ANALYTICAL_BALANCE,
    InstrumentType.MICRO_BALANCE,
    InstrumentType.PRECISION_BALANCE,
    InstrumentType.MEDICAL_BABY_SCALE,
    InstrumentType.HOSPITAL_SCALE,
    InstrumentType.CORIOLIS_FLOW_METER,
    InstrumentType.ULTRASONIC_FLOW_METER,
    InstrumentType.CUSTODY_TRANSFER_METER,
    InstrumentType.RAILWAY_WEIGHBRIDGE,
    InstrumentType.AIRCRAFT_FUEL_DISPENSER,
    InstrumentType.ENERGY_METER,
    InstrumentType.RADIATION_METER,
    InstrumentType.SPEEDOMETER,
    InstrumentType.BREATH_ALCOHOL_ANALYZER,
})

# --- Validity periods per instrument type (Rule 13, months) ---
VALIDITY_MONTHS_BY_TYPE: dict[InstrumentType, int] = {
    InstrumentType.WEIGHING_SCALE: 12,
    InstrumentType.ELECTRONIC_BALANCE: 12,
    InstrumentType.ELECTRONIC_WEIGHING_SCALE: 12,
    InstrumentType.PLATFORM_SCALE: 12,
    InstrumentType.COUNTER_SCALE: 12,
    InstrumentType.SPRING_BALANCE: 12,
    InstrumentType.BEAM_SCALE: 12,
    InstrumentType.HANGING_SCALE: 12,
    InstrumentType.CRANE_SCALE: 12,
    InstrumentType.WEIGHBRIDGE: 12,
    InstrumentType.RAILWAY_WEIGHBRIDGE: 12,
    InstrumentType.ANALYTICAL_BALANCE: 12,
    InstrumentType.MICRO_BALANCE: 12,
    InstrumentType.PRECISION_BALANCE: 12,
    InstrumentType.MEDICAL_BABY_SCALE: 12,
    InstrumentType.HOSPITAL_SCALE: 12,
    InstrumentType.BMI_SCALE: 12,
    InstrumentType.PETROL_DISPENSER: 12,
    InstrumentType.DIESEL_DISPENSER: 12,
    InstrumentType.CNG_DISPENSER: 12,
    InstrumentType.LPG_DISPENSER: 12,
    InstrumentType.AIRCRAFT_FUEL_DISPENSER: 12,
    InstrumentType.FLOW_METER: 12,
    InstrumentType.CORIOLIS_FLOW_METER: 12,
    InstrumentType.ULTRASONIC_FLOW_METER: 12,
    InstrumentType.CUSTODY_TRANSFER_METER: 12,
    InstrumentType.WATER_METER: 24,
    InstrumentType.TANK_LORRY: 24,
    InstrumentType.STORAGE_TANK: 24,
    InstrumentType.LENGTH_MEASURE: 24,
    InstrumentType.TAPE_MEASURE: 24,
    InstrumentType.AREA_MEASURING_DEVICE: 24,
    InstrumentType.SPEEDOMETER: 12,
    InstrumentType.TAXIMETER: 12,
    InstrumentType.AUTO_FARE_METER: 12,
    InstrumentType.FARE_METER: 12,
    InstrumentType.ENERGY_METER: 24,
    InstrumentType.GAS_METER: 24,
    InstrumentType.COUNTER_MACHINE: 24,
    InstrumentType.CLINICAL_THERMOMETER: 24,
    InstrumentType.RADIATION_METER: 12,
    InstrumentType.BREATH_ALCOHOL_ANALYZER: 12,
    InstrumentType.GRAIN_MOISTURE_METER: 12,
    InstrumentType.OTHER: 12,
}


def is_gatc_instrument(instrument_type: InstrumentType) -> bool:
    """Check if an instrument type requires GATC laboratory testing."""
    return instrument_type in GATC_MANDATORY_INSTRUMENTS


def get_validity_months(instrument_type: InstrumentType) -> int:
    """Get certificate validity period in months for an instrument type (Rule 13)."""
    return VALIDITY_MONTHS_BY_TYPE.get(instrument_type, 12)


class CertificateStatus(str, enum.Enum):
    """Legal certification validity lifecycle states."""
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    SUPERSEDED = "SUPERSEDED"
    REVOKED = "REVOKED"


class NotificationType(str, enum.Enum):
    """Event types for in-app operational notifications."""
    APPLICATION_SUBMITTED = "APPLICATION_SUBMITTED"
    APPLICATION_SCHEDULED = "APPLICATION_SCHEDULED"
    INSPECTION_ASSIGNED = "INSPECTION_ASSIGNED"
    INSPECTION_COMPLETED = "INSPECTION_COMPLETED"
    APPLICATION_VERIFIED = "APPLICATION_VERIFIED"
    APPLICATION_REJECTED = "APPLICATION_REJECTED"
    CERTIFICATE_ISSUED = "CERTIFICATE_ISSUED"
    CERTIFICATE_EXPIRING = "CERTIFICATE_EXPIRING"
    CERTIFICATE_EXPIRED = "CERTIFICATE_EXPIRED"
    PAYMENT_VERIFIED = "PAYMENT_VERIFIED"
    PAYMENT_REJECTED = "PAYMENT_REJECTED"
    CLARIFICATION_ASKED = "CLARIFICATION_ASKED"

