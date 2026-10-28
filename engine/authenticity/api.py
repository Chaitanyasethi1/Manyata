"""Public API for authenticity validation module."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union

from engine.common.subscore import compute_sub_score
from engine.extraction import extract_bundle, extract_document
from engine.extraction.loader import load_pages

from .config import REF_DATE
from .consistency import check_consistency
from .dates import check_date_logic, check_expiry, resolve_ref_date
from .formats import check_format_flags
from .metadata import check_metadata_flags
from .qr import check_qr_flags
from .registry import check_registry_flags

SEVERITY_ORDER: Dict[str, int] = {
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 3,
}

_SEVERITY_PATH = Path("engine/authenticity/severity.json")


def load_severity_map() -> Dict[str, str]:
    """Load code -> severity map from severity.json with defaults."""
    defaults = {
        "slot_mismatch": "high",
        "registration_format_invalid": "high",
        "date_illogical": "high",
        "expired": "critical",
        "expiring_soon": "low",
        "form_mismatch_numeric": "critical",
        "form_mismatch_name": "high",
        "cross_doc_name_mismatch": "high",
        "faculty_count_internal": "medium",
        "metadata_editor": "medium",
        "metadata_date_gap": "medium",
        "qr_mismatch": "high",
        "qr_unreadable": "low",
        "registry_not_found": "high",
        "registry_mismatch": "high",
        "unreadable_field": "low",
    }
    if _SEVERITY_PATH.exists():
        try:
            with open(_SEVERITY_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                defaults.update(data)
        except Exception:
            pass
    return defaults


def _format_and_dedupe_flags(
    raw_flags: List[Dict[str, Any]],
    low_confidence_fields: Optional[Set[str]] = None,
) -> List[Dict[str, Any]]:
    """Format, assign IDs, apply confidence-aware severity downgrade, dedupe, and sort flags."""
    severity_map = load_severity_map()
    low_confs = low_confidence_fields or set()

    seen_keys: Set[Tuple[str, str, Optional[str]]] = set()
    formatted: List[Dict[str, Any]] = []

    id_counter: Dict[str, int] = {}

    for raw in raw_flags:
        code = raw["code"]
        doc_name = raw.get("document") or "unknown.pdf"
        field_name = raw.get("field")

        dedupe_key = (code, doc_name, field_name)
        if dedupe_key in seen_keys:
            continue
        seen_keys.add(dedupe_key)

        default_sev = severity_map.get(code, "medium")
        message = raw.get("message", "")
        is_low_conf = raw.get("is_low_conf", False) or (field_name in low_confs if field_name else False)

        # Confidence-aware downgrade
        if is_low_conf and default_sev in ["critical", "high", "medium"]:
            severity = "low"
            if "low OCR confidence" not in message:
                message = f"{message}, possible mismatch, low OCR confidence, verify manually"
        else:
            severity = default_sev

        id_counter[code] = id_counter.get(code, 0) + 1
        flag_id = f"A-{code.upper()}-{id_counter[code]:02d}"

        formatted.append({
            "id": flag_id,
            "severity": severity,
            "message": message,
            "document": doc_name,
            "evidence": {
                "page": 1,
                "bbox": raw.get("bbox"),
                "heatmap_path": None,
            },
            "clause": None,
        })

    # Sort: critical first, then document name, then id
    formatted.sort(key=lambda f: (
        SEVERITY_ORDER.get(f["severity"], 99),
        f["document"],
        f["id"],
    ))

    return formatted


def check_single_document(
    path: Union[str, Path],
    doc_type: Optional[str] = None,
    form_data: Optional[Dict[str, Any]] = None,
    extraction: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """Validate a single document image/PDF without cross-document comparisons.

    Used by single-document evaluation and diagnostics.
    """
    path_obj = Path(path)
    doc_name = path_obj.name

    ref_date = resolve_ref_date(form_data)

    # Use provided extraction or run extraction on the document
    if extraction is not None:
        doc_res = extraction
    else:
        try:
            doc_res = extract_document(path_obj, expected_doc_type=doc_type)
        except Exception:
            return []

    effective_type = doc_type or doc_res.get("doc_type", "unknown")
    fields = doc_res.get("fields", {})
    details = doc_res.get("details", {})
    field_bboxes = details.get("field_bboxes", {})
    low_confs = set(fields.get("_low_confidence", []))

    raw_flags: List[Dict[str, Any]] = []

    # 1. Slot mismatch
    if details.get("slot_mismatch"):
        pred = details.get("predicted_doc_type")
        raw_flags.append({
            "code": "slot_mismatch",
            "document": doc_name,
            "field": None,
            "message": f"Document uploaded in wrong slot: predicted as {pred} but placed in {effective_type} slot",
            "bbox": None,
        })

    # 2. Format validation
    format_flags = check_format_flags(effective_type, fields, list(low_confs))
    for f in format_flags:
        f["document"] = doc_name
        f["bbox"] = field_bboxes.get(f.get("field"))
        raw_flags.append(f)

    # 3. Date logic
    date_flags = check_date_logic(effective_type, fields, ref_date)
    for f in date_flags:
        f["document"] = doc_name
        f["bbox"] = field_bboxes.get(f.get("field"))
        raw_flags.append(f)

    # 4. Expiry
    expiry_flags = check_expiry(effective_type, fields, ref_date)
    for f in expiry_flags:
        f["document"] = doc_name
        f["bbox"] = field_bboxes.get(f.get("field"))
        raw_flags.append(f)

    # 5. Metadata (PDF only)
    meta_flags = check_metadata_flags(path_obj, effective_type, fields)
    for f in meta_flags:
        f["document"] = doc_name
        f["bbox"] = field_bboxes.get(f.get("field"))
        raw_flags.append(f)

    # 6. QR validation
    if effective_type in ["land_deed", "trust_cert", "fire_noc"]:
        try:
            pages = load_pages(path_obj, dpi=200)
            if pages:
                qr_flags_list = check_qr_flags(pages[0], effective_type, fields, field_bboxes)
                for f in qr_flags_list:
                    f["document"] = doc_name
                    raw_flags.append(f)
        except Exception:
            pass

    # 7. Mock registry lookup
    reg_flags = check_registry_flags(effective_type, fields, field_bboxes, list(low_confs))
    for f in reg_flags:
        f["document"] = doc_name
        raw_flags.append(f)

    return _format_and_dedupe_flags(raw_flags, low_confs)


def run_authenticity(
    application_dir: Union[str, Path],
    form_data: Dict[str, Any],
    bundle: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Execute authenticity validation module on an application bundle.

    Args:
        application_dir: Path to application folder (e.g. dataset/applications/app_01).
        form_data: Application form data dictionary.
        bundle: Pre-computed bundle extraction dict. If None, extract_bundle is called.

    Returns:
        {
            "module": "authenticity",
            "sub_score": number 0..100,
            "flags": [ ... ]
        }
    """
    app_path = Path(application_dir)
    ref_date = resolve_ref_date(form_data)

    # Retrieve or extract bundle
    if bundle is not None:
        bundle_data = bundle
    else:
        bundle_data = extract_bundle(app_path)

    extraction_items = bundle_data.get("extraction", [])
    details_map = bundle_data.get("details", {})

    extracted_docs: Dict[str, Dict[str, Any]] = {}
    for item in extraction_items:
        dt = item.get("doc_type")
        if dt:
            extracted_docs[dt] = item

    all_low_confs: Set[str] = set()
    raw_flags: List[Dict[str, Any]] = []

    # Single-document checks (1 through 7) for each slot
    for dt, item in extracted_docs.items():
        fields = item.get("fields", {})
        doc_details = details_map.get(dt, {})
        field_bboxes = doc_details.get("field_bboxes", {})
        low_confs = set(fields.get("_low_confidence", []))
        all_low_confs.update(low_confs)

        source_file = doc_details.get("source_file") or str(app_path / f"{dt}.pdf")
        doc_name = Path(source_file).name

        # 1. Slot mismatch
        if doc_details.get("slot_mismatch"):
            pred = doc_details.get("predicted_doc_type")
            raw_flags.append({
                "code": "slot_mismatch",
                "document": doc_name,
                "field": None,
                "message": f"Document uploaded in wrong slot: predicted as {pred} but placed in {dt} slot",
                "bbox": None,
            })

        # 2. Format validation
        for f in check_format_flags(dt, fields, list(low_confs)):
            f["document"] = doc_name
            f["bbox"] = field_bboxes.get(f.get("field"))
            raw_flags.append(f)

        # 3. Date logic
        for f in check_date_logic(dt, fields, ref_date):
            f["document"] = doc_name
            f["bbox"] = field_bboxes.get(f.get("field"))
            raw_flags.append(f)

        # 4. Expiry
        for f in check_expiry(dt, fields, ref_date):
            f["document"] = doc_name
            f["bbox"] = field_bboxes.get(f.get("field"))
            raw_flags.append(f)

        # 5. Metadata (PDF only)
        for f in check_metadata_flags(source_file, dt, fields):
            f["document"] = doc_name
            f["bbox"] = field_bboxes.get(f.get("field"))
            raw_flags.append(f)

        # 6. QR validation
        if dt in ["land_deed", "trust_cert", "fire_noc"]:
            try:
                pages = load_pages(source_file, dpi=200)
                if pages:
                    for f in check_qr_flags(pages[0], dt, fields, field_bboxes):
                        f["document"] = doc_name
                        raw_flags.append(f)
            except Exception:
                pass

        # 7. Mock registry lookup
        for f in check_registry_flags(dt, fields, field_bboxes, list(low_confs)):
            f["document"] = doc_name
            raw_flags.append(f)

    # 8. Cross-document and form consistency checks
    consistency_flags = check_consistency(
        extracted_docs=extracted_docs,
        form_data=form_data,
        doc_details=details_map,
    )
    raw_flags.extend(consistency_flags)

    # Format, apply confidence downgrades, dedupe, and sort flags
    final_flags = _format_and_dedupe_flags(raw_flags, all_low_confs)

    # Compute subscore
    sub_score = compute_sub_score(final_flags)

    return {
        "module": "authenticity",
        "sub_score": sub_score,
        "flags": final_flags,
    }
