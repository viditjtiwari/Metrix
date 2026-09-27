"""Expand application_status, instrument_type, notification_type, and certificate_status enums

Revision ID: 0011_expand_enum_values
Revises: 0010_payment_and_kyc_fields
Create Date: 2026-09-26 11:45:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0011_expand_enum_values"
down_revision: str = "0010_payment_and_kyc_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

app_status_additions = [
    "PAYMENT_UPLOADED",
    "PAYMENT_VERIFIED",
    "CLARIFICATION_ASKED",
]

instrument_type_additions = [
    "ELECTRONIC_WEIGHING_SCALE",
    "PLATFORM_SCALE",
    "COUNTER_SCALE",
    "SPRING_BALANCE",
    "BEAM_SCALE",
    "HANGING_SCALE",
    "CRANE_SCALE",
    "WEIGHBRIDGE",
    "RAILWAY_WEIGHBRIDGE",
    "ANALYTICAL_BALANCE",
    "MICRO_BALANCE",
    "PRECISION_BALANCE",
    "MEDICAL_BABY_SCALE",
    "HOSPITAL_SCALE",
    "BMI_SCALE",
    "DIESEL_DISPENSER",
    "CNG_DISPENSER",
    "LPG_DISPENSER",
    "AIRCRAFT_FUEL_DISPENSER",
    "CORIOLIS_FLOW_METER",
    "ULTRASONIC_FLOW_METER",
    "CUSTODY_TRANSFER_METER",
    "WATER_METER",
    "TANK_LORRY",
    "STORAGE_TANK",
    "TAPE_MEASURE",
    "AREA_MEASURING_DEVICE",
    "SPEEDOMETER",
    "TAXIMETER",
    "AUTO_FARE_METER",
    "FARE_METER",
    "ENERGY_METER",
    "GAS_METER",
    "COUNTER_MACHINE",
    "CLINICAL_THERMOMETER",
    "RADIATION_METER",
    "BREATH_ALCOHOL_ANALYZER",
    "GRAIN_MOISTURE_METER",
]

notification_type_additions = [
    "PAYMENT_VERIFIED",
    "PAYMENT_REJECTED",
    "CLARIFICATION_ASKED",
]

certificate_status_additions = [
    "SUPERSEDED",
    "REVOKED",
]


def upgrade() -> None:
    with op.get_context().autocommit_block():
        for val in app_status_additions:
            op.execute(sa.text(f"ALTER TYPE application_status ADD VALUE IF NOT EXISTS '{val}'"))

        for val in instrument_type_additions:
            op.execute(sa.text(f"ALTER TYPE instrument_type ADD VALUE IF NOT EXISTS '{val}'"))

        for val in notification_type_additions:
            op.execute(sa.text(f"ALTER TYPE notification_type ADD VALUE IF NOT EXISTS '{val}'"))

        for val in certificate_status_additions:
            op.execute(sa.text(f"ALTER TYPE certificate_status ADD VALUE IF NOT EXISTS '{val}'"))


def downgrade() -> None:
    # PostgreSQL does not support removing values from enums without dropping/recreating the enum type.
    pass
