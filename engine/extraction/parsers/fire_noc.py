import re
from typing import Any

def parse(pages_text: list[str]) -> dict[str, Any]:
    text = "\n".join(pages_text)

    def find(pattern: str, default=None):
        m = re.search(pattern, text, re.IGNORECASE)
        return m.group(1).strip() if m else default

    return {
        "noc_number":       find(r"NOC\s*Number\s*[:\-]?\s*(\S+)"),
        "issued_to":        find(r"Issued\s*To\s*[:\-]?\s*(.+)"),
        "premises":         find(r"Premises\s*[:\-]?\s*(.+)"),
        "issued_date":      find(r"Issued\s*Date\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})"),
        "valid_until":      find(r"Valid\s*Until\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})"),
        "issuing_authority":find(r"Issuing\s*Authority\s*[:\-]?\s*(.+)"),
    }
