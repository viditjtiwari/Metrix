"""Initial domain and auth schema

Revision ID: 0001_initial_domain_and_auth
Revises: 
Create Date: 2026-09-19 13:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_initial_domain_and_auth'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column(
            'role',
            sa.Enum('ADMIN', 'LMO', 'GATC', 'INSTRUMENT_OWNER', name='user_role'),
            nullable=False,
        ),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)

    # 2. Create stakeholder_profiles table
    op.create_table(
        'stakeholder_profiles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('business_name', sa.String(length=255), nullable=False),
        sa.Column('trade_license_number', sa.String(length=100), nullable=True),
        sa.Column('contact_phone', sa.String(length=20), nullable=False),
        sa.Column('address_line', sa.String(length=255), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('pincode', sa.String(length=10), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_stakeholder_profiles_user_id'), 'stakeholder_profiles', ['user_id'], unique=True)
    op.create_index(op.f('ix_stakeholder_profiles_trade_license_number'), 'stakeholder_profiles', ['trade_license_number'], unique=False)

    # 3. Create instruments table
    op.create_table(
        'instruments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('registration_number', sa.String(length=64), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column(
            'instrument_type',
            sa.Enum('WEIGHING_SCALE', 'ELECTRONIC_BALANCE', 'PETROL_DISPENSER', 'FLOW_METER', 'LENGTH_MEASURE', 'OTHER', name='instrument_type'),
            nullable=False,
        ),
        sa.Column('manufacturer', sa.String(length=128), nullable=False),
        sa.Column('model_name', sa.String(length=128), nullable=False),
        sa.Column('serial_number', sa.String(length=128), nullable=False),
        sa.Column('capacity', sa.String(length=64), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_instruments_registration_number'), 'instruments', ['registration_number'], unique=True)
    op.create_index(op.f('ix_instruments_owner_id'), 'instruments', ['owner_id'], unique=False)
    op.create_index(op.f('ix_instruments_instrument_type'), 'instruments', ['instrument_type'], unique=False)
    op.create_index(op.f('ix_instruments_serial_number'), 'instruments', ['serial_number'], unique=False)

    # 4. Create verification_applications table
    op.create_table(
        'verification_applications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('application_number', sa.String(length=64), nullable=False),
        sa.Column('instrument_id', sa.Integer(), nullable=False),
        sa.Column('applicant_id', sa.Integer(), nullable=False),
        sa.Column('application_type', sa.String(length=32), server_default='INITIAL', nullable=False),
        sa.Column(
            'status',
            sa.Enum(
                'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SCHEDULED',
                'INSPECTION_IN_PROGRESS', 'INSPECTION_COMPLETED',
                'VERIFIED', 'CERTIFICATE_ISSUED', 'REJECTED',
                'EXPIRED', 'RE_VERIFICATION_REQUESTED',
                name='application_status',
            ),
            nullable=False,
        ),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['applicant_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['instrument_id'], ['instruments.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_verification_applications_application_number'), 'verification_applications', ['application_number'], unique=True)
    op.create_index(op.f('ix_verification_applications_instrument_id'), 'verification_applications', ['instrument_id'], unique=False)
    op.create_index(op.f('ix_verification_applications_applicant_id'), 'verification_applications', ['applicant_id'], unique=False)
    op.create_index(op.f('ix_verification_applications_status'), 'verification_applications', ['status'], unique=False)

    # 5. Create application_status_histories table
    op.create_table(
        'application_status_histories',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('application_id', sa.Integer(), nullable=False),
        sa.Column(
            'from_status',
            sa.Enum(
                'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SCHEDULED',
                'INSPECTION_IN_PROGRESS', 'INSPECTION_COMPLETED',
                'VERIFIED', 'CERTIFICATE_ISSUED', 'REJECTED',
                'EXPIRED', 'RE_VERIFICATION_REQUESTED',
                name='application_status',
            ),
            nullable=True,
        ),
        sa.Column(
            'to_status',
            sa.Enum(
                'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SCHEDULED',
                'INSPECTION_IN_PROGRESS', 'INSPECTION_COMPLETED',
                'VERIFIED', 'CERTIFICATE_ISSUED', 'REJECTED',
                'EXPIRED', 'RE_VERIFICATION_REQUESTED',
                name='application_status',
            ),
            nullable=False,
        ),
        sa.Column('changed_by_id', sa.Integer(), nullable=False),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['application_id'], ['verification_applications.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['changed_by_id'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_application_status_histories_application_id'), 'application_status_histories', ['application_id'], unique=False)
    op.create_index(op.f('ix_application_status_histories_changed_by_id'), 'application_status_histories', ['changed_by_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_application_status_histories_changed_by_id'), table_name='application_status_histories')
    op.drop_index(op.f('ix_application_status_histories_application_id'), table_name='application_status_histories')
    op.drop_table('application_status_histories')

    op.drop_index(op.f('ix_verification_applications_status'), table_name='verification_applications')
    op.drop_index(op.f('ix_verification_applications_applicant_id'), table_name='verification_applications')
    op.drop_index(op.f('ix_verification_applications_instrument_id'), table_name='verification_applications')
    op.drop_index(op.f('ix_verification_applications_application_number'), table_name='verification_applications')
    op.drop_table('verification_applications')

    op.drop_index(op.f('ix_instruments_serial_number'), table_name='instruments')
    op.drop_index(op.f('ix_instruments_instrument_type'), table_name='instruments')
    op.drop_index(op.f('ix_instruments_owner_id'), table_name='instruments')
    op.drop_index(op.f('ix_instruments_registration_number'), table_name='instruments')
    op.drop_table('instruments')

    op.drop_index(op.f('ix_stakeholder_profiles_trade_license_number'), table_name='stakeholder_profiles')
    op.drop_index(op.f('ix_stakeholder_profiles_user_id'), table_name='stakeholder_profiles')
    op.drop_table('stakeholder_profiles')

    op.drop_index(op.f('ix_users_role'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')

    # Drop enum types in postgres
    sa.Enum(name='application_status').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='instrument_type').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='user_role').drop(op.get_bind(), checkfirst=True)
