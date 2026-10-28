"""Confidence calculation and low-confidence field detection per document contract."""

from typing import Any, Dict, List, Optional, Tuple

LOW_CONF_THRESHOLD: float = 0.60

REQUIRED_FIELDS: Dict[str, List[str]] = {
    "land_deed": [
        "owner_name",
        "plot_number",
        "land_area_acre",
        "city",
        "registration_date",
        "registration_number",
    ],
    "trust_cert": [
        "trust_name",
        "registration_number",
        "registration_date",
        "address",
        "trustees",
        "institution_name",
    ],
    "faculty_list": [
        "institution_name",
        "faculty_count",
        "rows",
    ],
    "fire_noc": [
        "institution_name",
        "noc_number",
        "issue_date",
        "validity_date",
        "issuing_authority",
    ],
}

ALL_FIELDS: Dict[str, List[str]] = {
    "land_deed": [
        "owner_name",
        "plot_number",
        "land_area_acre",
        "city",
        "registration_date",
        "registration_number",
    ],
    "trust_cert": [
        "trust_name",
        "registration_number",
        "registration_date",
        "address",
        "trustees",
        "institution_name",
    ],
    "faculty_list": [
        "institution_name",
        "faculty_count",
        "faculty_row_count",
        "rows",
    ],
    "fire_noc": [
        "institution_name",
        "noc_number",
        "issue_date",
        "validity_date",
        "issuing_authority",
    ],
}


def compute_field_confidence(
    words: List[Dict[str, Any]],
    was_repaired: bool = False,
    default_conf: float = 0.0,
) -> float:
    """Compute per-field confidence = mean OCR word conf (0..1) of matching words, * 0.7 if repaired, 0 if not found."""
    if not words:
        conf = default_conf
    else:
        conf = sum(w.get("conf", 0.0) for w in words) / len(words)

    if was_repaired:
        conf *= 0.7

    return round(max(0.0, min(1.0, conf)), 4)


def compute_document_confidence(
    doc_type: str,
    fields: Dict[str, Any],
    field_confidences: Dict[str, float],
) -> Tuple[float, List[str]]:
    """Compute overall document confidence and list of low-confidence fields.

    Document confidence = mean of the REQUIRED fields' confidences (missing field counts as 0).
    _low_confidence = [field names whose conf < LOW_CONF_THRESHOLD or missing].
    """
    reqs = REQUIRED_FIELDS.get(doc_type, [])
    all_f = ALL_FIELDS.get(doc_type, reqs)

    if not reqs:
        return 0.0, list(all_f)

    # Document confidence is mean of REQUIRED fields
    confs = []
    for f in reqs:
        val = fields.get(f)
        if val is None:
            confs.append(0.0)
        else:
            confs.append(field_confidences.get(f, 0.0))

    doc_conf = sum(confs) / len(confs) if confs else 0.0
    doc_conf = round(max(0.0, min(1.0, doc_conf)), 4)

    # _low_confidence list
    low_conf_list: List[str] = []
    for f in all_f:
        val = fields.get(f)
        c = field_confidences.get(f, 0.0)
        if val is None or c < LOW_CONF_THRESHOLD:
            low_conf_list.append(f)

    return doc_conf, low_conf_list
