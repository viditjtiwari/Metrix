from typing import List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.instrument import Instrument
from app.schemas.instrument import InstrumentCreate


class InstrumentRepository:
    """Repository handling database queries for instruments."""

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

    def list_by_owner(
        self, db: Session, owner_id: int, skip: int = 0, limit: int = 50
    ) -> Tuple[List[Instrument], int]:
        count_stmt = (
            select(func.count(Instrument.id))
            .where(Instrument.owner_id == owner_id)
        )
        total = db.execute(count_stmt).scalar_one()

        stmt = (
            select(Instrument)
            .where(Instrument.owner_id == owner_id)
            .order_by(Instrument.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.execute(stmt).scalars().all())
        return items, total

    def list_all(
        self, db: Session, skip: int = 0, limit: int = 50
    ) -> Tuple[List[Instrument], int]:
        count_stmt = select(func.count(Instrument.id))
        total = db.execute(count_stmt).scalar_one()

        stmt = (
            select(Instrument)
            .order_by(Instrument.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.execute(stmt).scalars().all())
        return items, total

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


instrument_repository = InstrumentRepository()
