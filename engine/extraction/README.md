# Document Extraction Engine (`engine.extraction`)

Document processing module for AICTE application validation: classification, image pre-processing, OCR, field extraction, table extraction, and confidence scoring.

## Overview

Given an application folder (`dataset/applications/app_0N/` containing `land_deed.pdf`, `trust_cert.pdf`, `faculty_list.pdf`, `fire_noc.pdf`) or any single image/PDF, the engine returns structured fields conforming strictly to the project extraction contract:

```json
{
  "doc_type": "land_deed",
  "fields": {
    "owner_name": "...",
    "plot_number": "...",
    "land_area_acre": 3.8,
    "city": "...",
    "registration_date": "...",
    "registration_number": "...",
    "_low_confidence": []
  },
  "confidence": 0.95
}
```

## Module Structure

- `loader.py`: `load_pages(path, dpi=200)` loads PDFs (rasterized via PyMuPDF) and images (via OpenCV) into BGR numpy arrays.
- `preprocess.py`: `to_gray`, `denoise` (median filter), `contrast_clahe` (CLAHE), `estimate_skew_angle` (minAreaRect on foreground text pixels), `deskew` (only corrects when $|angle| \le 10^\circ$).
- `ocr.py`: `run_ocr(img) -> OcrResult` wrapping `pytesseract.image_to_data` (`--psm 6` with `--psm 4` fallback). Discovers Tesseract binary via `TESSERACT_CMD` environment variable or standard paths.
- `classify.py`: `classify_document(text) -> (doc_type, score)` using keyword sets and difflib fuzzy matching.
- `parsers.py`: Pure functions: `parse_date`, `parse_area_acre`, `parse_registration_number` (fuzzy prefix and digit repair), `parse_labeled_value`.
- `fields.py`: One field extractor per doc type keyed on ReportLab printed labels.
- `table.py`: `extract_faculty_table` groups OCR words into table rows by vertical midpoint clustering, parses row columns, and reads printed `Total faculty: N`.
- `confidence.py`: Per-field confidence from OCR word confidences ($* 0.7$ if repaired), document confidence as mean of required fields, and `_low_confidence` list.
- `api.py`: Public entry points `extract_document` and `extract_bundle`.
- `evaluate.py`: Evaluation CLI comparing extracted fields against synthetic ground truth.

## Usage

```python
from engine.extraction import extract_document, extract_bundle

# Extract single document
result = extract_document("dataset/applications/app_01/land_deed.pdf")
print(result.doc_type, result.confidence)
print(result.fields)

# Extract application bundle
bundle = extract_bundle("dataset/applications/app_01")
for doc in bundle["extraction"]:
    print(doc["doc_type"], doc["confidence"])
```

## Running Evaluation

```bash
python -m engine.extraction.evaluate
```

Optional `--limit N` to test a subset of files:
```bash
python -m engine.extraction.evaluate --limit 5
```

## Known Limitations

1. **OCR Sensitivity to Severe Distortion**: Deskewing corrects angular tilt up to $10^\circ$. Warped or non-linear page curling requires 3D unwarping.
2. **Table Header Variations**: Table column extraction is optimized for standard AICTE faculty rosters (`S.No`, `Faculty Member Name`, `Qualification`, `Designation`, `Department`, `Exp (Yrs)`). Heavily modified column arrangements fall back to positional token parsing.
3. **Low-Resolution Scans**: At resolutions below 100 DPI, small font sizes ($\le 7.5\text{ pt}$) may drop punctuation or single-digit numbers. PDF rasterization at 200 DPI is recommended.
