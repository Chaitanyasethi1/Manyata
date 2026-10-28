import re
from typing import Any

def parse(pages_text: list[str]) -> dict[str, Any]:
    text = "\n".join(pages_text)

    def find(pattern: str, default=None):
        m = re.search(pattern, text, re.IGNORECASE)
        return m.group(1).strip() if m else default

    return {
        "trust_name":         find(r"Trust\s*Name\s*[:\-]?\s*(.+)"),
        "registration_number":find(r"Registration\s*Number\s*[:\-]?\s*(\S+)"),
        "registered_on":      find(r"Registered\s*On\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})"),
        "valid_until":        find(r"Valid\s*Until\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})"),
        "issuing_authority":  find(r"Issuing\s*Authority\s*[:\-]?\s*(.+)"),
    }
