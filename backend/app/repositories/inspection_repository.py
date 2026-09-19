from datetime import date, datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.models.enums import InspectionResult
from app.models.inspection import Inspection, InspectionObservation


class InspectionRepository:
    """Repository handling database queries for inspections and observations."""

    def get_by_id(self, db: Session, inspection_id: int) -> Optional[Inspection]:
        stmt = (
            select(Inspection)
            .options(
                selectinload(Inspection.observations),
                selectinload(Inspection.assigned_to),
                selectinload(Inspection.application),
            )
            .where(Inspection.id == inspection_id)
        )
        return db.execute(stmt).scalar_one_or_none()

    def get_by_application_id(
        self, db: Session, application_id: int
    ) -> Optional[Inspection]:
        stmt = (
            select(Inspection)
            .options(
                selectinload(Inspection.observations),
                selectinload(Inspection.assigned_to),
                selectinload(Inspection.application),
            )
            .where(Inspection.application_id == application_id)
        )
        return db.execute(stmt).scalar_one_or_none()

    def create_or_update_scheduling(
        self,
        db: Session,
        *,
        application_id: int,
        scheduled_date: date,
        scheduled_time: Optional[str],
        inspection_location: Optional[str],
        scheduling_remarks: Optional[str],
        assigned_to_id: Optional[int] = None,
    ) -> Inspection:
        inspection = self.get_by_application_id(db, application_id)
        if inspection:
            inspection.scheduled_date = scheduled_date
            inspection.scheduled_time = scheduled_time
            inspection.inspection_location = inspection_location
            inspection.scheduling_remarks = scheduling_remarks
            if assigned_to_id is not None:
                inspection.assigned_to_id = assigned_to_id
        else:
            inspection = Inspection(
                application_id=application_id,
                scheduled_date=scheduled_date,
                scheduled_time=scheduled_time,
                inspection_location=inspection_location,
                scheduling_remarks=scheduling_remarks,
                assigned_to_id=assigned_to_id,
            )
            db.add(inspection)

        db.flush()
        return inspection

    def update_assignment(
        self,
        db: Session,
        *,
        inspection: Inspection,
        assigned_to_id: int,
    ) -> Inspection:
        inspection.assigned_to_id = assigned_to_id
        db.flush()
        return inspection

    def start_inspection(
        self,
        db: Session,
        *,
        inspection: Inspection,
        started_at: datetime,
    ) -> Inspection:
        inspection.started_at = started_at
        db.flush()
        return inspection

    def complete_inspection(
        self,
        db: Session,
        *,
        inspection: Inspection,
        result: InspectionResult,
        completed_at: datetime,
        result_remarks: Optional[str] = None,
    ) -> Inspection:
        inspection.result = result
        inspection.completed_at = completed_at
        inspection.result_remarks = result_remarks
        db.flush()
        return inspection

    def add_observation(
        self,
        db: Session,
        *,
        inspection_id: int,
        parameter_name: str,
        observed_value: str,
        standard_value: Optional[str] = None,
        unit: Optional[str] = None,
        is_passed: bool = True,
        remarks: Optional[str] = None,
    ) -> InspectionObservation:
        obs = InspectionObservation(
            inspection_id=inspection_id,
            parameter_name=parameter_name,
            observed_value=observed_value,
            standard_value=standard_value,
            unit=unit,
            is_passed=is_passed,
            remarks=remarks,
        )
        db.add(obs)
        db.flush()
        return obs

    def list_observations(
        self, db: Session, inspection_id: int
    ) -> List[InspectionObservation]:
        stmt = (
            select(InspectionObservation)
            .where(InspectionObservation.inspection_id == inspection_id)
            .order_by(InspectionObservation.created_at.asc())
        )
        return list(db.execute(stmt).scalars().all())


inspection_repository = InspectionRepository()
