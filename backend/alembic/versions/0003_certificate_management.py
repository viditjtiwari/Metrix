"""Digital certificate management schema (Phase 4)

Revision ID: 0003_certificate_management
Revises: 0002_inspection_workflow
Create Date: 2026-09-19 15:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0003_certificate_management'
down_revision: Union[str, None] = '0002_inspection_workflow'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create certificates table
    op.create_table(
        'certificates',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('certificate_number', sa.String(length=64), nullable=False),
        sa.Column('application_id', sa.Integer(), nullable=False),
        sa.Column('instrument_id', sa.Integer(), nullable=False),
        sa.Column('issued_by_id', sa.Integer(), nullable=False),
        sa.Column('issued_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('valid_from', sa.Date(), nullable=False),
        sa.Column('valid_until', sa.Date(), nullable=False),
        sa.Column(
            'status',
            sa.Enum('ACTIVE', 'EXPIRED', name='certificate_status'),
            nullable=False,
        ),
        sa.Column('integrity_hash', sa.String(length=64), nullable=False),
        sa.Column('verification_token', sa.String(length=64), nullable=False),
        sa.Column('pdf_path', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['application_id'], ['verification_applications.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['instrument_id'], ['instruments.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['issued_by_id'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_index(op.f('ix_certificates_certificate_number'), 'certificates', ['certificate_number'], unique=True)
    op.create_index(op.f('ix_certificates_application_id'), 'certificates', ['application_id'], unique=True)
    op.create_index(op.f('ix_certificates_verification_token'), 'certificates', ['verification_token'], unique=True)
    op.create_index(op.f('ix_certificates_instrument_id'), 'certificates', ['instrument_id'], unique=False)
    op.create_index(op.f('ix_certificates_issued_by_id'), 'certificates', ['issued_by_id'], unique=False)
    op.create_index(op.f('ix_certificates_status'), 'certificates', ['status'], unique=False)
    op.create_index(op.f('ix_certificates_integrity_hash'), 'certificates', ['integrity_hash'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()

    op.drop_index(op.f('ix_certificates_integrity_hash'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_status'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_issued_by_id'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_instrument_id'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_verification_token'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_application_id'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_certificate_number'), table_name='certificates')
    op.drop_table('certificates')

    sa.Enum(name='certificate_status').drop(bind, checkfirst=True)
