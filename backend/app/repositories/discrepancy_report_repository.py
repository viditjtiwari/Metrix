"""Repository for DiscrepancyReport persistence and queries."""
from typing import List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload
from app.models.discrepancy_report import DiscrepancyReport


class DiscrepancyReportRepository:
    """Database access layer for discrepancy reports."""

    def create(self, db: Session, report: DiscrepancyReport) -> DiscrepancyReport:
        db.add(report)
        db.flush()
        db.refresh(report)
        return report

    def get_by_id(self, db: Session, report_id: int) -> Optional[DiscrepancyReport]:
        stmt = (
            select(DiscrepancyReport)
            .options(
                selectinload(DiscrepancyReport.certificate),
                selectinload(DiscrepancyReport.reviewed_by),
            )
            .where(DiscrepancyReport.id == report_id)
        )
        return db.execute(stmt).scalar_one_or_none()

    def get_by_reference(
        self, db: Session, ref_id: str
    ) -> Optional[DiscrepancyReport]:
        stmt = (
            select(DiscrepancyReport)
            .options(
                selectinload(DiscrepancyReport.certificate),
                selectinload(DiscrepancyReport.reviewed_by),
            )
            .where(DiscrepancyReport.report_reference_id == ref_id)
        )
        return db.execute(stmt).scalar_one_or_none()

    def list_reports(
        self,
        db: Session,
        *,
        status_filter: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[DiscrepancyReport], int]:
        """List discrepancy reports with optional status filter and pagination."""
        base = select(DiscrepancyReport).options(
            selectinload(DiscrepancyReport.certificate),
            selectinload(DiscrepancyReport.reviewed_by),
        )
        count_base = select(func.count(DiscrepancyReport.id))

        if status_filter:
            base = base.where(DiscrepancyReport.status == status_filter)
            count_base = count_base.where(
                DiscrepancyReport.status == status_filter
            )

        total = db.execute(count_base).scalar() or 0
        items = (
            db.execute(
                base.order_by(DiscrepancyReport.created_at.desc())
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
            .scalars()
            .all()
        )
        return list(items), total


discrepancy_report_repository = DiscrepancyReportRepository()
