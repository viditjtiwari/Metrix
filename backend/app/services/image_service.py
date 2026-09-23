import json
import os
import uuid
from typing import List, Optional
import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.enums import UserRole
from app.models.inspection import Inspection
from app.models.instrument import Instrument
from app.models.user import User

from app.core.logging import logger

def _configure_cloudinary():
    """Ensure Cloudinary is configured with latest settings."""
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        return True
    return False

# Initial configure
_configure_cloudinary()


class ImageService:
    """Service managing image uploads to Cloudinary with local storage fallback."""

    def save_image(self, file: UploadFile, folder: str = "general") -> str:
        """Upload image to Cloudinary or save to local storage, returning accessible URL."""
        if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/jpg"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only JPEG, PNG, and WebP image formats are supported.",
            )

        file.file.seek(0)
        file_bytes = file.file.read()
        if len(file_bytes) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image size exceeds 5MB limit.",
            )

        # Upload to Cloudinary if credentials exist
        has_cloudinary = _configure_cloudinary()
        if has_cloudinary:
            try:
                upload_result = cloudinary.uploader.upload(
                    file_bytes,
                    folder=f"metrix/{folder}",
                    resource_type="image",
                )
                url = upload_result.get("secure_url") or upload_result.get("url")
                if url:
                    logger.info(f"Cloudinary upload successful: {url}")
                    return url
            except Exception as e:
                logger.error(f"Cloudinary upload failed: {e}. Falling back to local storage.", exc_info=True)
        else:
            logger.warning("Cloudinary credentials not configured. Falling back to local storage.")

        # Local file storage fallback
        os.makedirs(settings.UPLOAD_STORAGE_DIR, exist_ok=True)
        ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        local_path = os.path.join(settings.UPLOAD_STORAGE_DIR, unique_name)
        with open(local_path, "wb") as f:
            f.write(file_bytes)

        return f"/api/v1/uploads/{unique_name}"

    def upload_instrument_image(
        self, db: Session, *, instrument_id: int, file: UploadFile, current_user: User
    ) -> List[str]:
        """Upload instrument photo by owner (up to 3 photos max)."""
        instrument = db.query(Instrument).filter(Instrument.id == instrument_id).first()
        if not instrument:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instrument not found.")

        if current_user.role == UserRole.INSTRUMENT_OWNER and instrument.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        urls: List[str] = json.loads(instrument.image_urls) if instrument.image_urls else []
        if len(urls) >= 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 3 photos allowed per instrument.",
            )

        new_url = self.save_image(file, folder="instruments")
        urls.append(new_url)
        instrument.image_urls = json.dumps(urls)
        db.commit()
        return urls

    def delete_instrument_image(
        self, db: Session, *, instrument_id: int, index: int, current_user: User
    ) -> List[str]:
        """Delete an instrument photo by index."""
        instrument = db.query(Instrument).filter(Instrument.id == instrument_id).first()
        if not instrument:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instrument not found.")

        if current_user.role == UserRole.INSTRUMENT_OWNER and instrument.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        urls: List[str] = json.loads(instrument.image_urls) if instrument.image_urls else []
        if 0 <= index < len(urls):
            urls.pop(index)
            instrument.image_urls = json.dumps(urls) if urls else None
            db.commit()
        return urls

    def upload_inspection_image(
        self, db: Session, *, inspection_id: int, file: UploadFile, current_user: User
    ) -> List[str]:
        """Upload verification inspection proof photo by testing officer/GATC."""
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found.")

        if current_user.role not in [UserRole.LMO, UserRole.GATC, UserRole.ADMIN]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only inspectors can upload proof.")

        urls: List[str] = json.loads(inspection.image_urls) if inspection.image_urls else []
        new_url = self.save_image(file, folder="inspections")
        urls.append(new_url)
        inspection.image_urls = json.dumps(urls)

        # If certificate image is not set yet, set this first one as default
        if not inspection.certificate_image_url:
            inspection.certificate_image_url = new_url

        db.commit()
        return urls

    def select_certificate_image(
        self, db: Session, *, inspection_id: int, image_url: str, current_user: User
    ) -> str:
        """Select one inspection photo to be embedded on the official certificate."""
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found.")

        if current_user.role not in [UserRole.LMO, UserRole.ADMIN]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only LMO or Admin can select certificate photo.")

        inspection.certificate_image_url = image_url
        db.commit()
        return inspection.certificate_image_url


image_service = ImageService()
