"""Add notices table for departmental announcements.

Revision ID: 0006_notices
Revises: 0005_auth_provider_otp
Create Date: 2026-09-23
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0006_notices"
down_revision: Union[str, None] = "0005_auth_provider_otp"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "notices",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column("published_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["published_by_id"], ["users.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_notices_is_active"), "notices", ["is_active"], unique=False
    )
    op.create_index(
        op.f("ix_notices_created_at"), "notices", ["created_at"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_notices_created_at"), table_name="notices")
    op.drop_index(op.f("ix_notices_is_active"), table_name="notices")
    op.drop_table("notices")
