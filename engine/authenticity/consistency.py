"""Cross-document and form data consistency checks."""

import difflib
import string
from typing import Any, Dict, List, Optional, Tuple

from .config import AREA_TOL, NAME_MATCH_MIN


def normalize_text(s: Any) -> str:
    """Normalize text: lowercase, punctuation-stripped, and whitespace-collapsed."""
    if s is None:
        return ""
    text = str(s).lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    return " ".join(text.split())


def is_fuzzy_match(s1: Any, s2: Any, min_ratio: float = NAME_MATCH_MIN) -> bool:
    """Compare two strings using difflib SequenceMatcher on normalized text."""
    n1 = normalize_text(s1)
    n2 = normalize_text(s2)
    if not n1 or not n2:
        return False
    return difflib.SequenceMatcher(None, n1, n2).ratio() >= min_ratio


def check_consistency(
    extracted_docs: Dict[str, Dict[str, Any]],
    form_data: Optional[Dict[str, Any]] = None,
    doc_details: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """Compare extracted fields across documents and against application form data.

    Checks:
      - institution_name: trust_cert vs fire_noc vs faculty_list vs form
      - trust_name: trust_cert.trust_name vs land_deed.owner_name vs form["trust_name"]
      - land_area_acre: land_deed vs form
      - faculty_count: faculty_list vs form["total_faculty"]
      - faculty_list internal: faculty_count != faculty_row_count
      - land_deed city vs form["city"]
    """
    flags: List[Dict[str, Any]] = []
    form = form_data or {}
    details = doc_details or {}

    def get_field_info(doc_type: str, field_name: str) -> Tuple[Any, Optional[List[int]], bool]:
        """Return (value, bbox, is_low_conf)."""
        doc_item = extracted_docs.get(doc_type, {})
        fields = doc_item.get("fields", {})
        val = fields.get(field_name)

        low_confs = set(fields.get("_low_confidence", []))
        is_low = (field_name in low_confs)

        doc_det = details.get(doc_type, {})
        bboxes = doc_det.get("field_bboxes", {})
        bbox = bboxes.get(field_name)

        return val, bbox, is_low

    def get_doc_filename(doc_type: str) -> str:
        doc_det = details.get(doc_type, {})
        src = doc_det.get("source_file", "")
        if src:
            from pathlib import Path
            return Path(src).name
        return f"{doc_type}.pdf"

    # 1. Land Area check: land_deed vs form["land_area_acre"]
    ld_area, ld_area_box, ld_area_low = get_field_info("land_deed", "land_area_acre")
    form_area = form.get("land_area_acre")

    if ld_area is not None and form_area is not None:
        try:
            f_ld = float(ld_area)
            f_form = float(form_area)
            if abs(f_ld - f_form) > AREA_TOL:
                flags.append({
                    "code": "form_mismatch_numeric",
                    "doc_type": "land_deed",
                    "document": get_doc_filename("land_deed"),
                    "field": "land_area_acre",
                    "bbox": ld_area_box,
                    "is_low_conf": ld_area_low,
                    "message": (
                        f"Land area is {f_ld:.1f} acre in the land deed but "
                        f"{f_form:.1f} acre in the application form"
                    ),
                })
        except (ValueError, TypeError):
            pass

    # 2. Faculty Count check: faculty_list vs form["total_faculty"]
    fl_count, fl_count_box, fl_count_low = get_field_info("faculty_list", "faculty_count")
    form_faculty = form.get("total_faculty")

    if fl_count is not None and form_faculty is not None:
        try:
            i_fl = int(fl_count)
            i_form = int(form_faculty)
            if i_fl != i_form:
                flags.append({
                    "code": "form_mismatch_numeric",
                    "doc_type": "faculty_list",
                    "document": get_doc_filename("faculty_list"),
                    "field": "faculty_count",
                    "bbox": fl_count_box,
                    "is_low_conf": fl_count_low,
                    "message": (
                        f"Total faculty count is {i_fl} in the faculty list but "
                        f"{i_form} in the application form"
                    ),
                })
        except (ValueError, TypeError):
            pass

    # 3. Faculty List internal check: faculty_count != faculty_row_count
    fl_rows, _, _ = get_field_info("faculty_list", "faculty_row_count")
    if fl_count is not None and fl_rows is not None and int(fl_rows) > 0:
        try:
            if int(fl_count) != int(fl_rows):
                flags.append({
                    "code": "faculty_count_internal",
                    "doc_type": "faculty_list",
                    "document": get_doc_filename("faculty_list"),
                    "field": "faculty_count",
                    "bbox": fl_count_box,
                    "is_low_conf": fl_count_low,
                    "message": (
                        f"Printed total faculty count ({fl_count}) does not match "
                        f"the actual number of roster table rows ({fl_rows})"
                    ),
                })
        except (ValueError, TypeError):
            pass

    # 4. Institution Name checks
    inst_sources = []
    for dt in ["trust_cert", "fire_noc", "faculty_list"]:
        val, box, low = get_field_info(dt, "institution_name")
        if val:
            inst_sources.append((dt, val, box, low))

    form_inst = form.get("institution_name")

    # Document vs Form institution_name
    if form_inst:
        for dt, val, box, low in inst_sources:
            if not is_fuzzy_match(val, form_inst):
                flags.append({
                    "code": "form_mismatch_name",
                    "doc_type": dt,
                    "document": get_doc_filename(dt),
                    "field": "institution_name",
                    "bbox": box,
                    "is_low_conf": low,
                    "message": (
                        f"Institution name in {dt.replace('_', ' ')} ('{val}') does not match "
                        f"application form ('{form_inst}')"
                    ),
                })

    # Cross-document institution_name comparisons
    for i in range(len(inst_sources)):
        for j in range(i + 1, len(inst_sources)):
            dt1, val1, box1, low1 = inst_sources[i]
            dt2, val2, box2, low2 = inst_sources[j]
            if not is_fuzzy_match(val1, val2):
                flags.append({
                    "code": "cross_doc_name_mismatch",
                    "doc_type": dt1,
                    "document": get_doc_filename(dt1),
                    "field": "institution_name",
                    "bbox": box1,
                    "is_low_conf": (low1 or low2),
                    "message": (
                        f"Institution name in {dt1.replace('_', ' ')} ('{val1}') does not match "
                        f"{dt2.replace('_', ' ')} ('{val2}')"
                    ),
                })

    # 5. Trust Name checks (trust_cert.trust_name vs land_deed.owner_name vs form["trust_name"])
    tc_trust, tc_trust_box, tc_trust_low = get_field_info("trust_cert", "trust_name")
    ld_owner, ld_owner_box, ld_owner_low = get_field_info("land_deed", "owner_name")
    form_trust = form.get("trust_name")

    if form_trust and tc_trust:
        if not is_fuzzy_match(tc_trust, form_trust):
            flags.append({
                "code": "form_mismatch_name",
                "doc_type": "trust_cert",
                "document": get_doc_filename("trust_cert"),
                "field": "trust_name",
                "bbox": tc_trust_box,
                "is_low_conf": tc_trust_low,
                "message": (
                    f"Trust name in trust certificate ('{tc_trust}') does not match "
                    f"application form ('{form_trust}')"
                ),
            })

    if form_trust and ld_owner:
        if not is_fuzzy_match(ld_owner, form_trust):
            flags.append({
                "code": "form_mismatch_name",
                "doc_type": "land_deed",
                "document": get_doc_filename("land_deed"),
                "field": "owner_name",
                "bbox": ld_owner_box,
                "is_low_conf": ld_owner_low,
                "message": (
                    f"Owner name in land deed ('{ld_owner}') does not match "
                    f"trust name in application form ('{form_trust}')"
                ),
            })

    if tc_trust and ld_owner:
        if not is_fuzzy_match(tc_trust, ld_owner):
            flags.append({
                "code": "cross_doc_name_mismatch",
                "doc_type": "land_deed",
                "document": get_doc_filename("land_deed"),
                "field": "owner_name",
                "bbox": ld_owner_box,
                "is_low_conf": (tc_trust_low or ld_owner_low),
                "message": (
                    f"Owner name in land deed ('{ld_owner}') does not match "
                    f"trust name in trust certificate ('{tc_trust}')"
                ),
            })

    # 6. City check: land_deed city vs form city
    ld_city, ld_city_box, ld_city_low = get_field_info("land_deed", "city")
    form_city = form.get("city")
    if ld_city and form_city:
        if not is_fuzzy_match(ld_city, form_city):
            flags.append({
                "code": "form_mismatch_name",
                "doc_type": "land_deed",
                "document": get_doc_filename("land_deed"),
                "field": "city",
                "bbox": ld_city_box,
                "is_low_conf": ld_city_low,
                "message": (
                    f"City in land deed ('{ld_city}') does not match "
                    f"city in application form ('{form_city}')"
                ),
            })

    return flags
