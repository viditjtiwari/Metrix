"""Add payment tracking and KYC fields

Revision ID: 0010_payment_and_kyc_fields
Revises: 0009_inspection_checklist_and_instrument_fields
Create Date: 2026-09-25 13:40:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0010_payment_and_kyc_fields"
down_revision: str = "0009_checklist_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Create payment_status enum if not existing ──
    # Note: In PostgreSQL, we can add columns with String or Enum
    # To ensure maximum compatibility across DB drivers without DDL conflict:
    op.add_column("verification_applications", sa.Column(
        "payment_status", sa.String(32), server_default="PENDING", nullable=False
    ))
    op.create_index(
        "ix_verification_applications_payment_status",
        "verification_applications",
        ["payment_status"],
    )
    op.add_column("verification_applications", sa.Column(
        "payment_receipt_url", sa.String(512), nullable=True
    ))
    op.add_column("verification_applications", sa.Column(
        "challan_reference_number", sa.String(64), nullable=True
    ))
    op.add_column("verification_applications", sa.Column(
        "challan_date", sa.Date(), nullable=True
    ))
    op.add_column("verification_applications", sa.Column(
        "calculated_fee", sa.Integer(), server_default="0", nullable=False
    ))
    op.add_column("verification_applications", sa.Column(
        "late_fee", sa.Integer(), server_default="0", nullable=False
    ))
    op.add_column("verification_applications", sa.Column(
        "total_fee", sa.Integer(), server_default="0", nullable=False
    ))
    op.add_column("verification_applications", sa.Column(
        "payment_uploaded_at", sa.DateTime(timezone=True), nullable=True
    ))
    op.add_column("verification_applications", sa.Column(
        "payment_verified_at", sa.DateTime(timezone=True), nullable=True
    ))
    op.add_column("verification_applications", sa.Column(
        "payment_verified_by_id", sa.Integer(), nullable=True
    ))
    op.create_foreign_key(
        "fk_verification_applications_payment_verified_by_id_users",
        "verification_applications",
        "users",
        ["payment_verified_by_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.add_column("verification_applications", sa.Column(
        "payment_remarks", sa.Text(), nullable=True
    ))

    # ── 2. Stakeholder Profile KYC fields ──
    op.add_column("stakeholder_profiles", sa.Column(
        "gstin", sa.String(15), nullable=True
    ))
    op.create_index(
        "ix_stakeholder_profiles_gstin",
        "stakeholder_profiles",
        ["gstin"],
    )
    op.add_column("stakeholder_profiles", sa.Column(
        "pan", sa.String(10), nullable=True
    ))
    op.create_index(
        "ix_stakeholder_profiles_pan",
        "stakeholder_profiles",
        ["pan"],
    )
    op.add_column("stakeholder_profiles", sa.Column(
        "business_type", sa.String(32), nullable=True
    ))
    op.add_column("stakeholder_profiles", sa.Column(
        "aadhaar_reference", sa.String(32), nullable=True
    ))


def downgrade() -> None:
    # ── Stakeholder profile: drop KYC fields ──
    op.drop_column("stakeholder_profiles", "aadhaar_reference")
    op.drop_column("stakeholder_profiles", "business_type")
    op.drop_index("ix_stakeholder_profiles_pan", table_name="stakeholder_profiles")
    op.drop_column("stakeholder_profiles", "pan")
    op.drop_index("ix_stakeholder_profiles_gstin", table_name="stakeholder_profiles")
    op.drop_column("stakeholder_profiles", "gstin")

    # ── Verification applications: drop payment fields ──
    op.drop_column("verification_applications", "payment_remarks")
    op.drop_constraint(
        "fk_verification_applications_payment_verified_by_id_users",
        "verification_applications",
        type_="foreignkey",
    )
    op.drop_column("verification_applications", "payment_verified_by_id")
    op.drop_column("verification_applications", "payment_verified_at")
    op.drop_column("verification_applications", "payment_uploaded_at")
    op.drop_column("verification_applications", "total_fee")
    op.drop_column("verification_applications", "late_fee")
    op.drop_column("verification_applications", "calculated_fee")
    op.drop_column("verification_applications", "challan_date")
    op.drop_column("verification_applications", "challan_reference_number")
    op.drop_column("verification_applications", "payment_receipt_url")
    op.drop_index(
        "ix_verification_applications_payment_status",
        table_name="verification_applications",
    )
    op.drop_column("verification_applications", "payment_status")
