from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session
from app.models.enums import NotificationType
from app.models.notification import Notification


class NotificationRepository:
    """Repository handling database queries and persistence for in-app notifications."""

    def create(
        self,
        db: Session,
        *,
        user_id: int,
        type: NotificationType,
        title: str,
        message: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title.strip(),
            message=message.strip(),
            is_read=False,
            created_at=datetime.now(timezone.utc),
            entity_type=entity_type,
            entity_id=entity_id,
        )
        db.add(notification)
        db.flush()
        return notification

    def get_by_id(
        self, db: Session, notification_id: int, user_id: Optional[int] = None
    ) -> Optional[Notification]:
        stmt = select(Notification).where(Notification.id == notification_id)
        if user_id is not None:
            stmt = stmt.where(Notification.user_id == user_id)
        return db.execute(stmt).scalar_one_or_none()

    def list_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        is_read: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Notification], int, int]:
        filters = [Notification.user_id == user_id]
        if is_read is not None:
            filters.append(Notification.is_read == is_read)

        # Total matching filter
        count_stmt = select(func.count(Notification.id)).where(*filters)
        total = db.execute(count_stmt).scalar_one()

        # Total unread for this user regardless of filter
        unread_stmt = select(func.count(Notification.id)).where(
            Notification.user_id == user_id,
            Notification.is_read == False,
        )
        unread_count = db.execute(unread_stmt).scalar_one()

        stmt = (
            select(Notification)
            .where(*filters)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.execute(stmt).scalars().all())
        return items, total, unread_count

    def mark_as_read(
        self, db: Session, *, notification_id: int, user_id: int
    ) -> Optional[Notification]:
        notification = self.get_by_id(db, notification_id=notification_id, user_id=user_id)
        if not notification:
            return None

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.now(timezone.utc)
            db.flush()
        return notification

    def mark_all_as_read(self, db: Session, *, user_id: int) -> int:
        now = datetime.now(timezone.utc)
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True, read_at=now)
        )
        result = db.execute(stmt)
        db.flush()
        return result.rowcount

    def has_notification(
        self,
        db: Session,
        *,
        user_id: int,
        notification_type: NotificationType,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
    ) -> bool:
        filters = [
            Notification.user_id == user_id,
            Notification.type == notification_type,
        ]
        if entity_type is not None:
            filters.append(Notification.entity_type == entity_type)
        if entity_id is not None:
            filters.append(Notification.entity_id == entity_id)

        stmt = select(func.count(Notification.id)).where(*filters)
        count = db.execute(stmt).scalar_one()
        return count > 0


notification_repository = NotificationRepository()
