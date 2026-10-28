"""OCR engine wrapper around pytesseract with multi-level output (text, lines, words)."""

import os
import shutil
from typing import Any, Dict, List, Optional
import numpy as np
import pytesseract


class OcrResult:
    """Container for OCR output containing text, line-level and word-level information."""

    def __init__(self, text: str, lines: List[Dict[str, Any]], words: List[Dict[str, Any]]):
        self.text = text
        self.lines = lines
        self.words = words

    def __getitem__(self, key: str) -> Any:
        if hasattr(self, key):
            return getattr(self, key)
        raise KeyError(key)

    def __repr__(self) -> str:
        return f"<OcrResult lines={len(self.lines)} words={len(self.words)} text_len={len(self.text)}>"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "lines": self.lines,
            "words": self.words,
        }


def _resolve_tesseract_cmd() -> str:
    """Find the tesseract executable path or raise RuntimeError."""
    cmd = os.environ.get("TESSERACT_CMD")
    if cmd and os.path.exists(cmd):
        return cmd

    which = shutil.which("tesseract")
    if which:
        return which

    candidate_paths = [
        r"C:\Users\pawan\scoop\apps\tesseract\current\tesseract.exe",
        r"C:\Users\pawan\scoop\shims\tesseract.exe",
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]
    for p in candidate_paths:
        if os.path.exists(p):
            return p

    raise RuntimeError("Tesseract not found; install it and/or set TESSERACT_CMD")


def _run_psm(img: np.ndarray, psm: int) -> OcrResult:
    """Execute tesseract on an image with a specific page segmentation mode."""
    tess_cmd = _resolve_tesseract_cmd()
    pytesseract.pytesseract.tesseract_cmd = tess_cmd

    config = f"--psm {psm}"
    try:
        data = pytesseract.image_to_data(
            img,
            output_type=pytesseract.Output.DICT,
            config=config,
            lang="eng",
        )
    except Exception as e:
        # Check if tesseract binary error
        if "not installed" in str(e).lower() or "not found" in str(e).lower():
            raise RuntimeError("Tesseract not found; install it and/or set TESSERACT_CMD") from e
        raise

    n_boxes = len(data["text"])
    words: List[Dict[str, Any]] = []
    line_groups: Dict[tuple, List[Dict[str, Any]]] = {}

    for i in range(n_boxes):
        raw_text = data["text"][i]
        clean_text = raw_text.strip()
        conf_val = float(data["conf"][i])

        if conf_val < 0 or not clean_text:
            continue

        x = int(data["left"][i])
        y = int(data["top"][i])
        w = int(data["width"][i])
        h = int(data["height"][i])
        norm_conf = max(0.0, min(1.0, conf_val / 100.0))

        word_info = {
            "text": clean_text,
            "bbox": [x, y, x + w, y + h],
            "conf": norm_conf,
            "block_num": data["block_num"][i],
            "par_num": data["par_num"][i],
            "line_num": data["line_num"][i],
            "word_num": data["word_num"][i],
        }
        words.append(word_info)

        line_key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        if line_key not in line_groups:
            line_groups[line_key] = []
        line_groups[line_key].append(word_info)

    lines: List[Dict[str, Any]] = []
    for line_key, l_words in line_groups.items():
        if not l_words:
            continue
        line_text = " ".join(w["text"] for w in l_words)
        x1 = min(w["bbox"][0] for w in l_words)
        y1 = min(w["bbox"][1] for w in l_words)
        x2 = max(w["bbox"][2] for w in l_words)
        y2 = max(w["bbox"][3] for w in l_words)
        mean_conf = sum(w["conf"] for w in l_words) / len(l_words)

        lines.append({
            "text": line_text,
            "bbox": [x1, y1, x2, y2],
            "conf": mean_conf,
            "words": l_words,
        })

    full_text = "\n".join(line["text"] for line in lines)
    return OcrResult(text=full_text, lines=lines, words=words)


def run_ocr(img: np.ndarray) -> OcrResult:
    """Run OCR on image using PSM 6 first, falling back to PSM 4 if no text recognized."""
    if img is None or img.size == 0:
        return OcrResult(text="", lines=[], words=[])

    result = _run_psm(img, psm=6)
    if not result.text.strip():
        result = _run_psm(img, psm=4)

    return result
