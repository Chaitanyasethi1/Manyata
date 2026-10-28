"""QR code detection, payload decoding, and consistency verification."""

import difflib
from typing import Any, Dict, List, Optional, Tuple
import cv2
import numpy as np

from .config import AREA_TOL, DOCS_WITH_QR, NAME_MATCH_MIN


def parse_qr_payload(payload_str: Optional[str]) -> Optional[Dict[str, Any]]:
    """Parse QR payload string in format 'SAMPLE|<doc_type>|<number>|<key>=<value>'.

    Returns:
        dict with keys 'prefix', 'doc_type', 'number', plus any extra key-value pairs,
        or None if format does not match.
    """
    if not payload_str or not isinstance(payload_str, str):
        return None

    clean = payload_str.strip()
    parts = clean.split("|")
    if len(parts) < 3:
        return None

    result: Dict[str, Any] = {
        "prefix": parts[0].strip(),
        "doc_type": parts[1].strip(),
        "number": parts[2].strip(),
    }

    for extra in parts[3:]:
        if "=" in extra:
            k, v = extra.split("=", 1)
            result[k.strip()] = v.strip()

    return result


def decode_qr(img: np.ndarray) -> Tuple[Optional[str], Optional[List[int]]]:
    """Decode QR code from image using cv2.QRCodeDetector with multi-stage fallbacks.

    Returns:
        (payload_string or None, bbox [x1, y1, x2, y2] or None)
    """
    if img is None or img.size == 0:
        return None, None

    detector = cv2.QRCodeDetector()

    def _extract_bbox(points: Optional[np.ndarray]) -> Optional[List[int]]:
        if points is None or len(points) == 0:
            return None
        pts = points.reshape(-1, 2)
        x1 = int(round(float(np.min(pts[:, 0]))))
        y1 = int(round(float(np.min(pts[:, 1]))))
        x2 = int(round(float(np.max(pts[:, 0]))))
        y2 = int(round(float(np.max(pts[:, 1]))))
        return [max(0, x1), max(0, y1), max(0, x2), max(0, y2)]

    # Attempt 1: Direct detection on input image
    try:
        val, pts, _ = detector.detectAndDecode(img)
        if val and val.strip():
            return val.strip(), _extract_bbox(pts)
    except Exception:
        pass

    # Attempt 2: Grayscale and adaptive thresholding
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 5
        )
        val, pts, _ = detector.detectAndDecode(thresh)
        if val and val.strip():
            return val.strip(), _extract_bbox(pts)
    except Exception:
        pass

    # Attempt 3: Upscale x2
    try:
        scaled = cv2.resize(img, (0, 0), fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
        val, pts, _ = detector.detectAndDecode(scaled)
        if val and val.strip():
            # Adjust bbox back to original scale
            raw_box = _extract_bbox(pts)
            if raw_box:
                return val.strip(), [int(c / 2.0) for c in raw_box]
            return val.strip(), None
    except Exception:
        pass

    # Attempt 4: Crop top-right quadrant (where official QR is placed) and upscale
    try:
        h, w = img.shape[:2]
        top_right = img[0 : int(h * 0.45), int(w * 0.55) : w]
        scaled_tr = cv2.resize(top_right, (0, 0), fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
        val, pts, _ = detector.detectAndDecode(scaled_tr)
        if val and val.strip():
            return val.strip(), None
    except Exception:
        pass

    return None, None


def check_qr_flags(
    img: Optional[np.ndarray],
    doc_type: str,
    fields: Dict[str, Any],
    field_bboxes: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """Verify QR code payload matches printed document fields.

    Only applies to docs with QR (land_deed, trust_cert, fire_noc).
    """
    if doc_type not in DOCS_WITH_QR or img is None:
        return []

    bboxes = field_bboxes or {}
    flags: List[Dict[str, Any]] = []

    payload_str, qr_box = decode_qr(img)
    if not payload_str:
        flags.append({
            "code": "qr_unreadable",
            "field": None,
            "message": f"QR code could not be detected or decoded on {doc_type}",
            "bbox": None,
        })
        return flags

    parsed = parse_qr_payload(payload_str)
    if not parsed:
        flags.append({
            "code": "qr_unreadable",
            "field": None,
            "message": f"QR code payload on {doc_type} has an unrecognized format: '{payload_str}'",
            "bbox": qr_box,
        })
        return flags

    qr_num = parsed.get("number", "")

    # 1. Compare identifier (registration_number / noc_number)
    id_field_name = "noc_number" if doc_type == "fire_noc" else "registration_number"
    printed_num = str(fields.get(id_field_name) or "").strip()

    if printed_num and qr_num and printed_num != qr_num:
        flags.append({
            "code": "qr_mismatch",
            "field": id_field_name,
            "message": (
                f"Document registration identifier in QR code ('{qr_num}') does not match "
                f"printed value ('{printed_num}')"
            ),
            "bbox": bboxes.get(id_field_name),
        })

    # 2. Compare secondary embedded facts
    if doc_type == "land_deed" and "area" in parsed:
        try:
            qr_area = float(parsed["area"])
            printed_area_val = fields.get("land_area_acre")
            if printed_area_val is not None:
                printed_area = float(printed_area_val)
                if abs(qr_area - printed_area) > AREA_TOL:
                    flags.append({
                        "code": "qr_mismatch",
                        "field": "land_area_acre",
                        "message": (
                            f"Land area in QR code ({qr_area:.1f} acre) does not match "
                            f"printed value ({printed_area:.1f} acre)"
                        ),
                        "bbox": bboxes.get("land_area_acre"),
                    })
        except (ValueError, TypeError):
            pass

    elif doc_type == "trust_cert" and "trust_name" in parsed:
        qr_tname = parsed["trust_name"].strip()
        printed_tname = str(fields.get("trust_name") or "").strip()
        if qr_tname and printed_tname:
            ratio = difflib.SequenceMatcher(
                None, qr_tname.lower(), printed_tname.lower()
            ).ratio()
            if ratio < NAME_MATCH_MIN:
                flags.append({
                    "code": "qr_mismatch",
                    "field": "trust_name",
                    "message": (
                        f"Trust name in QR code ('{qr_tname}') does not match "
                        f"printed value ('{printed_tname}')"
                    ),
                    "bbox": bboxes.get("trust_name"),
                })

    elif doc_type == "fire_noc" and "validity_date" in parsed:
        qr_vdate = parsed["validity_date"].strip()
        printed_vdate = str(fields.get("validity_date") or "").strip()
        if qr_vdate and printed_vdate and qr_vdate != printed_vdate:
            flags.append({
                "code": "qr_mismatch",
                "field": "validity_date",
                "message": (
                    f"Fire NOC validity date in QR code ({qr_vdate}) does not match "
                    f"printed value ({printed_vdate})"
                ),
                "bbox": bboxes.get("validity_date"),
            })

    return flags
