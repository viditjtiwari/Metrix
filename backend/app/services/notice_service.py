from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session, selectinload
from app.models.notice import Notice
from app.models.user import User
from app.schemas.notice import NoticeCreate, NoticeListResponse, NoticeResponse, NoticeUpdate


class NoticeService:
    """Service handling departmental notices and announcements."""

    def create_notice(
        self, db: Session, notice_data: NoticeCreate, current_user: User
    ) -> NoticeResponse:
        notice = Notice(
            title=notice_data.title.strip(),
            content=notice_data.content.strip(),
            is_active=True,
            published_by_id=current_user.id,
        )
        db.add(notice)
        db.commit()
        db.refresh(notice)
        return self._to_response(notice, publisher_name=current_user.full_name)

    def list_active_notices(
        self, db: Session, limit: int = 10
    ) -> NoticeListResponse:
        stmt = (
            select(Notice)
            .options(selectinload(Notice.published_by))
            .where(Notice.is_active == True)  # noqa: E712
            .order_by(desc(Notice.created_at))
            .limit(limit)
        )
        results = db.execute(stmt).scalars().all()
        items = [
            self._to_response(
                n, publisher_name=n.published_by.full_name if n.published_by else None
            )
            for n in results
        ]
        return NoticeListResponse(items=items, total=len(items))

    def list_all_notices(
        self, db: Session, page: int = 1, page_size: int = 20
    ) -> NoticeListResponse:
        skip = max(0, (page - 1) * page_size)
        total_stmt = select(func.count(Notice.id))
        total = db.execute(total_stmt).scalar_one()

        stmt = (
            select(Notice)
            .options(selectinload(Notice.published_by))
            .order_by(desc(Notice.created_at))
            .offset(skip)
            .limit(page_size)
        )
        results = db.execute(stmt).scalars().all()
        items = [
            self._to_response(
                n, publisher_name=n.published_by.full_name if n.published_by else None
            )
            for n in results
        ]
        return NoticeListResponse(items=items, total=total)

    def delete_notice(self, db: Session, notice_id: int) -> bool:
        stmt = select(Notice).where(Notice.id == notice_id)
        notice = db.execute(stmt).scalar_one_or_none()
        if not notice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notice with id {notice_id} not found.",
            )
        db.delete(notice)
        db.commit()
        return True

    def _to_response(
        self, notice: Notice, publisher_name: Optional[str] = None
    ) -> NoticeResponse:
        resp = NoticeResponse.model_validate(notice)
        resp.publisher_name = publisher_name
        return resp


notice_service = NoticeService()
