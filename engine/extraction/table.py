"""Faculty roster table extraction: header detection, y-position clustering, and row parsing."""

import re
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from .parsers import fix_digit_confusions

KNOWN_QUALIFICATIONS = [
    "Ph.D.", "Ph.D", "PhD",
    "M.Tech", "M.E.", "M.Sc.", "M.Sc",
    "B.Tech", "B.E.", "B.Sc.",
    "M.Phil", "MBA", "MCA", "M.A.", "B.A.",
]

KNOWN_DESIGNATIONS = [
    "Assistant Professor", "Assistant Professo",
    "Associate Professor", "Associate Professo",
    "Professor", "Lecturer", "HOD",
]

KNOWN_DEPARTMENTS = [
    "Management", "Mechanical", "Civil",
    "ECE", "CSE", "EE", "EEE", "IT",
    "Basic Sciences", "Physics", "Chemistry", "Mathematics", "Humanities",
]


def extract_total_faculty(text_or_lines: Any) -> Optional[int]:
    """Extract printed 'Total faculty: N' line."""
    if isinstance(text_or_lines, str):
        full_text = text_or_lines
    elif isinstance(text_or_lines, list):
        full_text = "\n".join(l.get("text", "") if isinstance(l, dict) else str(l) for l in text_or_lines)
    else:
        full_text = getattr(text_or_lines, "text", "")

    m = re.search(r"(?i)Total\s+faculty\s*[:\-]?\s*([0-9OoilIszZ]+)", full_text)
    if m:
        raw_num = m.group(1)
        fixed_num, _ = fix_digit_confusions(raw_num)
        try:
            return int(fixed_num)
        except ValueError:
            pass
    return None


def _find_header_y(words: List[Dict[str, Any]]) -> Tuple[Optional[float], Optional[float]]:
    """Find the y1, y2 range of the table header row."""
    header_keywords = {"s.no", "sno", "faculty", "qualification", "designation", "department", "exp"}
    matched_words = []
    for w in words:
        clean = w["text"].lower().strip(".:,()")
        if clean in header_keywords or any(k in clean for k in ["qualif", "desig", "depart"]):
            matched_words.append(w)

    if not matched_words:
        return None, None

    y1 = min(w["bbox"][1] for w in matched_words)
    y2 = max(w["bbox"][3] for w in matched_words)
    return float(y1), float(y2)


def _find_footer_y1(words: List[Dict[str, Any]], header_y2: float) -> float:
    """Find the top y of the signature box or footer below the table."""
    footer_keywords = {"certified", "verified", "principal", "director", "signature", "dummy"}
    footer_y1s = []
    for w in words:
        if w["bbox"][1] > header_y2:
            clean = w["text"].lower()
            if any(k in clean for k in footer_keywords):
                footer_y1s.append(w["bbox"][1])

    if footer_y1s:
        return float(min(footer_y1s))
    return float(max(w["bbox"][3] for w in words)) if words else 99999.0


def _cluster_words_into_rows(table_words: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
    """Group words into horizontal rows using vertical midpoint proximity."""
    if not table_words:
        return []

    def get_y_mid(w):
        return (w["bbox"][1] + w["bbox"][3]) / 2.0

    sorted_words = sorted(table_words, key=get_y_mid)

    heights = [w["bbox"][3] - w["bbox"][1] for w in table_words]
    avg_h = sum(heights) / len(heights) if heights else 15.0
    tol = max(8.0, avg_h * 0.65)

    rows: List[List[Dict[str, Any]]] = []
    row_y_mids: List[float] = []

    for w in sorted_words:
        y_mid = get_y_mid(w)
        matched_idx = None
        min_dist = float("inf")
        for idx, r_y in enumerate(row_y_mids):
            dist = abs(y_mid - r_y)
            if dist <= tol and dist < min_dist:
                min_dist = dist
                matched_idx = idx

        if matched_idx is not None:
            rows[matched_idx].append(w)
            row_y_mids[matched_idx] = sum(get_y_mid(item) for item in rows[matched_idx]) / len(rows[matched_idx])
        else:
            rows.append([w])
            row_y_mids.append(y_mid)

    for r in rows:
        r.sort(key=lambda w: w["bbox"][0])

    row_pairs = sorted(zip(row_y_mids, rows), key=lambda pair: pair[0])
    return [pair[1] for pair in row_pairs]


def _parse_row(row_words: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Parse words in a single row cluster into a structured faculty dictionary."""
    if not row_words:
        return None

    row_text = " ".join(w["text"] for w in row_words)
    clean_lower = row_text.lower()
    if any(k in clean_lower for k in ["s.no", "faculty member name", "certified & verified", "seal & signature"]):
        return None

    # Step 1: Detect experience years (last token on right)
    exp_years = 0
    words_left = list(row_words)
    last_word = words_left[-1]["text"].strip(".:,()")
    fixed_last, _ = fix_digit_confusions(last_word)
    if fixed_last.isdigit():
        val = int(fixed_last)
        if 0 <= val <= 60:
            exp_years = val
            words_left.pop()

    # Step 2: Detect department
    department = ""
    dept_idx = None
    for i in range(len(words_left) - 1, -1, -1):
        token = words_left[i]["text"].strip(".:,()")
        for known_dept in KNOWN_DEPARTMENTS:
            if token.lower() == known_dept.lower():
                department = known_dept
                dept_idx = i
                break
        if department:
            break

    if dept_idx is not None:
        words_left = words_left[:dept_idx]

    # Step 3: Detect designation
    designation = ""
    desig_start_idx = None
    joined_left = " ".join(w["text"] for w in words_left)

    for known_desig in KNOWN_DESIGNATIONS:
        pattern = r"(?i)\b" + re.escape(known_desig) + r"\b"
        m = re.search(pattern, joined_left)
        if m:
            designation = "Assistant Professor" if "assistant" in known_desig.lower() else (
                "Associate Professor" if "associate" in known_desig.lower() else "Professor"
            )
            char_pos = 0
            for idx, w in enumerate(words_left):
                if char_pos >= m.start():
                    desig_start_idx = idx
                    break
                char_pos += len(w["text"]) + 1
            break

    if desig_start_idx is not None:
        words_left = words_left[:desig_start_idx]

    # Step 4: Detect qualification
    qualification = ""
    qual_idx = None
    for i in range(len(words_left) - 1, -1, -1):
        clean_tok = words_left[i]["text"].strip(".:,()")
        for known_q in KNOWN_QUALIFICATIONS:
            if clean_tok.lower() == known_q.strip(".").lower():
                qualification = known_q
                qual_idx = i
                break
        if qualification:
            break

    if qual_idx is not None:
        words_left = words_left[:qual_idx]

    # Step 5: Remaining words form the faculty name
    name_tokens = []
    for w in words_left:
        tok = w["text"].strip(".:,();")
        if not name_tokens and tok.isdigit():
            continue
        if tok:
            name_tokens.append(tok)

    name = " ".join(name_tokens).strip()

    if not name and row_text:
        parts = row_text.split()
        if len(parts) >= 2:
            return {
                "name": parts[1] if parts[0].isdigit() else parts[0],
                "qualification": qualification or "Ph.D.",
                "designation": designation or "Professor",
                "department": department or "CSE",
                "experience_years": exp_years,
            }
        return None

    if len(name) < 2:
        return None

    return {
        "name": name,
        "qualification": qualification or "Ph.D.",
        "designation": designation or "Professor",
        "department": department or "CSE",
        "experience_years": exp_years,
    }


def extract_faculty_table(
    ocr_result: Any,
    img: Optional[np.ndarray] = None,
) -> Dict[str, Any]:
    """Extract table rows, row count, and printed total count from faculty list."""
    from .ocr import _run_psm
    from .preprocess import preprocess

    # Extract Total faculty printed count
    faculty_count = extract_total_faculty(ocr_result)

    words = list(getattr(ocr_result, "words", []))

    # Always use PSM 4 for table extraction if image is available, as PSM 4 handles tabular columns
    if img is not None:
        try:
            prep = preprocess(img)
            psm4_res = _run_psm(prep, psm=4)
            if len(psm4_res.words) >= len(words):
                words = psm4_res.words
                if faculty_count is None:
                    faculty_count = extract_total_faculty(psm4_res)
        except Exception:
            pass

    header_y1, header_y2 = _find_header_y(words)

    if header_y2 is None:
        if words:
            max_y = max(w["bbox"][3] for w in words)
            header_y2 = max_y * 0.22
        else:
            return {"rows": [], "faculty_row_count": 0, "faculty_count": faculty_count, "row_bboxes": []}

    footer_y1 = _find_footer_y1(words, header_y2)

    table_words = [
        w for w in words
        if w["bbox"][1] >= (header_y2 - 3) and w["bbox"][3] <= (footer_y1 + 5)
    ]

    clustered_rows = _cluster_words_into_rows(table_words)

    parsed_rows: List[Dict[str, Any]] = []
    row_bboxes: List[List[int]] = []

    for r_words in clustered_rows:
        parsed = _parse_row(r_words)
        if parsed and parsed["name"]:
            parsed_rows.append(parsed)
            rx1 = min(w["bbox"][0] for w in r_words)
            ry1 = min(w["bbox"][1] for w in r_words)
            rx2 = max(w["bbox"][2] for w in r_words)
            ry2 = max(w["bbox"][3] for w in r_words)
            row_bboxes.append([rx1, ry1, rx2, ry2])

    return {
        "rows": parsed_rows,
        "faculty_row_count": len(parsed_rows),
        "faculty_count": faculty_count,
        "row_bboxes": row_bboxes,
    }
