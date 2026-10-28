import re
from typing import Any

def parse(pages_text: list[str]) -> dict[str, Any]:
    text = "\n".join(pages_text)

    def find(pattern: str, default=None):
        m = re.search(pattern, text, re.IGNORECASE)
        return m.group(1).strip() if m else default

    total_raw = find(r"Total\s*Faculty\s*[:\-]?\s*(\d+)")
    try:
        total_faculty = int(total_raw) if total_raw else None
    except ValueError:
        total_faculty = None

    return {
        "institution_name": find(r"Institution\s*[:\-]?\s*(.+)"),
        "prepared_date":    find(r"Prepared\s*Date\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})"),
        "total_faculty":    total_faculty,
    }
