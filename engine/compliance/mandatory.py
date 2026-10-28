"""Mandatory documents checklist verification."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

from engine.compliance.config import DEFAULT_CHECKLIST_PATH, DOC_EXTENSIONS, SLOT_FILES


def _doc_exists_in_dir(app_dir: Optional[Path], doc_type: str) -> bool:
    """Check if any file matching doc_type stem exists in app_dir."""
    if app_dir is None or not app_dir.exists() or not app_dir.is_dir():
        return False

    for ext in DOC_EXTENSIONS:
        candidate = app_dir / f"{doc_type}{ext}"
        if candidate.exists() and candidate.is_file():
            return True
    return False


def check_mandatory(
    application_dir: Any,
    form_data: Optional[Dict[str, Any]] = None,
    checklist_path: Optional[Union[str, Path]] = None,
) -> Tuple[List[str], List[Dict[str, Any]], List[str]]:
    """Check application directory for presence of mandatory documents according to checklist.

    Args:
        application_dir: Path to application folder.
        form_data: Application form data dictionary (reads 'application_type').
        checklist_path: Path to mandatory_documents.json checklist.

    Returns:
        (missing_doc_types, flags, warnings)
          - missing_doc_types: List[str] of missing document identifiers.
          - flags: List[dict] of C-MISSING flags.
          - warnings: List[str] of any warnings (e.g. unknown application_type).
    """
    form = form_data or {}
    app_dir = Path(application_dir) if application_dir else None
    c_path = Path(checklist_path) if checklist_path is not None else DEFAULT_CHECKLIST_PATH

    warnings: List[str] = []

    # Load checklist
    checklist_data: Dict[str, Any] = {}
    if c_path.exists():
        try:
            with open(c_path, "r", encoding="utf-8") as f:
                checklist_data = json.load(f)
        except Exception as e:
            warnings.append(f"Failed to load mandatory checklist from {c_path}: {e}")

    # Resolve application_type
    app_type = form.get("application_type")
    if not app_type:
        app_type = "new_approval"

    if app_type not in checklist_data:
        if checklist_data:
            warnings.append(f"Unknown application_type '{app_type}', falling back to 'new_approval'")
        config_entry = checklist_data.get("new_approval", {
            "documents": ["land_deed", "trust_cert", "faculty_list", "fire_noc"],
            "clause": "TO_VERIFY",
            "severity": "critical",
        })
    else:
        config_entry = checklist_data[app_type]

    req_docs: List[str] = config_entry.get("documents", [])
    clause: str = config_entry.get("clause", "TO_VERIFY")
    sev: str = config_entry.get("severity", "critical")

    missing_doc_types: List[str] = []
    flags: List[Dict[str, Any]] = []

    for doc_type in req_docs:
        if not _doc_exists_in_dir(app_dir, doc_type):
            missing_doc_types.append(doc_type)
            expected_file = SLOT_FILES.get(doc_type, f"{doc_type}.pdf")
            flag = {
                "id": f"C-MISSING-{doc_type}",
                "severity": sev,
                "message": f"Mandatory document missing: {doc_type} (expected {expected_file})",
                "document": expected_file,
                "evidence": {
                    "page": None,
                    "bbox": None,
                    "heatmap_path": None,
                },
                "clause": clause,
            }
            flags.append(flag)

    return missing_doc_types, flags, warnings
