from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reports & Export"])


@router.get(
    "/applications",
    status_code=status.HTTP_200_OK,
    summary="Export Applications CSV",
)
def export_applications_report(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    date_from: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Export verification applications data as CSV obeying RBAC permissions."""
    csv_data = report_service.generate_applications_report(
        db,
        current_user=current_user,
        status=status_filter,
        date_from=date_from,
        date_to=date_to,
    )
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="applications_report.csv"',
            "Cache-Control": "no-cache",
        },
    )


@router.get(
    "/instruments",
    status_code=status.HTTP_200_OK,
    summary="Export Instruments CSV",
)
def export_instruments_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Export instrument inventory data as CSV obeying RBAC permissions."""
    csv_data = report_service.generate_instruments_report(
        db, current_user=current_user
    )
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="instruments_report.csv"',
            "Cache-Control": "no-cache",
        },
    )


@router.get(
    "/verifications",
    status_code=status.HTTP_200_OK,
    summary="Export Verifications & Inspections CSV",
)
def export_verifications_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Export inspection and testing observation results as CSV obeying RBAC permissions."""
    csv_data = report_service.generate_verifications_report(
        db, current_user=current_user
    )
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="verifications_report.csv"',
            "Cache-Control": "no-cache",
        },
    )


@router.get(
    "/certificates",
    status_code=status.HTTP_200_OK,
    summary="Export Certificates CSV",
)
def export_certificates_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Export digital certification records as CSV obeying RBAC permissions."""
    csv_data = report_service.generate_certificates_report(
        db, current_user=current_user
    )
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="certificates_report.csv"',
            "Cache-Control": "no-cache",
        },
    )


@router.get(
    "/expiries",
    status_code=status.HTTP_200_OK,
    summary="Export Certificate Expiry Report CSV",
)
def export_expiries_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Export expiring and expired certificate tracking records as CSV."""
    csv_data = report_service.generate_expiry_report(
        db, current_user=current_user
    )
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="certificate_expiry_report.csv"',
            "Cache-Control": "no-cache",
        },
    )
