import random
import string
from datetime import datetime, timezone
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.enums import InstrumentType, UserRole
from app.models.instrument import Instrument
from app.models.user import User
from app.repositories.instrument_repository import instrument_repository
from app.schemas.instrument import InstrumentCreate, InstrumentListResponse, InstrumentResponse


class InstrumentService:
    """Service handling business rules and ownership boundaries for instruments."""

    def _generate_registration_number(self) -> str:
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        rand_suffix = "".join(
            random.choices(string.ascii_uppercase + string.digits, k=4)
        )
        return f"INST-{date_str}-{rand_suffix}"

    def register_instrument(
        self, db: Session, instrument_data: InstrumentCreate, owner_id: int
    ) -> Instrument:
        for _ in range(5):
            reg_num = self._generate_registration_number()
            if not instrument_repository.get_by_registration_number(db, reg_num):
                break
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not generate unique instrument registration number.",
            )

        instrument = instrument_repository.create(
            db,
            registration_number=reg_num,
            owner_id=owner_id,
            instrument_data=instrument_data,
        )
        db.commit()
        db.refresh(instrument)
        return instrument

    def get_instrument(
        self, db: Session, instrument_id: int, current_user: User
    ) -> Instrument:
        instrument = instrument_repository.get_by_id(db, instrument_id)
        if not instrument:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Instrument with id {instrument_id} not found.",
            )

        # RBAC and Ownership boundary
        if current_user.role == UserRole.INSTRUMENT_OWNER and instrument.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this instrument.",
            )

        return instrument

    def list_instruments(
        self,
        db: Session,
        current_user: User,
        registration_number: Optional[str] = None,
        serial_number: Optional[str] = None,
        instrument_type: Optional[InstrumentType] = None,
        manufacturer: Optional[str] = None,
        location: Optional[str] = None,
        owner_id: Optional[int] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> InstrumentListResponse:
        skip = max(0, (page - 1) * page_size)

        # Enforce boundary: owners can ONLY see their own instruments
        if current_user.role == UserRole.INSTRUMENT_OWNER:
            effective_owner_id = current_user.id
        else:
            effective_owner_id = owner_id

        items, total = instrument_repository.search(
            db,
            owner_id=effective_owner_id,
            registration_number=registration_number,
            serial_number=serial_number,
            instrument_type=instrument_type,
            manufacturer=manufacturer,
            location=location,
            skip=skip,
            limit=page_size,
        )

        return InstrumentListResponse(
            items=[InstrumentResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
        )


instrument_service = InstrumentService()
