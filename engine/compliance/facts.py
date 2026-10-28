"""Facts extraction and aggregation for the compliance rules engine."""

from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from engine.authenticity.dates import parse_ddmmyyyy, resolve_ref_date
from engine.compliance.config import DOC_EXTENSIONS, SLOT_FILES

KNOWN_FIELDS: List[str] = [
    "land_area_acre",
    "total_faculty",
    "total_students",
    "faculty_count_listed",
    "student_faculty_ratio",
    "noc_present",
    "noc_validity_ok",
    "land_deed_present",
    "trust_cert_present",
    "faculty_list_present",
]


def _check_file_exists(app_dir: Optional[Path], doc_stem: str) -> bool:
    """Check if any file with the given stem and supported extension exists in app_dir."""
    if app_dir is None or not app_dir.exists() or not app_dir.is_dir():
        return False

    for ext in DOC_EXTENSIONS:
        candidate = app_dir / f"{doc_stem}{ext}"
        if candidate.exists() and candidate.is_file():
            return True
    return False


def build_facts(
    application_dir: Any,
    form_data: Optional[Dict[str, Any]] = None,
    bundle: Optional[Dict[str, Any]] = None,
) -> Tuple[Dict[str, Any], Dict[str, str], Set[str]]:
    """Build facts dictionary, source mapping, and low confidence set from application inputs.

    Args:
        application_dir: Path to application folder containing documents.
        form_data: Dictionary of form claims and metadata.
        bundle: Optional bundle extracted by engine.extraction.extract_bundle.

    Returns:
        (facts, sources, low_conf)
          - facts: Dict[str, Any] mapping field name to resolved value (or None).
          - sources: Dict[str, str] mapping field name to provenance.
          - low_conf: Set[str] of field names that originated from low-confidence OCR.
    """
    form = form_data or {}
    app_dir = Path(application_dir) if application_dir else None

    facts: Dict[str, Any] = {}
    sources: Dict[str, str] = {}
    low_conf: Set[str] = set()

    # Index bundle extraction by doc_type
    doc_extractions: Dict[str, Dict[str, Any]] = {}
    if bundle and isinstance(bundle.get("extraction"), list):
        for item in bundle["extraction"]:
            dt = item.get("doc_type")
            if dt:
                doc_extractions[dt] = item

    # 1. Document presence checks (file system existence)
    land_deed_exists = _check_file_exists(app_dir, "land_deed")
    trust_cert_exists = _check_file_exists(app_dir, "trust_cert")
    faculty_list_exists = _check_file_exists(app_dir, "faculty_list")
    noc_exists = _check_file_exists(app_dir, "fire_noc")

    facts["land_deed_present"] = land_deed_exists
    sources["land_deed_present"] = "file_system"

    facts["trust_cert_present"] = trust_cert_exists
    sources["trust_cert_present"] = "file_system"

    facts["faculty_list_present"] = faculty_list_exists
    sources["faculty_list_present"] = "file_system"

    facts["noc_present"] = noc_exists
    sources["noc_present"] = "file_system"

    # 2. land_area_acre: claim from form_data; fallback to extracted land_deed.land_area_acre
    land_area_val = form.get("land_area_acre")
    if land_area_val is not None:
        try:
            facts["land_area_acre"] = float(land_area_val)
            sources["land_area_acre"] = "form_data"
        except (ValueError, TypeError):
            facts["land_area_acre"] = None
            sources["land_area_acre"] = "form_data"
    else:
        # Fallback to extracted land_deed
        ld_ext = doc_extractions.get("land_deed")
        if ld_ext and isinstance(ld_ext.get("fields"), dict):
            ld_fields = ld_ext["fields"]
            raw_area = ld_fields.get("land_area_acre")
            if raw_area is not None:
                try:
                    facts["land_area_acre"] = float(raw_area)
                    sources["land_area_acre"] = "land_deed.pdf"
                    if "land_area_acre" in ld_fields.get("_low_confidence", []):
                        low_conf.add("land_area_acre")
                except (ValueError, TypeError):
                    facts["land_area_acre"] = None
            else:
                facts["land_area_acre"] = None
        else:
            facts["land_area_acre"] = None

    # 3. total_faculty & total_students (form values, int or None)
    tot_fac = form.get("total_faculty")
    if tot_fac is not None:
        try:
            facts["total_faculty"] = int(tot_fac)
            sources["total_faculty"] = "form_data"
        except (ValueError, TypeError):
            facts["total_faculty"] = None
            sources["total_faculty"] = "form_data"
    else:
        facts["total_faculty"] = None

    tot_stu = form.get("total_students")
    if tot_stu is not None:
        try:
            facts["total_students"] = int(tot_stu)
            sources["total_students"] = "form_data"
        except (ValueError, TypeError):
            facts["total_students"] = None
            sources["total_students"] = "form_data"
    else:
        facts["total_students"] = None

    # 4. faculty_count_listed (from extracted faculty_list.faculty_count)
    fl_ext = doc_extractions.get("faculty_list")
    if fl_ext and isinstance(fl_ext.get("fields"), dict):
        fl_fields = fl_ext["fields"]
        raw_count = fl_fields.get("faculty_count")
        if raw_count is None:
            raw_count = fl_fields.get("total_faculty")

        if raw_count is not None:
            try:
                facts["faculty_count_listed"] = int(raw_count)
                sources["faculty_count_listed"] = "faculty_list.pdf"
                if "faculty_count" in fl_fields.get("_low_confidence", []) or "total_faculty" in fl_fields.get("_low_confidence", []):
                    low_conf.add("faculty_count_listed")
            except (ValueError, TypeError):
                facts["faculty_count_listed"] = None
        else:
            facts["faculty_count_listed"] = None
    else:
        facts["faculty_count_listed"] = None

    # 5. student_faculty_ratio = round(total_students / total_faculty, 2) if both present and total_faculty > 0 else None
    if facts["total_students"] is not None and facts["total_faculty"] is not None and facts["total_faculty"] > 0:
        facts["student_faculty_ratio"] = round(facts["total_students"] / facts["total_faculty"], 2)
        sources["student_faculty_ratio"] = "computed"
    else:
        facts["student_faculty_ratio"] = None

    # 6. noc_validity_ok = True if fire_noc validity_date >= reference date, False if earlier, None if unreadable or NOC missing
    if not noc_exists:
        facts["noc_validity_ok"] = None
    else:
        fn_ext = doc_extractions.get("fire_noc")
        if fn_ext and isinstance(fn_ext.get("fields"), dict):
            fn_fields = fn_ext["fields"]
            raw_date = fn_fields.get("valid_until") or fn_fields.get("validity_date") or fn_fields.get("expiry_date")
            parsed_date = parse_ddmmyyyy(raw_date)
            if parsed_date is not None:
                ref_d = resolve_ref_date(form)
                facts["noc_validity_ok"] = (parsed_date >= ref_d)
                sources["noc_validity_ok"] = "fire_noc.pdf"
                if "valid_until" in fn_fields.get("_low_confidence", []) or "validity_date" in fn_fields.get("_low_confidence", []):
                    low_conf.add("noc_validity_ok")
            else:
                facts["noc_validity_ok"] = None
        else:
            facts["noc_validity_ok"] = None

    return facts, sources, low_conf
