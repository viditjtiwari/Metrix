from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db, require_role
from app.models.enums import UserRole
from app.models.user import User
from app.services.image_service import image_service

router = APIRouter(tags=["Image Uploads"])


class CertificateImageSelectRequest(BaseModel):
    image_url: str


class ImageUploadResponse(BaseModel):
    url: str


@router.post(
    "/uploads/image",
    response_model=ImageUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Direct Image Upload",
)
def upload_single_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> ImageUploadResponse:
    """Upload an image to Cloudinary / storage and receive accessible URL."""
    url = image_service.save_image(file, folder="uploads")
    return ImageUploadResponse(url=url)


@router.post(
    "/instruments/{instrument_id}/images",
    response_model=List[str],
    status_code=status.HTTP_201_CREATED,
    summary="Upload Instrument Photos",
)
def upload_instrument_photo(
    instrument_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[str]:
    """Upload instrument photograph (maximum 3 allowed)."""
    return image_service.upload_instrument_image(
        db, instrument_id=instrument_id, file=file, current_user=current_user
    )


@router.delete(
    "/instruments/{instrument_id}/images/{index}",
    response_model=List[str],
    status_code=status.HTTP_200_OK,
    summary="Delete Instrument Photo",
)
def delete_instrument_photo(
    instrument_id: int,
    index: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[str]:
    """Delete an instrument photograph by index."""
    return image_service.delete_instrument_image(
        db, instrument_id=instrument_id, index=index, current_user=current_user
    )


@router.post(
    "/inspections/{inspection_id}/images",
    response_model=List[str],
    status_code=status.HTTP_201_CREATED,
    summary="Upload Inspection Proof Photos",
)
def upload_inspection_photo(
    inspection_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.LMO, UserRole.GATC, UserRole.ADMIN)
    ),
) -> List[str]:
    """Upload physical calibration or verification proof photo."""
    return image_service.upload_inspection_image(
        db, inspection_id=inspection_id, file=file, current_user=current_user
    )


@router.patch(
    "/inspections/{inspection_id}/certificate-image",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Select Certificate Stamping Photo",
)
def select_certificate_photo(
    inspection_id: int,
    body: CertificateImageSelectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.LMO, UserRole.ADMIN)),
) -> dict:
    """Designate which inspection photo appears on the legal digital certificate."""
    selected_url = image_service.select_certificate_image(
        db, inspection_id=inspection_id, image_url=body.image_url, current_user=current_user
    )
    return {"certificate_image_url": selected_url}
