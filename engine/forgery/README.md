# AICTE SIH26261 - Forgery Detection Engine Module

## Overview
The **Forgery Detection Module** (`engine.forgery`) provides computer-vision forensics to detect image-level document manipulations, alterations, and fraud in AICTE approval documents without relying on OCR, deep CNNs, or external network services.

The primary entry point adheres to the contract:
```python
forgery.run_forgery(
    application_dir: str,
    form_data: dict,
    bundle: Optional[dict] = None,
    storage_dir: str = "storage",
) -> dict
```

Returning a single module result:
```json
{
  "module": "forgery",
  "sub_score": 100.0,
  "flags": [
    {
      "id": "F-ELA-01",
      "severity": "critical",
      "message": "Possible text edit near the land_area_acre field (ELA anomaly)",
      "document": "land_deed.pdf",
      "evidence": {
        "page": 1,
        "bbox": [663, 759, 715, 789],
        "heatmap_path": "heatmaps/app_02_land_deed_forgery.png"
      },
      "clause": null
    }
  ]
}
```

---

## Algorithms & Methods

### 1. Error Level Analysis (ELA) - `ela.py`
- **Recompression Error**: Analyzes JPEG compression error residuals by re-compressing the decoded image at candidate quality levels (`[70, 75, 80, 85, 90, 95]`, prioritizing the image's estimated quantization table quality factor).
- **Edge-Density Normalization**: Because compression residuals correlate with edge density, 32x32 pixel blocks are partitioned into local edge-density bins. A robust z-score (median and MAD) is computed within each bin.
- **Connected Components**: Blocks exceeding `ELA_Z_THRESH = 2.8` forming connected regions of at least `ELA_MIN_BLOCKS = 4` are identified as candidate anomalies.
- **Word-Level Text Stroke ELA**: Specifically pinpoints subtle in-memory number/letter alterations by computing recompression error directly on isolated text character strokes.

### 2. Institutional Seal Detection & Cross-Document Reuse - `seal.py`
- **Detection**: Locates circular institutional stamps using Hough Circles and circular contour analysis on an edge map, constrained by institutional seal radius ratios (4% to 14% of page width).
- **Normalization**: Crops are scaled to 128x128 pixels, contrast-stretched, and masked with a circular window.
- **Intra-Bundle Cross-Document Reuse**: Compares detected seals across documents in `SLOT_ORDER` (`land_deed`, `trust_cert`, `faculty_list`, `fire_noc`).
  - **Inner-Text Translation NCC**: Computes normalized cross-correlation over fine translations ($\pm 4$ pixels) on the inner seal area (where unique text/numbers appear).
  - **SIFT/ORB Keypoint Matching**: Evaluates keypoint matches under deterministic RANSAC homography.
  - **Reuse Detection**: Flags `seal_reuse` (critical severity) if $\text{NCC} \ge 0.94$ or inliers $\ge 40$. The flag is attached to the later document in slot order, referencing both documents.
- **Seal Missing**: If a document required to have a seal (`DOCS_WITH_SEAL`) lacks one, emits `seal_not_found` with low severity.

### 3. Copy-Move / Clone Detection - `copymove.py`
- **Keypoint Descriptors**: Extracts SIFT/ORB descriptors across the grayscale page.
- **Self-Descriptor Matching**: Matches descriptors against themselves using $k=2$ KNN matching with ratio test (0.75), dropping self-matches and spatial pairs separated by less than `COPYMOVE_MIN_DISPLACEMENT_PX = 50`.
- **Spatial Clustering & RANSAC**: Clusters matches by displacement vector and fits an affine transformation matrix.
- **Patch NCC Verification**: Computes patch-level cross-correlation ($\ge 0.60$) between source and destination patches to eliminate false positives from repeated font characters or grid lines.
- Tables in `COPYMOVE_SKIP_DOCS` (`faculty_list`) are excluded to avoid repeating row false alarms.

### 4. Font & Noise Consistency - `textfeatures.py`
- **Word Box Extraction**: Otsu binarization with horizontal morphological closing merges character glyphs into word boxes, ignoring page headers ($y < 260$), footers, seals, and QR code regions.
- **Font Feature Grouping**: Measures stroke width (via distance transform on the foreground skeleton), ink density, and letter-level slant (via second-order central moments $\mu_{11}/\mu_{02}$ on character components).
- **Robust Outliers**: Groups words by similar height ($\pm 20\%$) and calculates robust z-scores with calibrated feature standard deviation floors (`min_denom`). Words with $z > \text{FONT\_Z\_THRESH} = 4.0$ are flagged as `font_inconsistent` (medium severity).
- **Background Noise Consistency**: Calculates high-pass median residual standard deviation and background color mean across 32x32 blocks on paper-white pixels ($> 215$). Connected outlier blocks with $z > \text{NOISE\_Z\_THRESH} = 4.0$ detect altered paint patches and tone anomalies (`noise_inconsistent`, medium severity).

### 5. Forensic Heatmap Overlays - `overlay.py`
- Written to `<storage_dir>/heatmaps/<application_name>_<doc_type>_forgery.png` only for documents containing at least one flag.
- Full-page composite image preserving page aspect ratio (scaled to max width 1240px).
- Translucent jet-colormap blending of the continuous ELA residual layer overlaid with red bounding boxes and white-on-red text labels for every finding.

---

## Coordinate Convention
- **Internal**: All algorithms operate strictly in the **NATIVE pixels** of the extracted image (A4 at 150 DPI = approx. $1240 \times 1754$).
- **Output Contract (`evidence.bbox`)**: Coordinates are converted to **Page-1 pixels at 200 DPI**:
  $$\text{scale} = \frac{\text{page\_width\_pt} \times \frac{200}{72}}{\text{native\_width}}$$
  For standalone image inputs (JPG/PNG), `scale = 1.0`.
- Coordinates are clamped within page bounds ($0 \le x_1 < x_2 \le 1654$ and $0 \le y_1 < y_2 \le 2339$).

---

## Severity Map & Sub-Score Calculation

| Finding Code | Severity | Description |
| :--- | :--- | :--- |
| `seal_reuse` | **critical** | Exact or near-exact pixel copy of institutional seal between documents |
| `ela_region` | **critical** | JPEG compression error level mismatch indicating altered text or image patch |
| `copy_move` | **critical** | Cloned / duplicated patch within the same document |
| `font_inconsistent` | **medium** | Inconsistent stroke width, slant, or density within word height group |
| `noise_inconsistent` | **medium** | Background tone or high-pass noise anomaly indicating paste/paint over text |
| `seal_not_found` | **low** | No institutional seal detected on deed/cert/NOC (manual verification advised) |

- **Sub-score**: Calculated via `engine.common.subscore.compute_sub_score(flags)`. Base score 100 minus severity deductions (`critical`: 40, `high`: 20, `medium`: 10, `low`: 5), clamped between 0 and 100.
- **Degraded Reliability**: When an image has low JPEG quality factor ($< 80$), lacks an embedded JPEG stream, or exhibits high background noise MAD, the document is assessed as `"degraded"`. In degraded mode, weak signals (ELA, font, noise) are downgraded to severity `"low"` and appended with `"(low reliability scan, verify manually)"`. Seal-reuse and copy-move with strong keypoint inliers retain their critical status.

---

## Calibration Notes
- Calibrated on synthetic dataset seed 42 via `python -m engine.forgery.calibrate`.
- Thresholds are tuned to guarantee **zero false positives** on genuine canonical institutional documents while retaining high sensitivity to value alterations, text edits, and seal cloning.
- Threshold values:
  - `ELA_Z_THRESH = 2.8`, `ELA_BLOCK = 32`, `ELA_MIN_BLOCKS = 4`
  - `SEAL_NCC_REUSE = 0.94`, `SEAL_ORB_MIN_INLIERS = 40`
  - `COPYMOVE_MIN_INLIERS = 8`, `COPYMOVE_MIN_DISPLACEMENT_PX = 50`
  - `FONT_Z_THRESH = 4.0`, `NOISE_Z_THRESH = 4.0`

---

## Limitations
1. **Synthetic Optimization**: Thresholds are calibrated on synthetic digital rendering artifacts; real-world multi-generation analog photocopies and scanner sensor variations may require wider noise tolerance.
2. **Clean Digital Rerenders**: Date discrepancies, expired validity dates, or metadata alterations that are cleanly rerendered without raster manipulation produce clean image pixels and are intentionally delegated to `engine.authenticity` and `engine.compliance`.
