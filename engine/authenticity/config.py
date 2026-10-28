"""System constants and configuration for authenticity validation."""

from typing import List

REF_DATE: str = "25-10-2026"
EXPIRY_WARN_DAYS: int = 30
NAME_MATCH_MIN: float = 0.85
AREA_TOL: float = 0.05
METADATA_GAP_DAYS: int = 30

KNOWN_EDITORS: List[str] = [
    "photopea",
    "photoshop",
    "gimp",
    "paint.net",
    "pixlr",
    "canva",
    "affinity",
    "krita",
    "snapseed",
]

DOCS_WITH_QR: List[str] = [
    "land_deed",
    "trust_cert",
    "fire_noc",
]
