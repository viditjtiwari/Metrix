import enum


class UserRole(str, enum.Enum):
    """System actor roles for RBAC."""
    ADMIN = "ADMIN"
    LMO = "LMO"
    GATC = "GATC"
    INSTRUMENT_OWNER = "INSTRUMENT_OWNER"


class ApplicationStatus(str, enum.Enum):
    """Legal metrology verification application workflow statuses."""
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    SCHEDULED = "SCHEDULED"
    INSPECTION_IN_PROGRESS = "INSPECTION_IN_PROGRESS"
    INSPECTION_COMPLETED = "INSPECTION_COMPLETED"
    VERIFIED = "VERIFIED"
    CERTIFICATE_ISSUED = "CERTIFICATE_ISSUED"
    REJECTED = "REJECTED"


class InspectionResult(str, enum.Enum):
    """Verification inspection outcome."""
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class InstrumentType(str, enum.Enum):
    """Categories of weighing and measuring instruments."""
    WEIGHING_SCALE = "WEIGHING_SCALE"
    ELECTRONIC_BALANCE = "ELECTRONIC_BALANCE"
    PETROL_DISPENSER = "PETROL_DISPENSER"
    FLOW_METER = "FLOW_METER"
    LENGTH_MEASURE = "LENGTH_MEASURE"
    OTHER = "OTHER"


class CertificateStatus(str, enum.Enum):
    """Legal certification validity lifecycle states."""
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"


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

