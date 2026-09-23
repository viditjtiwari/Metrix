import csv
import io
from typing import List
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.models.enums import InstrumentType
from app.models.user import User
from app.repositories.instrument_repository import instrument_repository
from app.schemas.instrument import (
    BatchInstrumentUploadResponse,
    BatchUploadErrorItem,
    InstrumentCreate,
    InstrumentResponse,
)
from app.services.instrument_service import instrument_service


class InstrumentBatchService:
    """Service handling bulk CSV parsing, validation, and registration of measuring instruments."""

    CSV_HEADERS = [
        "instrument_type",
        "manufacturer",
        "model_name",
        "serial_number",
        "capacity",
        "min_capacity",
        "max_capacity",
        "capacity_unit",
        "location",
    ]

    def get_sample_csv_template(self) -> str:
        """Return standardized CSV template with header row and sample records."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(self.CSV_HEADERS)
        writer.writerow([
            "WEIGHING_SCALE",
            "Avery Weigh-Tronix",
            "ZK830",
            "SN-AVERY-1001",
            "50 kg",
            "0.1 kg",
            "50 kg",
            "kg",
            "Warehouse Bay 4, Industrial Area, Pune",
        ])
        writer.writerow([
            "ELECTRONIC_BALANCE",
            "Sartorius",
            "Secura 224-1S",
            "SN-SAR-2045",
            "220 g",
            "0.1 mg",
            "220 g",
            "g",
            "Quality Control Lab, Sector 5, Gurugram",
        ])
        writer.writerow([
            "PETROL_DISPENSER",
            "Tokheim",
            "Quantium 510",
            "SN-DISP-8821",
            "45 L/min",
            "5 L/min",
            "45 L/min",
            "L",
            "Fuel Station Dispenser 3, Ring Road, Bengaluru",
        ])
        return output.getvalue()

    def process_csv_upload(
        self, db: Session, file: UploadFile, current_user: User
    ) -> BatchInstrumentUploadResponse:
        """Parse, validate, and bulk-register instruments from an uploaded CSV file."""
        if not file.filename or not file.filename.lower().endswith(".csv"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only CSV files (.csv) are supported for batch registration.",
            )

        content = file.file.read()
        try:
            text = content.decode("utf-8-sig")
        except UnicodeDecodeError:
            try:
                text = content.decode("latin-1")
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Unable to decode CSV file. Please ensure it is saved in UTF-8 format.",
                )

        reader = csv.DictReader(io.StringIO(text))
        if not reader.fieldnames:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded CSV file is empty or missing headers.",
            )

        # Normalize header keys to lowercase
        normalized_fieldnames = [f.strip().lower() for f in reader.fieldnames if f]
        missing_required = {"instrument_type", "manufacturer", "model_name", "serial_number", "location"} - set(normalized_fieldnames)
        if missing_required:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"CSV is missing mandatory columns: {', '.join(sorted(missing_required))}. Expected columns: {', '.join(self.CSV_HEADERS)}",
            )

        created_list: List[InstrumentResponse] = []
        errors_list: List[BatchUploadErrorItem] = []
        seen_batch_serials = set()
        total_rows = 0

        for row_idx, raw_row in enumerate(reader, start=2):  # row 1 is header
            total_rows += 1
            row = {k.strip().lower(): (v.strip() if v else "") for k, v in raw_row.items() if k}

            serial_num = row.get("serial_number", "")
            raw_type = row.get("instrument_type", "").upper().replace(" ", "_")

            # 1. Required field checks
            if not serial_num:
                errors_list.append(BatchUploadErrorItem(row=row_idx, serial_number=None, error="Missing serial_number."))
                continue

            if not row.get("manufacturer") or not row.get("model_name") or not row.get("location"):
                errors_list.append(BatchUploadErrorItem(row=row_idx, serial_number=serial_num, error="Missing manufacturer, model_name, or location."))
                continue

            # 2. Instrument Type validation
            try:
                valid_type = InstrumentType(raw_type)
            except ValueError:
                valid_types_str = ", ".join([e.value for e in InstrumentType])
                errors_list.append(BatchUploadErrorItem(row=row_idx, serial_number=serial_num, error=f"Invalid instrument_type '{raw_type}'. Allowed: {valid_types_str}"))
                continue

            # 3. Check duplicate in current batch
            if serial_num.upper() in seen_batch_serials:
                errors_list.append(BatchUploadErrorItem(row=row_idx, serial_number=serial_num, error=f"Duplicate serial_number '{serial_num}' in uploaded CSV batch."))
                continue
            seen_batch_serials.add(serial_num.upper())

            # 4. Check duplicate in database
            existing = instrument_repository.get_by_serial_number(db, serial_num)
            if existing:
                errors_list.append(BatchUploadErrorItem(row=row_idx, serial_number=serial_num, error=f"Instrument with serial number '{serial_num}' already registered in system."))
                continue

            # 5. Format capacity string if max_capacity/unit provided
            capacity_str = row.get("capacity") or None
            if not capacity_str and row.get("max_capacity"):
                capacity_str = f"{row.get('max_capacity')} {row.get('capacity_unit', '')}".strip()

            create_schema = InstrumentCreate(
                instrument_type=valid_type,
                manufacturer=row["manufacturer"],
                model_name=row["model_name"],
                serial_number=serial_num,
                capacity=capacity_str,
                min_capacity=row.get("min_capacity") or None,
                max_capacity=row.get("max_capacity") or None,
                capacity_unit=row.get("capacity_unit") or None,
                location=row["location"],
            )

            try:
                instrument = instrument_service.register_instrument(
                    db, instrument_data=create_schema, owner_id=current_user.id
                )
                created_list.append(InstrumentResponse.model_validate(instrument))
            except Exception as e:
                errors_list.append(BatchUploadErrorItem(row=row_idx, serial_number=serial_num, error=f"Registration failed: {str(e)}"))

        return BatchInstrumentUploadResponse(
            total_processed=total_rows,
            successful_count=len(created_list),
            failed_count=len(errors_list),
            created_instruments=created_list,
            errors=errors_list,
        )


instrument_batch_service = InstrumentBatchService()
