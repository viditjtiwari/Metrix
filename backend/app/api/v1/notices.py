from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db, require_role
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.notice import NoticeCreate, NoticeListResponse, NoticeResponse
from app.services.notice_service import notice_service

router = APIRouter(prefix="/notices", tags=["Notices & Announcements"])


@router.get(
    "",
    response_model=NoticeListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Active Departmental Notices",
)
def list_notices(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
) -> NoticeListResponse:
    """Retrieve active departmental notices and announcements for the portal (public)."""
    return notice_service.list_active_notices(db, limit=limit)


@router.post(
    "",
    response_model=NoticeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Publish New Department Notice",
)
def create_notice(
    notice_data: NoticeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
) -> NoticeResponse:
    """Publish a new departmental circular or notice (Admin only)."""
    return notice_service.create_notice(db, notice_data=notice_data, current_user=current_user)


@router.delete(
    "/{notice_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Department Notice",
)
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
) -> None:
    """Remove a departmental notice (Admin only)."""
    notice_service.delete_notice(db, notice_id=notice_id)
