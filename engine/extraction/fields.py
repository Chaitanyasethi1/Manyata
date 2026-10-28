"""Field extractors per document type using OCR lines, labels, and parsers."""

import re
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from .confidence import compute_field_confidence
from .parsers import (
    parse_area_acre_with_meta,
    parse_date_with_meta,
    parse_labeled_value,
    parse_registration_number_with_meta,
)
from .table import extract_faculty_table, extract_total_faculty


def _filter_qr_noise_words(words: List[Dict[str, Any]], img: Optional[np.ndarray] = None) -> List[Dict[str, Any]]:
    """Remove words located in or adjacent to the top-right QR code area."""
    if not words:
        return []

    # Dynamic QR threshold based on page width
    page_w = img.shape[1] if img is not None else 1250
    page_h = img.shape[0] if img is not None else 1750
    qr_thresh_x = page_w * 0.72
    qr_thresh_y = page_h * 0.28

    filtered = []
    for w in words:
        x1 = w["bbox"][0]
        y1 = w["bbox"][1]
        if x1 >= qr_thresh_x and y1 <= qr_thresh_y:
            continue
        filtered.append(w)
    return filtered


def _extract_field_from_label(
    lines: List[Dict[str, Any]],
    label_patterns: List[str],
    parser_fn: Optional[Any] = None,
    clean_as_text: bool = False,
    img: Optional[np.ndarray] = None,
) -> Dict[str, Any]:
    """Helper to extract a labeled field with value, confidence, and bounding box."""
    matched_idx = -1
    matched_line = None

    for pattern in label_patterns:
        compiled = re.compile(pattern, re.IGNORECASE)
        for i, l in enumerate(lines):
            line_text = l.get("text", "")
            if compiled.search(line_text):
                matched_idx = i
                matched_line = l
                break
        if matched_line is not None:
            break

    if matched_line is None or matched_idx < 0:
        return {"value": None, "conf": 0.0, "bbox": None}

    line_text = matched_line.get("text", "")
    line_words = matched_line.get("words", [])

    # Find the colon in the line
    val_words: List[Dict[str, Any]] = []
    colon_idx = None
    for idx, w in enumerate(line_words):
        if ":" in w["text"]:
            colon_idx = idx
            break

    if colon_idx is not None and colon_idx + 1 < len(line_words):
        val_words = line_words[colon_idx + 1:]
    else:
        if colon_idx is not None and colon_idx + 1 == len(line_words) and matched_idx + 1 < len(lines):
            next_line = lines[matched_idx + 1]
            if ":" not in next_line.get("text", ""):
                val_words = next_line.get("words", [])
        if not val_words:
            val_words = line_words

    # Filter QR code artifacts from value words
    val_words = _filter_qr_noise_words(val_words, img=img)

    clean_text = " ".join(w["text"] for w in val_words).strip()
    clean_text = re.sub(r"[\.:,\-_]+$", "", clean_text).strip()

    was_repaired = False
    parsed_value = clean_text

    if parser_fn is not None:
        raw_tail = clean_text
        if not raw_tail and ":" in line_text:
            raw_tail = line_text.split(":", 1)[1].strip()
        parsed_value, was_repaired = parser_fn(raw_tail)
    elif clean_as_text:
        parsed_value = clean_text if clean_text else None

    if parsed_value is None:
        return {"value": None, "conf": 0.0, "bbox": None}

    conf = compute_field_confidence(
        val_words,
        was_repaired=was_repaired,
        default_conf=matched_line.get("conf", 0.85),
    )

    if val_words:
        bbox = [
            min(w["bbox"][0] for w in val_words),
            min(w["bbox"][1] for w in val_words),
            max(w["bbox"][2] for w in val_words),
            max(w["bbox"][3] for w in val_words),
        ]
    else:
        bbox = matched_line.get("bbox")

    return {"value": parsed_value, "conf": conf, "bbox": bbox}


def extract_land_deed_fields(ocr_result: Any, img: Optional[np.ndarray] = None) -> Dict[str, Dict[str, Any]]:
    """Extract fields for land_deed: owner_name, plot_number, land_area_acre, city, registration_date, registration_number."""
    lines = getattr(ocr_result, "lines", [])
    fields: Dict[str, Dict[str, Any]] = {}

    fields["registration_number"] = _extract_field_from_label(
        lines,
        [r"Deed\s+Registration\s+Number", r"Registration\s+Number"],
        parser_fn=lambda s: parse_registration_number_with_meta(s, r"^SAMPLE/LD/\d{4}/\d{4}$"),
        img=img,
    )

    fields["registration_date"] = _extract_field_from_label(
        lines,
        [r"Date\s+of\s+Registration", r"Registration\s+Date"],
        parser_fn=parse_date_with_meta,
        img=img,
    )

    fields["owner_name"] = _extract_field_from_label(
        lines,
        [r"Title\s+Owner\s*/\s*Society", r"Title\s+Owner"],
        clean_as_text=True,
        img=img,
    )

    fields["plot_number"] = _extract_field_from_label(
        lines,
        [r"Plot\s*/\s*Survey\s+Number", r"Survey\s+Number", r"Plot\s+Number"],
        clean_as_text=True,
        img=img,
    )

    fields["land_area_acre"] = _extract_field_from_label(
        lines,
        [r"Demarcated\s+Area\s*\(Acres\)", r"Demarcated\s+Area", r"Area\s*\(Acres\)"],
        parser_fn=parse_area_acre_with_meta,
        img=img,
    )

    fields["city"] = _extract_field_from_label(
        lines,
        [r"City\s*/\s*Revenue\s+District", r"Revenue\s+District", r"City"],
        clean_as_text=True,
        img=img,
    )

    return fields


def extract_trust_cert_fields(ocr_result: Any, img: Optional[np.ndarray] = None) -> Dict[str, Dict[str, Any]]:
    """Extract fields for trust_cert: trust_name, registration_number, registration_date, address, trustees, institution_name."""
    lines = getattr(ocr_result, "lines", [])
    fields: Dict[str, Dict[str, Any]] = {}

    fields["registration_number"] = _extract_field_from_label(
        lines,
        [r"Trust\s+Registration\s+Number", r"Registration\s+Number"],
        parser_fn=lambda s: parse_registration_number_with_meta(s, r"^SAMPLE/TR/\d{4}/\d{4}$"),
        img=img,
    )

    fields["registration_date"] = _extract_field_from_label(
        lines,
        [r"Date\s+of\s+Registration", r"Registration\s+Date"],
        parser_fn=parse_date_with_meta,
        img=img,
    )

    fields["trust_name"] = _extract_field_from_label(
        lines,
        [r"Trust\s*/\s*Society\s+Name", r"Trust\s+Name"],
        clean_as_text=True,
        img=img,
    )

    fields["institution_name"] = _extract_field_from_label(
        lines,
        [r"Sponsored\s+Institution"],
        clean_as_text=True,
        img=img,
    )

    fields["address"] = _extract_field_from_label(
        lines,
        [r"Registered\s+Office\s+Address"],
        clean_as_text=True,
        img=img,
    )

    # trustees: 3 lines following "Current Governing Trustees:"
    trustee_lines = []
    trustee_words = []
    start_collecting = False

    for i, line in enumerate(lines):
        text = line.get("text", "")
        if re.search(r"Current\s+Governing\s+Trustees", text, re.IGNORECASE):
            start_collecting = True
            m = re.search(r":\s*(?:1[\.:\-])?\s*(.*)$", text)
            if m and m.group(1).strip():
                trustee_lines.append(m.group(1).strip())
                trustee_words.extend(line.get("words", []))
            continue

        if start_collecting:
            m_t = re.match(r"^\s*([123])[\.:\-]\s*(.*)$", text)
            if m_t:
                name_clean = m_t.group(2).strip()
                if name_clean:
                    trustee_lines.append(name_clean)
                    trustee_words.extend(line.get("words", []))
            elif len(trustee_lines) < 3 and text.strip() and not re.search(r"(?:commissioner|signature|sample|state public)", text, re.IGNORECASE):
                trustee_lines.append(text.strip())
                trustee_words.extend(line.get("words", []))

            if len(trustee_lines) >= 3:
                break

    clean_trustees = [re.sub(r"^[0-9\.:\-\s]+", "", t).strip() for t in trustee_lines if t.strip()]

    if clean_trustees:
        conf = compute_field_confidence(trustee_words, default_conf=0.88)
        bbox = None
        if trustee_words:
            bbox = [
                min(w["bbox"][0] for w in trustee_words),
                min(w["bbox"][1] for w in trustee_words),
                max(w["bbox"][2] for w in trustee_words),
                max(w["bbox"][3] for w in trustee_words),
            ]
        fields["trustees"] = {"value": clean_trustees[:3], "conf": conf, "bbox": bbox}
    else:
        fields["trustees"] = {"value": None, "conf": 0.0, "bbox": None}

    return fields


def extract_faculty_list_fields(ocr_result: Any, img: Optional[np.ndarray] = None) -> Dict[str, Dict[str, Any]]:
    """Extract fields for faculty_list: institution_name, faculty_count, faculty_row_count, rows."""
    lines = getattr(ocr_result, "lines", [])
    fields: Dict[str, Dict[str, Any]] = {}

    inst_name = None
    inst_words = []
    inst_bbox = None
    inst_conf = 0.0

    for i, line in enumerate(lines[:5]):
        text = line.get("text", "").strip()
        if re.search(r"FACULTY\s+APPOINTMENT\s+ROSTER", text, re.IGNORECASE):
            continue
        if re.search(r"Academic\s+Year|Teaching\s+Staff|Total\s+faculty", text, re.IGNORECASE):
            continue
        if len(text) > 4:
            inst_name = text
            inst_words = line.get("words", [])
            inst_bbox = line.get("bbox")
            inst_conf = compute_field_confidence(inst_words, default_conf=line.get("conf", 0.90))
            break

    fields["institution_name"] = {
        "value": inst_name,
        "conf": inst_conf if inst_name else 0.0,
        "bbox": inst_bbox,
    }

    table_data = extract_faculty_table(ocr_result, img=img)

    fc_val = table_data.get("faculty_count")
    fields["faculty_count"] = {
        "value": fc_val,
        "conf": 0.95 if fc_val is not None else 0.0,
        "bbox": None,
    }

    frc_val = table_data.get("faculty_row_count", 0)
    fields["faculty_row_count"] = {
        "value": frc_val,
        "conf": 0.95 if frc_val > 0 else 0.0,
        "bbox": None,
    }

    rows_val = table_data.get("rows", [])
    row_bboxes = table_data.get("row_bboxes", [])
    table_bbox = None
    if row_bboxes:
        table_bbox = [
            min(b[0] for b in row_bboxes),
            min(b[1] for b in row_bboxes),
            max(b[2] for b in row_bboxes),
            max(b[3] for b in row_bboxes),
        ]

    fields["rows"] = {
        "value": rows_val if rows_val else None,
        "conf": 0.90 if rows_val else 0.0,
        "bbox": table_bbox,
    }

    return fields


def extract_fire_noc_fields(ocr_result: Any, img: Optional[np.ndarray] = None) -> Dict[str, Dict[str, Any]]:
    """Extract fields for fire_noc: institution_name, noc_number, issue_date, validity_date, issuing_authority."""
    lines = getattr(ocr_result, "lines", [])
    fields: Dict[str, Dict[str, Any]] = {}

    fields["noc_number"] = _extract_field_from_label(
        lines,
        [r"Fire\s+NOC\s+Reference\s+Number", r"NOC\s+Reference\s+Number"],
        parser_fn=lambda s: parse_registration_number_with_meta(s, r"^SAMPLE/FIRE/\d{4}/\d{4}$"),
        img=img,
    )

    fields["institution_name"] = _extract_field_from_label(
        lines,
        [r"Institution\s*/\s*Premises\s+Name", r"Premises\s+Name"],
        clean_as_text=True,
        img=img,
    )

    fields["issue_date"] = _extract_field_from_label(
        lines,
        [r"Date\s+of\s+Inspection\s*&\s*Issue", r"Inspection\s*&\s*Issue", r"Issue\s+Date"],
        parser_fn=parse_date_with_meta,
        img=img,
    )

    fields["validity_date"] = _extract_field_from_label(
        lines,
        [r"Certificate\s+Valid\s+Upto", r"Valid\s+Upto"],
        parser_fn=parse_date_with_meta,
        img=img,
    )

    fields["issuing_authority"] = _extract_field_from_label(
        lines,
        [r"Issuing\s+Fire\s+Authority", r"Fire\s+Authority"],
        clean_as_text=True,
        img=img,
    )

    return fields
