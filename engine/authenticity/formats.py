"""Format validation for registration and identification identifiers."""

import json
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Tuple

REGISTRATION_PATTERNS: Dict[str, Tuple[str, str]] = {
    "land_deed": ("registration_number", r"^SAMPLE/LD/\d{4}/\d{4}$"),
    "trust_cert": ("registration_number", r"^SAMPLE/TR/\d{4}/\d{4}$"),
    "fire_noc": ("noc_number", r"^SAMPLE/FIRE/\d{4}/\d{4}$"),
}

_FIELD_SPEC_PATH = Path("dataset/field_spec.json")


def load_pattern_from_spec(doc_type: str, field_name: str) -> Optional[str]:
    """Retrieve regex pattern for field from field_spec.json if available."""
    if _FIELD_SPEC_PATH.exists():
        try:
            with open(_FIELD_SPEC_PATH, "r", encoding="utf-8") as f:
                spec = json.load(f)
                return spec.get(doc_type, {}).get("fields", {}).get(field_name, {}).get("pattern")
        except Exception:
            pass
    return None


def validate_registration(value: Optional[str], pattern: str) -> bool:
    """Validate registration/NOC string against regex pattern."""
    if not value or not isinstance(value, str):
        return False
    return bool(re.match(pattern, value.strip()))


def check_format_flags(
    doc_type: str,
    fields: Dict[str, Any],
    low_confidence_fields: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Validate identifier format and return flags.

    Present but wrong -> registration_format_invalid.
    Missing or in _low_confidence -> unreadable_field (low).
    """
    if doc_type not in REGISTRATION_PATTERNS:
        return []

    field_name, default_pattern = REGISTRATION_PATTERNS[doc_type]
    pattern = load_pattern_from_spec(doc_type, field_name) or default_pattern

    val = fields.get(field_name)
    low_confs = set(low_confidence_fields or [])

    if val is None or field_name in low_confs:
        return [{
            "code": "unreadable_field",
            "field": field_name,
            "message": f"Identifier field '{field_name}' is missing or has low OCR confidence",
            "is_low_conf": True,
        }]

    if not validate_registration(str(val), pattern):
        return [{
            "code": "registration_format_invalid",
            "field": field_name,
            "message": f"Identifier '{val}' does not match the required format pattern '{pattern}'",
            "is_low_conf": False,
        }]

    return []
