"""System constants and configuration for the compliance engine."""

from pathlib import Path
from typing import Dict

# Paths
DEFAULT_RULES_PATH = Path("rules/rules.json")
DEFAULT_CHECKLIST_PATH = Path("engine/compliance/data/mandatory_documents.json")

# Document slot mapping (canonical PDF file names)
SLOT_FILES: Dict[str, str] = {
    "land_deed": "land_deed.pdf",
    "trust_cert": "trust_cert.pdf",
    "faculty_list": "faculty_list.pdf",
    "fire_noc": "fire_noc.pdf",
}

# Mapping of compliance fields to associated document file name
# Any field not present here maps to "application_form"
FIELD_DOCUMENT: Dict[str, str] = {
    "land_area_acre": "land_deed.pdf",
    "noc_present": "fire_noc.pdf",
    "noc_validity_ok": "fire_noc.pdf",
    "faculty_count_listed": "faculty_list.pdf",
    "land_deed_present": "land_deed.pdf",
    "trust_cert_present": "trust_cert.pdf",
    "faculty_list_present": "faculty_list.pdf",
}

# Severity ordering for sorting
SEVERITY_ORDER: Dict[str, int] = {
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 3,
}

# Supported document extensions for existence checks
DOC_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"]
