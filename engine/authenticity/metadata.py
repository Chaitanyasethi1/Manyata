"""PDF metadata extraction and integrity analysis using PyMuPDF."""

import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import pymupdf

from .config import KNOWN_EDITORS, METADATA_GAP_DAYS
from .dates import parse_ddmmyyyy


def parse_pdf_date(date_str: Optional[str]) -> Optional[datetime.date]:
    """Parse a PDF date string (e.g., 'D:20261020143000' or 'D:20261020') into datetime.date."""
    if not date_str or not isinstance(date_str, str):
        return None

    clean = date_str.strip()
    if clean.startswith("D:"):
        clean = clean[2:]

    if len(clean) >= 8 and clean[:8].isdigit():
        try:
            return datetime.date(int(clean[:4]), int(clean[4:6]), int(clean[6:8]))
        except (ValueError, OverflowError):
            pass

    return None


def read_pdf_metadata(path: Union[str, Path]) -> Dict[str, Any]:
    """Extract metadata dictionary from PDF using PyMuPDF.

    Returns empty dictionary if file does not exist, is not a PDF, or fails to open.
    """
    path_obj = Path(path)
    if not path_obj.exists() or path_obj.suffix.lower() != ".pdf":
        return {}

    try:
        doc = pymupdf.open(str(path_obj))
        meta = doc.metadata or {}
        doc.close()
        return {
            "producer": meta.get("producer") or "",
            "creator": meta.get("creator") or "",
            "creationDate": meta.get("creationDate") or "",
            "modDate": meta.get("modDate") or "",
            "title": meta.get("title") or "",
            "author": meta.get("author") or "",
        }
    except Exception:
        return {}


def check_metadata_flags(
    path: Union[str, Path],
    doc_type: str,
    fields: Dict[str, Any],
    metadata: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """Analyze PDF metadata for editor traces or date discrepancies.

    Skips non-PDF images and faculty_list for date-gap checks.
    """
    path_obj = Path(path)
    if path_obj.suffix.lower() != ".pdf":
        return []

    meta = metadata if metadata is not None else read_pdf_metadata(path_obj)
    if not meta:
        return []

    producer = meta.get("producer", "")
    creator = meta.get("creator", "")
    combined_header = f"{producer} {creator}".lower()

    flags: List[Dict[str, Any]] = []

    # 1. Editor software trace check
    detected_editors = []
    for editor in KNOWN_EDITORS:
        if editor.lower() in combined_header:
            detected_editors.append(editor)

    if detected_editors:
        editors_str = ", ".join(detected_editors)
        flags.append({
            "code": "metadata_editor",
            "field": None,
            "message": (
                f"PDF metadata reveals editing software traces: {editors_str} "
                f"(Producer: '{producer}', Creator: '{creator}')"
            ),
        })

    # 2. Date gap check: modDate vs claimed date (skip faculty_list)
    if doc_type != "faculty_list":
        claimed_date_str = None
        if doc_type in ["land_deed", "trust_cert"]:
            claimed_date_str = fields.get("registration_date")
        elif doc_type == "fire_noc":
            claimed_date_str = fields.get("issue_date")

        claimed_date = parse_ddmmyyyy(claimed_date_str) if claimed_date_str else None
        mod_date = parse_pdf_date(meta.get("modDate")) or parse_pdf_date(meta.get("creationDate"))

        if claimed_date and mod_date:
            gap_days = (mod_date - claimed_date).days
            if gap_days > METADATA_GAP_DAYS:
                flags.append({
                    "code": "metadata_date_gap",
                    "field": "registration_date" if doc_type != "fire_noc" else "issue_date",
                    "message": (
                        f"PDF modification date ({mod_date.strftime('%d-%m-%Y')}) is {gap_days} days "
                        f"later than claimed document issue/registration date ({claimed_date.strftime('%d-%m-%Y')})"
                    ),
                })

    return flags
