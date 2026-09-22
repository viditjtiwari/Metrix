from typing import List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.enums import InstrumentType
from app.models.instrument import Instrument
from app.schemas.instrument import InstrumentCreate


class InstrumentRepository:
    """Repository handling database queries and search for instruments."""

    def get_by_id(self, db: Session, instrument_id: int) -> Optional[Instrument]:
        stmt = select(Instrument).where(Instrument.id == instrument_id)
        return db.execute(stmt).scalar_one_or_none()

    def get_by_registration_number(
        self, db: Session, registration_number: str
    ) -> Optional[Instrument]:
        stmt = select(Instrument).where(
            Instrument.registration_number == registration_number.strip().upper()
        )
        return db.execute(stmt).scalar_one_or_none()

    def search(
        self,
        db: Session,
        *,
        owner_id: Optional[int] = None,
        registration_number: Optional[str] = None,
        serial_number: Optional[str] = None,
        instrument_type: Optional[InstrumentType] = None,
        manufacturer: Optional[str] = None,
        location: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Instrument], int]:
        filters = []
        if owner_id is not None:
            filters.append(Instrument.owner_id == owner_id)
        if registration_number:
            filters.append(Instrument.registration_number.ilike(f"%{registration_number.strip()}%"))
        if serial_number:
            filters.append(Instrument.serial_number.ilike(f"%{serial_number.strip()}%"))
        if instrument_type:
            filters.append(Instrument.instrument_type == instrument_type)
        if manufacturer:
            filters.append(Instrument.manufacturer.ilike(f"%{manufacturer.strip()}%"))
        if location:
            filters.append(Instrument.location.ilike(f"%{location.strip()}%"))

        count_stmt = select(func.count(Instrument.id))
        if filters:
            count_stmt = count_stmt.where(*filters)
        total = db.execute(count_stmt).scalar_one()

        stmt = select(Instrument)
        if filters:
            stmt = stmt.where(*filters)
        stmt = (
            stmt.order_by(Instrument.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.execute(stmt).scalars().all())
        return items, total

    def list_by_owner(
        self, db: Session, owner_id: int, skip: int = 0, limit: int = 50
    ) -> Tuple[List[Instrument], int]:
        return self.search(db, owner_id=owner_id, skip=skip, limit=limit)

    def list_all(
        self, db: Session, skip: int = 0, limit: int = 50
    ) -> Tuple[List[Instrument], int]:
        return self.search(db, skip=skip, limit=limit)

    def create(
        self,
        db: Session,
        *,
        registration_number: str,
        owner_id: int,
        instrument_data: InstrumentCreate,
    ) -> Instrument:
        instrument = Instrument(
            registration_number=registration_number,
            owner_id=owner_id,
            instrument_type=instrument_data.instrument_type,
            manufacturer=instrument_data.manufacturer.strip(),
            model_name=instrument_data.model_name.strip(),
            serial_number=instrument_data.serial_number.strip(),
            capacity=instrument_data.capacity.strip() if instrument_data.capacity else None,
            location=instrument_data.location.strip(),
            is_active=True,
        )
        db.add(instrument)
        db.flush()
        return instrument

    def update(
        self, db: Session, instrument_id: int, update_data: dict
    ) -> Optional[Instrument]:
        instrument = self.get_by_id(db, instrument_id)
        if not instrument:
            return None
        for key, val in update_data.items():
            if hasattr(instrument, key) and val is not None:
                setattr(instrument, key, val.strip() if isinstance(val, str) else val)
        db.flush()
        return instrument

    def deactivate(self, db: Session, instrument_id: int) -> Optional[Instrument]:
        instrument = self.get_by_id(db, instrument_id)
        if not instrument:
            return None
        instrument.is_active = False
        db.flush()
        return instrument


instrument_repository = InstrumentRepository()
