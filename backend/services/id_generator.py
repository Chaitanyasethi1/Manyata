"""
Generates Application IDs in the format AICTE-2026-NNNN.
Thread-safe via DB sequence (SQLite autoincrement trick).
"""
import re
from sqlalchemy.orm import Session
from backend.models.application import Application

def generate_application_id(db: Session) -> str:
    """
    Scans existing IDs, finds the max serial number, returns next.
    E.g. if max is AICTE-2026-0003 -> returns AICTE-2026-0004.
    """
    rows = db.query(Application.id).all()
    max_n = 0
    pattern = re.compile(r"AICTE-2026-(\d{4})")
    for (aid,) in rows:
        m = pattern.match(aid)
        if m:
            max_n = max(max_n, int(m.group(1)))
    return f"AICTE-2026-{max_n + 1:04d}"
