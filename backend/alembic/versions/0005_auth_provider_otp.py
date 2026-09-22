"""Add auth_provider, otp_code, otp_expires_at to users table.

Revision ID: 0005_auth_provider_otp
Revises: 0004_notifications
Create Date: 2026-09-22
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0005_auth_provider_otp"
down_revision: Union[str, None] = "0004_notifications"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add auth_provider column (local or google)
    op.add_column(
        "users",
        sa.Column(
            "auth_provider",
            sa.String(20),
            nullable=False,
            server_default="local",
        ),
    )

    # Add OTP fields for email-based login
    op.add_column(
        "users",
        sa.Column("otp_code", sa.String(10), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("otp_expires_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Make hashed_password nullable for Google OAuth users
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(255),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(255),
        nullable=False,
    )
    op.drop_column("users", "otp_expires_at")
    op.drop_column("users", "otp_code")
    op.drop_column("users", "auth_provider")
