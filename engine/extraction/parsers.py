"""Pure deterministic parsing functions for OCR text (no files, no models, no external deps)."""

import datetime
import difflib
import re
from typing import Any, List, Optional, Tuple, Union

MONTH_MAP = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}

DIGIT_CONFUSIONS = {
    "O": "0", "o": "0",
    "I": "1", "l": "1", "i": "1", "|": "1",
    "S": "5", "s": "5",
    "B": "8",
    "Z": "2", "z": "2",
}


def fix_digit_confusions(s: str) -> Tuple[str, bool]:
    """Replace common OCR character confusions with digits.

    Returns (repaired_string, was_repaired).
    """
    repaired = []
    was_repaired = False
    for char in s:
        if char in DIGIT_CONFUSIONS:
            repaired.append(DIGIT_CONFUSIONS[char])
            was_repaired = True
        else:
            repaired.append(char)
    return "".join(repaired), was_repaired


def parse_date_with_meta(s: Optional[str]) -> Tuple[Optional[str], bool]:
    """Parse date string into DD-MM-YYYY format and return (formatted_date, was_repaired).

    Accepts formats:
      - DD-MM-YYYY, DD/MM/YYYY, D.M.YYYY
      - '05 Mar 2021', '5 March 2021', '05-Mar-2021'
      - OCR confusions like 'O5-O3-2O21'
    Rejects invalid calendar dates.
    """
    if not s or not isinstance(s, str):
        return None, False

    clean = s.strip()
    if not clean:
        return None, False

    # Check for text month names first (e.g. "05 Mar 2021", "5 March 2021")
    text_month_pattern = r"(?i)\b(\d{1,2})[\s\-/.]([a-zA-Z]{3,9})[\s\-/.]([0-9OoilIszZ]{4})\b"
    m_tm = re.search(text_month_pattern, clean)
    if m_tm:
        day_raw, month_raw, year_raw = m_tm.groups()
        month_key = month_raw.lower()
        if month_key in MONTH_MAP:
            month_val = MONTH_MAP[month_key]
            day_str, d_rep = fix_digit_confusions(day_raw)
            year_str, y_rep = fix_digit_confusions(year_raw)
            try:
                d_int = int(day_str)
                y_int = int(year_str)
                valid_date = datetime.date(y_int, month_val, d_int)
                return f"{valid_date.day:02d}-{valid_date.month:02d}-{valid_date.year:04d}", (d_rep or y_rep)
            except (ValueError, OverflowError):
                return None, False

    # Check numeric date patterns: separators [-/.]
    num_pattern = r"\b([0-9OoilIszZ]{1,2})[\s\-/.]([0-9OoilIszZ]{1,2})[\s\-/.]([0-9OoilIszZ]{4})\b"
    m_num = re.search(num_pattern, clean)
    if m_num:
        day_raw, month_raw, year_raw = m_num.groups()
        day_str, d_rep = fix_digit_confusions(day_raw)
        month_str, m_rep = fix_digit_confusions(month_raw)
        year_str, y_rep = fix_digit_confusions(year_raw)
        try:
            d_int = int(day_str)
            m_int = int(month_str)
            y_int = int(year_str)
            valid_date = datetime.date(y_int, m_int, d_int)
            was_repaired = d_rep or m_rep or y_rep
            return f"{valid_date.day:02d}-{valid_date.month:02d}-{valid_date.year:04d}", was_repaired
        except (ValueError, OverflowError):
            return None, False

    return None, False


def parse_date(s: Optional[str]) -> Optional[str]:
    """Parse a date string into 'DD-MM-YYYY' format or None."""
    val, _ = parse_date_with_meta(s)
    return val


def parse_area_acre_with_meta(s: Optional[str]) -> Tuple[Optional[float], bool]:
    """Parse land area in acres from string and return (area_float, was_repaired)."""
    if not s or not isinstance(s, str):
        return None, False

    clean = s.strip()
    if not clean:
        return None, False

    # Extract number with decimal point or comma
    # Look for patterns like "3.8", "3,8", "12.0", "3.S"
    match = re.search(r"(\d+[\.,][0-9OoilIszZSB]+|\b\d+\b)", clean)
    if not match:
        match = re.search(r"([0-9OoilIszZSB]+[\.,][0-9OoilIszZSB]+)", clean)

    if not match:
        return None, False

    raw_val = match.group(1).replace(",", ".")
    fixed_val, was_repaired = fix_digit_confusions(raw_val)

    try:
        val = float(fixed_val)
        if 0.1 <= val <= 1000.0:
            return round(val, 2), was_repaired
    except ValueError:
        pass

    return None, False


def parse_area_acre(s: Optional[str]) -> Optional[float]:
    """Parse land area in acres from string into float or None."""
    val, _ = parse_area_acre_with_meta(s)
    return val


def parse_registration_number_with_meta(s: Optional[str], pattern: str) -> Tuple[Optional[str], bool]:
    """Parse registration number and validate against pattern.

    Fixes common OCR confusions ONLY inside the numeric parts (O->0, I/l->1, S->5).
    Fuzzily matches the 'SAMPLE/XX/' prefix.
    """
    if not s or not isinstance(s, str):
        return None, False

    clean = s.strip()
    if not clean:
        return None, False

    # Extract target prefix from pattern (e.g. LD, TR, FIRE)
    target_code = ""
    for code in ["LD", "TR", "FIRE"]:
        if code in pattern.upper():
            target_code = code
            break

    # Search for SAMPLE/.../.../... structure with tolerance for spaces, slashes, minor OCR typos
    # Pattern: (SAMPLE) / (CODE) / (4 digits/confusions) / (4 digits/confusions)
    reg_regex = re.compile(
        r"(?i)\b(?:sample|sampie|sampl|smple|smp)[\s/\\_-]+"
        r"(ld|tr|fire|id|to)[\s/\\_-]+"
        r"([0-9a-zA-Z]{4})[\s/\\_-]+"
        r"([0-9a-zA-Z]{4})\b"
    )

    m = reg_regex.search(clean)
    was_repaired = False
    candidate = None

    if m:
        raw_code = m.group(1).upper()
        raw_num1 = m.group(2)
        raw_num2 = m.group(3)

        # Check if code matched fuzzily
        resolved_code = target_code if target_code else raw_code
        if resolved_code != raw_code:
            was_repaired = True

        fixed_num1, rep1 = fix_digit_confusions(raw_num1)
        fixed_num2, rep2 = fix_digit_confusions(raw_num2)
        if rep1 or rep2:
            was_repaired = True

        candidate = f"SAMPLE/{resolved_code}/{fixed_num1}/{fixed_num2}"
    else:
        # Fallback: look for two 4-character digit-like blocks near target code
        blocks = re.findall(r"\b[0-9a-zA-Z]{4}\b", clean)
        if len(blocks) >= 2 and target_code:
            fixed_num1, rep1 = fix_digit_confusions(blocks[-2])
            fixed_num2, rep2 = fix_digit_confusions(blocks[-1])
            if fixed_num1.isdigit() and fixed_num2.isdigit():
                candidate = f"SAMPLE/{target_code}/{fixed_num1}/{fixed_num2}"
                was_repaired = True

    if candidate and re.match(pattern, candidate):
        return candidate, was_repaired

    # Direct match check on raw text if candidate didn't match
    direct_match = re.search(r"SAMPLE/[A-Z]+/\d{4}/\d{4}", clean)
    if direct_match and re.match(pattern, direct_match.group(0)):
        return direct_match.group(0), False

    return None, False


def parse_registration_number(s: Optional[str], pattern: str) -> Optional[str]:
    """Parse registration number matching pattern, fixing OCR confusions in numeric tail."""
    val, _ = parse_registration_number_with_meta(s, pattern)
    return val


def parse_labeled_value(
    lines: List[Union[str, dict]],
    label_regexes: Union[str, List[str]],
) -> Tuple[Optional[str], int]:
    """Extract value following a label in a list of lines.

    Args:
        lines: List of line strings or line dicts with 'text'.
        label_regexes: Single regex pattern or list of regex patterns for label.

    Returns:
        (extracted_value_string or None, line_index where value was found or -1)
    """
    if not lines:
        return None, -1

    if isinstance(label_regexes, str):
        regex_list = [label_regexes]
    else:
        regex_list = label_regexes

    raw_lines: List[str] = []
    for l in lines:
        if isinstance(l, dict):
            raw_lines.append(l.get("text", ""))
        else:
            raw_lines.append(str(l))

    for regex_str in regex_list:
        compiled = re.compile(regex_str, re.IGNORECASE)
        for i, line_text in enumerate(raw_lines):
            m = compiled.search(line_text)
            if m:
                # Value is remainder of line after label match
                tail = line_text[m.end():].strip()
                # Remove leading colon or dash or equals if present
                tail = re.sub(r"^[:\-=]\s*", "", tail).strip()
                if tail:
                    return tail, i
                # Value might be on next line if current line only had the label
                if i + 1 < len(raw_lines):
                    next_line = raw_lines[i + 1].strip()
                    # Only take next line if it doesn't look like another label
                    if next_line and not re.search(r":\s*$", next_line):
                        return next_line, i + 1

    return None, -1
