"""Add min_capacity, max_capacity, and capacity_unit to instruments table.

Revision ID: 0007_instrument_capacity_fields
Revises: 0006_notices
Create Date: 2026-09-23
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0007_instrument_capacity_fields"
down_revision: Union[str, None] = "0006_notices"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "instruments",
        sa.Column("min_capacity", sa.String(length=64), nullable=True),
    )
    op.add_column(
        "instruments",
        sa.Column("max_capacity", sa.String(length=64), nullable=True),
    )
    op.add_column(
        "instruments",
        sa.Column("capacity_unit", sa.String(length=16), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("instruments", "capacity_unit")
    op.drop_column("instruments", "max_capacity")
    op.drop_column("instruments", "min_capacity")
