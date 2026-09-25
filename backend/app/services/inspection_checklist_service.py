"""Service for handling structured government-standard inspection checklist submission."""
import json
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.application import ApplicationStatus, ApplicationStatusHistory
from app.models.enums import InspectionResult, NotificationType
from app.models.inspection import InspectionObservation
from app.models.user import User
from app.repositories.application_repository import application_repository
from app.repositories.inspection_repository import inspection_repository
from app.schemas.inspection import (
    InspectionChecklistSubmit,
    InspectionDetailResponse,
)
from app.services.observation_service import to_detail_response
from app.services.notification_service import notification_service


def calc_stamp_quarter(dt: datetime) -> str:
    """Calculate stamp quarter from inspection date (Q1=Jan-Mar, etc.)."""
    quarter = (dt.month - 1) // 3 + 1
    return f"Q{quarter}-{dt.year}"


def handle_submit_checklist(
    db: Session,
    *,
    inspection_id: int,
    checklist: InspectionChecklistSubmit,
    current_user: User,
) -> InspectionDetailResponse:
    """Submit the full structured inspection checklist in one shot.

    Stores physical inspection as JSON, metrological test data as JSON,
    creates observation records, sets seal/stamp, and finalizes result.
    """
    inspection = inspection_repository.get_by_id(db, inspection_id)
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found.",
        )

    if inspection.assigned_to_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the assigned officer can submit the checklist.",
        )

    if inspection.result is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inspection result has already been recorded.",
        )

    now = datetime.now(timezone.utc)

    # Store structured checklist as JSON
    inspection.physical_inspection_data = json.dumps(
        checklist.physical_inspection.model_dump(), default=str
    )
    if checklist.metrological_tests:
        inspection.metrological_test_data = json.dumps(
            checklist.metrological_tests.model_dump(), default=str
        )

    # Create observation records
    for obs_in in checklist.observations:
        obs = InspectionObservation(
            inspection_id=inspection.id,
            parameter_name=obs_in.parameter_name,
            observed_value=obs_in.observed_value,
            standard_value=obs_in.standard_value,
            unit=obs_in.unit,
            is_passed=obs_in.is_passed,
            remarks=obs_in.remarks,
        )
        db.add(obs)

    # Set result, seal, and timing
    inspection.result = checklist.result
    inspection.result_remarks = checklist.result_remarks
    inspection.seal_number = checklist.seal_number
    inspection.stamp_quarter = calc_stamp_quarter(now)
    inspection.completed_at = now
    if not inspection.started_at:
        inspection.started_at = now

    # Advance application status
    application = inspection.application
    if checklist.result == InspectionResult.VERIFIED:
        final_status = ApplicationStatus.VERIFIED
    else:
        final_status = ApplicationStatus.REJECTED

    application.status = final_status
    history = ApplicationStatusHistory(
        application_id=application.id,
        from_status=ApplicationStatus.INSPECTION_IN_PROGRESS,
        to_status=final_status,
        changed_by_id=current_user.id,
        remarks=checklist.result_remarks,
    )
    db.add(history)

    decision_type = (
        NotificationType.APPLICATION_VERIFIED
        if final_status == ApplicationStatus.VERIFIED
        else NotificationType.APPLICATION_REJECTED
    )
    notification_service.send_notification(
        db,
        user_id=application.applicant_id,
        type=decision_type,
        title="Inspection Completed",
        message=(
            f"Inspection for {application.application_number}: "
            f"{final_status.value}."
        ),
        entity_type="APPLICATION",
        entity_id=application.id,
    )

    db.commit()
    refreshed = inspection_repository.get_by_id(db, inspection.id)
    return to_detail_response(refreshed)
