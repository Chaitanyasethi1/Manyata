"""
Extracts structured fields from land deed OCR text.
All regex patterns tuned to the SAMPLE document format from P3.
"""
import re
from typing import Any

def parse(pages_text: list[str]) -> dict[str, Any]:
    text = "\n".join(pages_text)

    def find(pattern: str, default=None):
        m = re.search(pattern, text, re.IGNORECASE)
        return m.group(1).strip() if m else default

    area_raw = find(r"Area\s*\(sq\s*ft\)\s*[:\-]?\s*([\d,]+)")
    try:
        area_sqft = int(area_raw.replace(",", "")) if area_raw else None
    except ValueError:
        area_sqft = None

    return {
        "survey_number":     find(r"Survey\s*Number\s*[:\-]?\s*(\S+)"),
        "area_sqft":         area_sqft,
        "owner_name":        find(r"Owner\s*Name\s*[:\-]?\s*(.+)"),
        "registration_date": find(r"Registration\s*Date\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})"),
        "registrar_office":  find(r"Registrar\s*Office\s*[:\-]?\s*(.+)"),
    }
