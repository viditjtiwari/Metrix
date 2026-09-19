from datetime import date, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.certificate import Certificate
from app.models.enums import CertificateStatus, NotificationType
from app.models.notification import Notification
from app.models.user import User
from app.repositories.certificate_repository import certificate_repository
from app.repositories.notification_repository import notification_repository
from app.schemas.notification import (
    NotificationBatchReadResponse,
    NotificationListResponse,
    NotificationReadResponse,
    NotificationResponse,
)


class NotificationService:
    """Service orchestrating in-app notification dispatch, deduplication, and lifecycle alerts."""

    def send_notification(
        self,
        db: Session,
        *,
        user_id: int,
        type: NotificationType,
        title: str,
        message: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        allow_duplicate: bool = False,
    ) -> Optional[Notification]:
        """Dispatch a notification to a specific user, with optional deduplication."""
        if not allow_duplicate and entity_type and entity_id:
            if notification_repository.has_notification(
                db,
                user_id=user_id,
                notification_type=type,
                entity_type=entity_type,
                entity_id=entity_id,
            ):
                return None

        notif = notification_repository.create(
            db,
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            entity_type=entity_type,
            entity_id=entity_id,
        )
        return notif

    def list_user_notifications(
        self,
        db: Session,
        *,
        current_user: User,
        is_read: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> NotificationListResponse:
        """Retrieve paginated notifications strictly isolated to the authenticated user."""
        skip = max(0, (page - 1) * page_size)
        items, total, unread_count = notification_repository.list_by_user(
            db,
            user_id=current_user.id,
            is_read=is_read,
            skip=skip,
            limit=page_size,
        )
        return NotificationListResponse(
            items=[NotificationResponse.model_validate(item) for item in items],
            total=total,
            unread_count=unread_count,
            page=page,
            page_size=page_size,
        )

    def mark_as_read(
        self,
        db: Session,
        *,
        notification_id: int,
        current_user: User,
    ) -> NotificationReadResponse:
        """Mark an individual notification as read after validating user ownership."""
        notif = notification_repository.mark_as_read(
            db, notification_id=notification_id, user_id=current_user.id
        )
        if not notif:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification with id {notification_id} not found.",
            )
        db.commit()
        return NotificationReadResponse(
            id=notif.id,
            is_read=notif.is_read,
            read_at=notif.read_at,
        )

    def mark_all_as_read(
        self,
        db: Session,
        *,
        current_user: User,
    ) -> NotificationBatchReadResponse:
        """Mark all unread notifications as read for the authenticated user."""
        count = notification_repository.mark_all_as_read(db, user_id=current_user.id)
        db.commit()
        return NotificationBatchReadResponse(updated_count=count)

    def check_and_generate_expiry_notifications(
        self, db: Session, *, warning_days: Optional[int] = None
    ) -> dict:
        """Identify certificates entering the warning period or expired, generate deduplicated

        notifications for instrument owners, and update certificate lifecycle status.
        """
        days = warning_days or settings.CERTIFICATE_EXPIRY_WARNING_DAYS
        today = date.today()

        expiring_created = 0
        expired_created = 0
        status_updated = 0

        # 1. Active certificates entering warning window (valid_until <= today + warning_days)
        expiring_certs = certificate_repository.get_expiring_certificates_for_notification(
            db, warning_days=days
        )
        for cert in expiring_certs:
            owner = cert.instrument.owner if cert.instrument else None
            if not owner:
                continue

            days_left = (cert.valid_until - today).days
            title = f"Certificate Expiring Soon ({cert.certificate_number})"
            message = (
                f"Your verification certificate {cert.certificate_number} for instrument "
                f"'{cert.instrument.registration_number}' will expire in {days_left} day(s) "
                f"on {cert.valid_until.strftime('%Y-%m-%d')}. Please schedule re-verification."
            )
            created = self.send_notification(
                db,
                user_id=owner.id,
                type=NotificationType.CERTIFICATE_EXPIRING,
                title=title,
                message=message,
                entity_type="CERTIFICATE",
                entity_id=cert.id,
                allow_duplicate=False,
            )
            if created:
                expiring_created += 1

        # 2. Certificates already expired
        expired_certs = certificate_repository.get_expired_certificates_for_notification(db)
        for cert in expired_certs:
            # Transition status in DB if not marked yet
            if cert.status == CertificateStatus.ACTIVE:
                cert.status = CertificateStatus.EXPIRED
                status_updated += 1

            owner = cert.instrument.owner if cert.instrument else None
            if not owner:
                continue

            title = f"Certificate Expired ({cert.certificate_number})"
            message = (
                f"Your verification certificate {cert.certificate_number} for instrument "
                f"'{cert.instrument.registration_number}' expired on {cert.valid_until.strftime('%Y-%m-%d')}. "
                f"Operating this instrument without a valid certificate violates legal metrology standards. "
                f"Submit a re-verification request immediately."
            )
            created = self.send_notification(
                db,
                user_id=owner.id,
                type=NotificationType.CERTIFICATE_EXPIRED,
                title=title,
                message=message,
                entity_type="CERTIFICATE",
                entity_id=cert.id,
                allow_duplicate=False,
            )
            if created:
                expired_created += 1

        db.commit()
        return {
            "expiring_notifications_created": expiring_created,
            "expired_notifications_created": expired_created,
            "certificates_marked_expired": status_updated,
        }


notification_service = NotificationService()
