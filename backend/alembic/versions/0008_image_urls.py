"""Add image_urls to instruments and inspections, and certificate_image_url to inspections.

Revision ID: 0008_image_urls
Revises: 0007_instrument_capacity_fields
Create Date: 2026-09-23
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0008_image_urls"
down_revision: Union[str, None] = "0007_instrument_capacity_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "instruments",
        sa.Column("image_urls", sa.Text(), nullable=True),
    )
    op.add_column(
        "inspections",
        sa.Column("image_urls", sa.Text(), nullable=True),
    )
    op.add_column(
        "inspections",
        sa.Column("certificate_image_url", sa.String(length=512), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("inspections", "certificate_image_url")
    op.drop_column("inspections", "image_urls")
    op.drop_column("instruments", "image_urls")
