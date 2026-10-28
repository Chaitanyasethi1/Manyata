"""Main pipeline orchestrator for AICTE application validation engine."""

import copy
import hashlib
import json
import os
import re
import time
from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Union

from jsonschema import ValidationError, validate

from engine.errors import EngineError

# Cached contract schema
_SCHEMA_PATH = Path("contracts/validation_result.schema.json")
_CACHED_SCHEMA: Optional[Dict[str, Any]] = None


def _get_schema() -> Dict[str, Any]:
    """Load and cache the validation result contract schema."""
    global _CACHED_SCHEMA
    if _CACHED_SCHEMA is None:
        if not _SCHEMA_PATH.exists():
            raise EngineError(f"Schema file not found at {_SCHEMA_PATH}", stage="contract")
        with open(_SCHEMA_PATH, "r", encoding="utf-8") as f:
            _CACHED_SCHEMA = json.load(f)
    return _CACHED_SCHEMA


def _compute_file_sha256(path: Union[str, Path]) -> Optional[str]:
    """Compute SHA-256 hex digest of a file, or return None if missing/unreadable."""
    p = Path(path)
    if not p.exists() or not p.is_file():
        return None
    try:
        h = hashlib.sha256()
        with open(p, "rb") as f:
            while chunk := f.read(65536):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return None


def resolve_application_id(application_dir: Any, form_data: Optional[Dict[str, Any]] = None) -> str:
    """Resolve and validate the AICTE application ID.

    Rules:
      1. form_data['application_id'] if it matches ^AICTE-2026-\\d{4}$
      2. Else derive from folder name 'app_0N' -> 'AICTE-2026-000N'
      3. Else raise ValueError('application_id missing')
    """
    form = form_data or {}
    app_id = form.get("application_id")
    if app_id and isinstance(app_id, str) and re.match(r"^AICTE-2026-\d{4}$", app_id.strip()):
        return app_id.strip()

    if application_dir:
        folder_name = Path(application_dir).name
        m = re.match(r"^app_0?(\d+)$", folder_name, re.IGNORECASE)
        if m:
            num = int(m.group(1))
            return f"AICTE-2026-{num:04d}"

    raise ValueError("application_id missing")


def run_validation_full(
    application_dir: Any,
    form_data: Optional[Dict[str, Any]] = None,
    storage_dir: Optional[Union[str, Path]] = None,
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Execute the full engine validation pipeline across all four stages.

    Args:
        application_dir: Path to directory containing document files.
        form_data: Application form data dictionary (treated as immutable).
        storage_dir: Storage directory for output artifacts like heatmaps.
                     Defaults to arg, env STORAGE_DIR, or 'storage'.

    Returns:
        (result, details)
          - result: Dict conforming to contracts/validation_result.schema.json
          - details: Detailed execution metadata, timings, facts, and provenance.

    Raises:
        ValueError: If application_id cannot be resolved.
        EngineError: If an internal stage fails or contract validation fails.
    """
    total_start = time.perf_counter()

    # Never mutate caller's form_data
    form_copy = copy.deepcopy(form_data) if form_data else {}

    # 1. Resolve application_id
    app_id = resolve_application_id(application_dir, form_copy)

    # 2. Resolve storage directory
    effective_storage = (
        str(storage_dir)
        if storage_dir is not None
        else os.environ.get("STORAGE_DIR", "storage")
    )

    # 3. Stage: Extraction
    t0 = time.perf_counter()
    try:
        from engine.extraction import extract_bundle
        bundle = extract_bundle(application_dir)
    except Exception as e:
        raise EngineError(f"Extraction stage failed: {e}", stage="extraction", cause=e) from e
    t_extraction = time.perf_counter() - t0

    # 4. Stage: Authenticity
    t0 = time.perf_counter()
    try:
        from engine.authenticity import run_authenticity
        auth_res = run_authenticity(application_dir, form_copy, bundle=bundle)
    except Exception as e:
        raise EngineError(f"Authenticity stage failed: {e}", stage="authenticity", cause=e) from e
    t_authenticity = time.perf_counter() - t0

    # 5. Stage: Forgery
    t0 = time.perf_counter()
    try:
        from engine.forgery import run_forgery
        forgery_res = run_forgery(application_dir, form_copy, bundle=bundle, storage_dir=effective_storage)
    except Exception as e:
        raise EngineError(f"Forgery stage failed: {e}", stage="forgery", cause=e) from e
    t_forgery = time.perf_counter() - t0

    # 6. Stage: Compliance
    t0 = time.perf_counter()
    try:
        from engine.compliance import evaluate_compliance
        comp_res, comp_details = evaluate_compliance(application_dir, form_copy, bundle=bundle)
    except Exception as e:
        raise EngineError(f"Compliance stage failed: {e}", stage="compliance", cause=e) from e
    t_compliance = time.perf_counter() - t0

    # 7. Construct Result dictionary in exact order: [authenticity, forgery, compliance]
    result: Dict[str, Any] = {
        "application_id": app_id,
        "extraction": bundle.get("extraction", []),
        "modules": [auth_res, forgery_res, comp_res],
    }

    # 8. Validate against contract schema
    schema = _get_schema()
    try:
        validate(instance=result, schema=schema)
    except ValidationError as e:
        raise EngineError(f"Contract schema validation failed: {e.message}", stage="contract", cause=e) from e

    total_time = time.perf_counter() - total_start

    # 9. Compile Details metadata
    warnings: list = list(comp_details.get("warnings", []))

    rules_path = Path("rules/rules.json")
    checklist_path = Path("engine/compliance/data/mandatory_documents.json")
    scoring_path = Path("backend/config/scoring.json")

    details: Dict[str, Any] = {
        "application_id": app_id,
        "mode": "real",
        "bundle_details": bundle.get("details", {}),
        "compliance": comp_details,
        "timings_sec": {
            "extraction": round(t_extraction, 3),
            "authenticity": round(t_authenticity, 3),
            "forgery": round(t_forgery, 3),
            "compliance": round(t_compliance, 3),
            "total": round(total_time, 3),
        },
        "warnings": warnings,
        "engine_versions": {
            "rules_file_sha256": _compute_file_sha256(rules_path),
            "mandatory_list_sha256": _compute_file_sha256(checklist_path),
            "scoring_config_sha256": _compute_file_sha256(scoring_path),
        },
    }

    return result, details


def run_validation(
    application_dir: Any,
    form_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Execute the engine validation pipeline, returning contract ValidationResult.

    Args:
        application_dir: Path to application folder.
        form_data: Application form data dictionary.

    Returns:
        ValidationResult dict conforming to contracts/validation_result.schema.json
    """
    result, _ = run_validation_full(application_dir, form_data)
    return result
