from __future__ import annotations
from datetime import date, datetime, timezone
import hashlib
import json


def generate_canonical_payload(
    *,
    certificate_number: str,
    application_number: str,
    instrument_registration_number: str,
    instrument_serial_number: str,
    instrument_type: str,
    owner_identifier: str,
    inspection_result: str,
    issued_at: datetime | str,
    valid_from: date | str,
    valid_until: date | str,
    verification_token: str,
) -> str:
    """Create a deterministic canonical JSON string for SHA-256 integrity calculation."""
    if isinstance(issued_at, datetime):
        issued_str = issued_at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    elif isinstance(issued_at, str):
        try:
            dt = datetime.fromisoformat(issued_at.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            issued_str = dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        except Exception:
            issued_str = issued_at
    else:
        issued_str = str(issued_at)

    v_from_str = valid_from.isoformat() if hasattr(valid_from, "isoformat") else str(valid_from)
    v_until_str = valid_until.isoformat() if hasattr(valid_until, "isoformat") else str(valid_until)

    payload = {
        "application_number": application_number,
        "certificate_number": certificate_number,
        "inspection_result": inspection_result,
        "instrument_registration_number": instrument_registration_number,
        "instrument_serial_number": instrument_serial_number,
        "instrument_type": instrument_type,
        "issued_at": issued_str,
        "owner_identifier": owner_identifier,
        "valid_from": v_from_str,
        "valid_until": v_until_str,
        "verification_token": verification_token,
    }
    return json.dumps(payload, sort_keys=True, separators=(",", ":"))


def compute_integrity_hash(canonical_payload: str) -> str:
    """Compute SHA-256 hex digest of the canonical payload."""
    return hashlib.sha256(canonical_payload.encode("utf-8")).hexdigest()
