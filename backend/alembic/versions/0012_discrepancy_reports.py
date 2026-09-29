"""Add discrepancy_reports table for citizen complaints.

Revision ID: 0012
Revises: 0011_expand_enum_values
Create Date: 2026-09-29
"""
from alembic import op
import sqlalchemy as sa

revision = "0012_discrepancy_reports"
down_revision = "0011_expand_enum_values"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "discrepancy_reports",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            "report_reference_id",
            sa.String(32),
            nullable=False,
            unique=True,
            index=True,
        ),
        sa.Column("certificate_id", sa.Integer(), nullable=False),
        sa.Column("discrepancy_type", sa.String(64), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("reporter_name", sa.String(128), nullable=True),
        sa.Column("reporter_phone", sa.String(32), nullable=True),
        sa.Column("evidence_image_url", sa.String(512), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="PENDING"),
        sa.Column("reviewed_by_id", sa.Integer(), nullable=True),
        sa.Column("action_remarks", sa.Text(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["certificate_id"],
            ["certificates.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["reviewed_by_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
    )


def downgrade() -> None:
    op.drop_table("discrepancy_reports")
