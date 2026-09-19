"""Operations, notifications, and search indexing (Phase 5)

Revision ID: 0004_operations_and_notifications
Revises: 0003_certificate_management
Create Date: 2026-09-19 16:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0004_operations_and_notifications'
down_revision: Union[str, None] = '0003_certificate_management'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == 'postgresql'

    notification_type_enum = sa.Enum(
        'APPLICATION_SUBMITTED',
        'APPLICATION_SCHEDULED',
        'INSPECTION_ASSIGNED',
        'INSPECTION_COMPLETED',
        'APPLICATION_VERIFIED',
        'APPLICATION_REJECTED',
        'CERTIFICATE_ISSUED',
        'CERTIFICATE_EXPIRING',
        'CERTIFICATE_EXPIRED',
        name='notification_type',
    )

    # 1. Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', notification_type_enum, nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('entity_type', sa.String(length=64), nullable=True),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)
    op.create_index(op.f('ix_notifications_type'), 'notifications', ['type'], unique=False)
    op.create_index(op.f('ix_notifications_is_read'), 'notifications', ['is_read'], unique=False)
    op.create_index(op.f('ix_notifications_created_at'), 'notifications', ['created_at'], unique=False)
    op.create_index('ix_notifications_user_is_read', 'notifications', ['user_id', 'is_read'], unique=False)

    # 2. Add performance indexes for expiry tracking and search
    op.create_index(op.f('ix_certificates_valid_until'), 'certificates', ['valid_until'], unique=False)
    op.create_index(op.f('ix_verification_applications_created_at'), 'verification_applications', ['created_at'], unique=False)
    op.create_index(op.f('ix_verification_applications_submitted_at'), 'verification_applications', ['submitted_at'], unique=False)
    op.create_index(op.f('ix_instruments_created_at'), 'instruments', ['created_at'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()

    op.drop_index(op.f('ix_instruments_created_at'), table_name='instruments')
    op.drop_index(op.f('ix_verification_applications_submitted_at'), table_name='verification_applications')
    op.drop_index(op.f('ix_verification_applications_created_at'), table_name='verification_applications')
    op.drop_index(op.f('ix_certificates_valid_until'), table_name='certificates')

    op.drop_index('ix_notifications_user_is_read', table_name='notifications')
    op.drop_index(op.f('ix_notifications_created_at'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_is_read'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_type'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_table('notifications')

    sa.Enum(name='notification_type').drop(bind, checkfirst=True)
