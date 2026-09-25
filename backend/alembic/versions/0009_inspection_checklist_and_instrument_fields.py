"""Add instrument invoice, inspection checklist, seal, GATC fields

Revision ID: 0009
Revises: 0008_image_urls
Create Date: 2026-09-24 22:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0009_checklist_fields"
down_revision: str = "0008_image_urls"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Instrument table: new fields ──
    op.add_column("instruments", sa.Column(
        "manufacturing_year", sa.Integer(), nullable=True
    ))
    op.add_column("instruments", sa.Column(
        "min_capacity_unit", sa.String(16), nullable=True
    ))
    op.add_column("instruments", sa.Column(
        "max_capacity_unit", sa.String(16), nullable=True
    ))
    op.add_column("instruments", sa.Column(
        "division", sa.String(32), nullable=True
    ))
    op.add_column("instruments", sa.Column(
        "purchase_invoice_url", sa.String(512), nullable=True
    ))
    op.add_column("instruments", sa.Column(
        "tac_certificate_url", sa.String(512), nullable=True
    ))

    # ── Inspection table: structured checklist + GATC fields ──
    op.add_column("inspections", sa.Column(
        "inspection_mode", sa.String(16), nullable=True
    ))
    op.add_column("inspections", sa.Column(
        "physical_inspection_data", sa.Text(), nullable=True
    ))
    op.add_column("inspections", sa.Column(
        "metrological_test_data", sa.Text(), nullable=True
    ))
    op.add_column("inspections", sa.Column(
        "seal_number", sa.String(64), nullable=True
    ))
    op.add_column("inspections", sa.Column(
        "stamp_quarter", sa.String(16), nullable=True
    ))
    op.add_column("inspections", sa.Column(
        "gatc_test_report_url", sa.String(512), nullable=True
    ))
    op.add_column("inspections", sa.Column(
        "gatc_recommendation", sa.String(16), nullable=True
    ))
    op.add_column("inspections", sa.Column(
        "lmo_approval_status", sa.String(32), nullable=True
    ))
    op.add_column("inspections", sa.Column(
        "lmo_approval_remarks", sa.Text(), nullable=True
    ))


def downgrade() -> None:
    # ── Inspection: drop new columns ──
    op.drop_column("inspections", "lmo_approval_remarks")
    op.drop_column("inspections", "lmo_approval_status")
    op.drop_column("inspections", "gatc_recommendation")
    op.drop_column("inspections", "gatc_test_report_url")
    op.drop_column("inspections", "stamp_quarter")
    op.drop_column("inspections", "seal_number")
    op.drop_column("inspections", "metrological_test_data")
    op.drop_column("inspections", "physical_inspection_data")
    op.drop_column("inspections", "inspection_mode")

    # ── Instrument: drop new columns ──
    op.drop_column("instruments", "tac_certificate_url")
    op.drop_column("instruments", "purchase_invoice_url")
    op.drop_column("instruments", "division")
    op.drop_column("instruments", "max_capacity_unit")
    op.drop_column("instruments", "min_capacity_unit")
    op.drop_column("instruments", "manufacturing_year")
