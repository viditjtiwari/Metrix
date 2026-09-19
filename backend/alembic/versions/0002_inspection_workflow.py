"""Operational verification workflow schema (Phase 3)

Revision ID: 0002_inspection_workflow
Revises: 0001_initial_domain_and_auth
Create Date: 2026-09-19 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0002_inspection_workflow'
down_revision: Union[str, None] = '0001_initial_domain_and_auth'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == 'postgresql'

    # 1. Update application_status enum on PostgreSQL if running under postgres dialect
    if is_postgres:
        op.execute("""
            CREATE TYPE application_status_new AS ENUM (
                'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SCHEDULED',
                'INSPECTION_IN_PROGRESS', 'INSPECTION_COMPLETED',
                'VERIFIED', 'CERTIFICATE_ISSUED', 'REJECTED'
            );
            ALTER TABLE verification_applications ALTER COLUMN status TYPE application_status_new USING status::text::application_status_new;
            ALTER TABLE application_status_histories ALTER COLUMN from_status TYPE application_status_new USING from_status::text::application_status_new;
            ALTER TABLE application_status_histories ALTER COLUMN to_status TYPE application_status_new USING to_status::text::application_status_new;
            DROP TYPE application_status;
            ALTER TYPE application_status_new RENAME TO application_status;
        """)

    # 2. Create inspections table
    op.create_table(
        'inspections',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('application_id', sa.Integer(), nullable=False),
        sa.Column('assigned_to_id', sa.Integer(), nullable=True),
        sa.Column('scheduled_date', sa.Date(), nullable=True),
        sa.Column('scheduled_time', sa.String(length=32), nullable=True),
        sa.Column('inspection_location', sa.String(length=255), nullable=True),
        sa.Column('scheduling_remarks', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            'result',
            sa.Enum('VERIFIED', 'REJECTED', name='inspection_result'),
            nullable=True,
        ),
        sa.Column('result_remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['application_id'], ['verification_applications.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['assigned_to_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_inspections_application_id'), 'inspections', ['application_id'], unique=True)
    op.create_index(op.f('ix_inspections_assigned_to_id'), 'inspections', ['assigned_to_id'], unique=False)
    op.create_index(op.f('ix_inspections_result'), 'inspections', ['result'], unique=False)

    # 3. Create inspection_observations table
    op.create_table(
        'inspection_observations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('inspection_id', sa.Integer(), nullable=False),
        sa.Column('parameter_name', sa.String(length=128), nullable=False),
        sa.Column('observed_value', sa.String(length=64), nullable=False),
        sa.Column('standard_value', sa.String(length=64), nullable=True),
        sa.Column('unit', sa.String(length=32), nullable=True),
        sa.Column('is_passed', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['inspection_id'], ['inspections.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_inspection_observations_inspection_id'), 'inspection_observations', ['inspection_id'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == 'postgresql'

    op.drop_index(op.f('ix_inspection_observations_inspection_id'), table_name='inspection_observations')
    op.drop_table('inspection_observations')

    op.drop_index(op.f('ix_inspections_result'), table_name='inspections')
    op.drop_index(op.f('ix_inspections_assigned_to_id'), table_name='inspections')
    op.drop_index(op.f('ix_inspections_application_id'), table_name='inspections')
    op.drop_table('inspections')

    sa.Enum(name='inspection_result').drop(bind, checkfirst=True)

    if is_postgres:
        op.execute("""
            CREATE TYPE application_status_old AS ENUM (
                'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SCHEDULED',
                'INSPECTION_IN_PROGRESS', 'INSPECTION_COMPLETED',
                'VERIFIED', 'CERTIFICATE_ISSUED', 'REJECTED',
                'EXPIRED', 'RE_VERIFICATION_REQUESTED'
            );
            ALTER TABLE verification_applications ALTER COLUMN status TYPE application_status_old USING status::text::application_status_old;
            ALTER TABLE application_status_histories ALTER COLUMN from_status TYPE application_status_old USING from_status::text::application_status_old;
            ALTER TABLE application_status_histories ALTER COLUMN to_status TYPE application_status_old USING to_status::text::application_status_old;
            DROP TYPE application_status;
            ALTER TYPE application_status_old RENAME TO application_status;
        """)
