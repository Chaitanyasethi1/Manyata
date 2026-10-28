"""Date parsing, arithmetic, logic validation, and expiry checks."""

import datetime
from typing import Any, Dict, List, Optional, Tuple, Union

from .config import EXPIRY_WARN_DAYS, REF_DATE


def parse_ddmmyyyy(date_val: Union[str, datetime.date, None]) -> Optional[datetime.date]:
    """Parse a date value in DD-MM-YYYY (or datetime.date) into datetime.date."""
    if date_val is None:
        return None
    if isinstance(date_val, datetime.date):
        return date_val

    clean = str(date_val).strip()
    if not clean:
        return None

    # Handle standard separators: -, /, .
    for fmt in ["%d-%m-%Y", "%d/%m/%Y", "%d.%m.%Y"]:
        try:
            return datetime.datetime.strptime(clean, fmt).date()
        except ValueError:
            pass

    # Try parsing text month names e.g. "05 Mar 2021"
    for fmt in ["%d %b %Y", "%d %B %Y", "%d-%b-%Y", "%d-%B-%Y"]:
        try:
            return datetime.datetime.strptime(clean, fmt).date()
        except ValueError:
            pass

    return None


def days_between(d1: datetime.date, d2: datetime.date) -> int:
    """Return number of days from d1 to d2 (positive if d2 > d1)."""
    return (d2 - d1).days


def resolve_ref_date(form_data: Optional[Dict[str, Any]] = None) -> datetime.date:
    """Resolve the reference date from form_data['application_date'] or fallback to REF_DATE."""
    if form_data:
        app_date_str = form_data.get("application_date")
        parsed = parse_ddmmyyyy(app_date_str)
        if parsed is not None:
            return parsed

    fallback_parsed = parse_ddmmyyyy(REF_DATE)
    assert fallback_parsed is not None, f"Invalid REF_DATE: {REF_DATE}"
    return fallback_parsed


def check_date_logic(
    doc_type: str,
    fields: Dict[str, Any],
    ref_date: datetime.date,
) -> List[Dict[str, Any]]:
    """Check logical ordering of document dates relative to reference date and each other.

    Returns list of check result dictionaries with keys:
        code: "date_illogical"
        message: explanation containing relevant dates
        field: name of the problematic field
    """
    results: List[Dict[str, Any]] = []

    # 1. registration_date checks for land_deed and trust_cert
    if doc_type in ["land_deed", "trust_cert"]:
        reg_date_val = fields.get("registration_date")
        if reg_date_val:
            parsed_reg = parse_ddmmyyyy(reg_date_val)
            if parsed_reg is not None and parsed_reg > ref_date:
                ref_str = ref_date.strftime("%d-%m-%Y")
                results.append({
                    "code": "date_illogical",
                    "field": "registration_date",
                    "message": (
                        f"Registration date {reg_date_val} is in the future relative to "
                        f"reference date {ref_str}"
                    ),
                })

    # 2. fire_noc issue_date and validity_date checks
    if doc_type == "fire_noc":
        issue_val = fields.get("issue_date")
        validity_val = fields.get("validity_date")
        parsed_issue = parse_ddmmyyyy(issue_val) if issue_val else None
        parsed_validity = parse_ddmmyyyy(validity_val) if validity_val else None

        if parsed_issue is not None and parsed_issue > ref_date:
            ref_str = ref_date.strftime("%d-%m-%Y")
            results.append({
                "code": "date_illogical",
                "field": "issue_date",
                "message": (
                    f"Fire NOC issue date {issue_val} is in the future relative to "
                    f"reference date {ref_str}"
                ),
            })

        if parsed_issue is not None and parsed_validity is not None:
            if parsed_issue >= parsed_validity:
                results.append({
                    "code": "date_illogical",
                    "field": "validity_date",
                    "message": (
                        f"Fire NOC issue date {issue_val} is on or after its validity date {validity_val}"
                    ),
                })

    return results


def check_expiry(
    doc_type: str,
    fields: Dict[str, Any],
    ref_date: datetime.date,
    warn_days: int = EXPIRY_WARN_DAYS,
) -> List[Dict[str, Any]]:
    """Check validity and expiration dates (specifically Fire NOC).

    Returns list of check result dictionaries with code 'expired' or 'expiring_soon'.
    """
    results: List[Dict[str, Any]] = []

    if doc_type == "fire_noc":
        val_date_val = fields.get("validity_date")
        if not val_date_val:
            return results

        parsed_val = parse_ddmmyyyy(val_date_val)
        if parsed_val is None:
            return results

        ref_str = ref_date.strftime("%d-%m-%Y")

        if parsed_val < ref_date:
            overdue = (ref_date - parsed_val).days
            results.append({
                "code": "expired",
                "field": "validity_date",
                "message": (
                    f"Fire NOC expired on {val_date_val} "
                    f"({overdue} days overdue relative to application date {ref_str})"
                ),
            })
        elif parsed_val > ref_date and (parsed_val - ref_date).days <= warn_days:
            remaining = (parsed_val - ref_date).days
            results.append({
                "code": "expiring_soon",
                "field": "validity_date",
                "message": (
                    f"Fire NOC certificate validity expires soon on {val_date_val} "
                    f"({remaining} days remaining relative to application date {ref_str})"
                ),
            })

    return results
