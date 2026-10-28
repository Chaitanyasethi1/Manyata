"""Font and noise consistency analysis for text-level forgery indicators."""

from typing import Any, Dict, List, Optional, Tuple
import cv2
import numpy as np

from .config import FONT_Z_THRESH, NOISE_Z_THRESH


def extract_word_boxes(
    gray: np.ndarray,
    skip_regions: Optional[List[List[int]]] = None,
) -> List[Dict[str, Any]]:
    """Extract word-like bounding boxes from document grayscale image."""
    if len(gray.shape) == 3:
        gray = cv2.cvtColor(gray, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape[:2]
    # Otsu inverse binarization: ink=255, paper=0
    _, bin_inv = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Horizontal closing to bridge characters into words
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 3))
    closed = cv2.morphologyEx(bin_inv, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(closed, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    word_boxes = []

    for cnt in contours:
        x, y, bw, bh = cv2.boundingRect(cnt)
        # Plausible word dimensions
        if bw < 25 or bw > 450 or bh < 10 or bh > 55:
            continue

        box = [x, y, x + bw, y + bh]

        # Exclude header, footer, signature on full page
        if h > 1000 and (y < 220 or y > h - 140 or (y >= 950 and x >= int(w * 0.55))):
            continue

        # Check skip regions (seal, QR, etc.)
        if skip_regions:
            skip = False
            for s_box in skip_regions:
                if not (x + bw < s_box[0] or x > s_box[2] or y + bh < s_box[1] or y > s_box[3]):
                    skip = True
                    break
            if skip:
                continue

        # Extract word patch
        patch_inv = bin_inv[y : y + bh, x : x + bw]
        ink_pixels = int(np.count_nonzero(patch_inv > 0))
        area = bw * bh
        if area == 0 or ink_pixels < 20:
            continue

        # 1. Ink density
        density = ink_pixels / float(area)

        # 2. Stroke width via distance transform
        dist = cv2.distanceTransform(patch_inv, cv2.DIST_L2, 3)
        fg_dist = dist[patch_inv > 0]
        stroke_width = float(np.median(fg_dist) * 2.0) if len(fg_dist) > 0 else 1.0

        # 3. Slant via letter connected components
        num_cc, cc_labels, cc_stats, _ = cv2.connectedComponentsWithStats(patch_inv)
        letter_slants = []
        for l in range(1, num_cc):
            ch = cc_stats[l, cv2.CC_STAT_HEIGHT]
            carea = cc_stats[l, cv2.CC_STAT_AREA]
            if ch >= 8 and carea >= 8:
                m = cv2.moments((cc_labels == l).astype(np.uint8))
                s = float(m["mu11"] / (m["mu02"] + 1e-4))
                letter_slants.append(s)
        slant = float(np.median(letter_slants)) if letter_slants else 0.0

        word_boxes.append({
            "bbox": box,
            "height": bh,
            "width": bw,
            "density": density,
            "stroke_width": stroke_width,
            "slant": slant,
        })

    return word_boxes


def analyze_font_consistency(
    image: np.ndarray,
    skip_regions: Optional[List[List[int]]] = None,
    z_thresh: float = FONT_Z_THRESH,
) -> List[Dict[str, Any]]:
    """Detect words with inconsistent font features (stroke width, density, slant)."""
    if image is None or image.size == 0:
        return []
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    h, w = gray.shape[:2]
    # Default skip for QR code on canonical A4 docs if not in skip_regions
    effective_skips = list(skip_regions) if skip_regions else []
    if h > 1000:
        effective_skips.append([int(w * 0.70), int(h * 0.12), w, int(h * 0.32)])

    words = extract_word_boxes(gray, skip_regions=effective_skips)
    if len(words) < 12:
        return []

    # Group words by similar height (+-20%)
    words.sort(key=lambda w: w["height"])
    groups = []
    current_group = [words[0]]

    for w_box in words[1:]:
        base_h = current_group[0]["height"]
        if abs(w_box["height"] - base_h) / max(1.0, float(base_h)) <= 0.20:
            current_group.append(w_box)
        else:
            groups.append(current_group)
            current_group = [w_box]
    if current_group:
        groups.append(current_group)

    inconsistent_boxes = []

    for grp in groups:
        if len(grp) < 4:
            continue

        for feat_name, min_denom in [("stroke_width", 1.0), ("density", 0.15), ("slant", 0.035)]:
            vals = np.array([w_item[feat_name] for w_item in grp], dtype=np.float32)
            med = np.median(vals)
            mad = np.median(np.abs(vals - med)) * 1.4826
            std = np.std(vals)
            denom = max(mad, max(std * 0.35, min_denom))

            zs = np.abs(vals - med) / denom
            for idx, z in enumerate(zs):
                if z > z_thresh:
                    inconsistent_boxes.append(grp[idx]["bbox"])

    if not inconsistent_boxes:
        return []

    # Merge adjacent inconsistent boxes on same text line
    merged = []
    inconsistent_boxes.sort(key=lambda b: (b[1], b[0]))
    for b in inconsistent_boxes:
        if not merged:
            merged.append(b)
        else:
            prev = merged[-1]
            y_overlap = min(prev[3], b[3]) - max(prev[1], b[1])
            x_gap = b[0] - prev[2]
            if y_overlap > 0.5 * (b[3] - b[1]) and -10 <= x_gap <= 40:
                merged[-1] = [min(prev[0], b[0]), min(prev[1], b[1]), max(prev[2], b[2]), max(prev[3], b[3])]
            else:
                merged.append(b)

    findings = []
    for m_box in merged:
        findings.append({
            "id": "F-FONT-01",
            "code": "font_inconsistent",
            "severity": "medium",
            "message": f"Font feature anomaly detected near text at ({m_box[0]}, {m_box[1]}) (inconsistent typeface/weight)",
            "bbox_native": m_box,
            "kind": "font_inconsistent",
            "score": 3.8,
        })

    return findings


def analyze_noise_consistency(
    image: np.ndarray,
    skip_regions: Optional[List[List[int]]] = None,
    z_thresh: float = NOISE_Z_THRESH,
) -> List[Dict[str, Any]]:
    """Detect localized background noise anomalies or altered background color patches."""
    if image is None or image.size == 0:
        return []
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    h, w = gray.shape[:2]
    bh, bw = 32, 32
    nh, nw = h // bh, w // bw

    # Residual via median blur
    med_blur = cv2.medianBlur(gray, 5).astype(np.float32)
    res = np.abs(gray.astype(np.float32) - med_blur)

    effective_skips = list(skip_regions) if skip_regions else []
    if h > 1000:
        # Skip QR code region and header/footer margins
        effective_skips.append([int(w * 0.70), int(h * 0.12), w, int(h * 0.32)])
        effective_skips.append([0, 0, w, 220])
        effective_skips.append([0, h - 140, w, h])
        effective_skips.append([int(w * 0.55), 950, w, h])

    # Calculate background std and mean background color per block
    block_std = np.zeros((nh, nw), dtype=np.float32)
    block_bg_mean = np.zeros((nh, nw), dtype=np.float32)
    valid_mask = np.zeros((nh, nw), dtype=bool)

    for r in range(nh):
        for c in range(nw):
            y1, y2 = r * bh, (r + 1) * bh
            x1, x2 = c * bw, (c + 1) * bw

            # Check skip regions
            skip = False
            for s in effective_skips:
                if not (x2 < s[0] or x1 > s[2] or y2 < s[1] or y1 > s[3]):
                    skip = True
                    break
            if skip:
                continue

            blk_gray = gray[y1:y2, x1:x2]
            bg_pixels = blk_gray > 215
            if np.count_nonzero(bg_pixels) >= 180:
                blk_res = res[y1:y2, x1:x2][bg_pixels]
                block_std[r, c] = float(np.std(blk_res))
                block_bg_mean[r, c] = float(np.mean(blk_gray[bg_pixels]))
                valid_mask[r, c] = True

    if np.count_nonzero(valid_mask) < 20:
        return []

    # Robust z-scores for background color difference
    bg_means = block_bg_mean[valid_mask]
    med_bg = np.median(bg_means)
    mad_bg = np.median(np.abs(bg_means - med_bg)) * 1.4826
    denom_bg = max(mad_bg, 1.2)
    z_bg = np.zeros_like(block_bg_mean)
    z_bg[valid_mask] = np.abs(block_bg_mean[valid_mask] - med_bg) / denom_bg

    # Background color anomaly (paint patch delta != 0)
    anom = ((z_bg > z_thresh) & valid_mask).astype(np.uint8)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(anom, connectivity=8)

    findings = []
    for l in range(1, num_labels):
        area = stats[l, cv2.CC_STAT_AREA]
        if area >= 2:
            bx = stats[l, cv2.CC_STAT_LEFT] * bw - 4
            by = stats[l, cv2.CC_STAT_TOP] * bh - 4
            bw_comp = stats[l, cv2.CC_STAT_WIDTH] * bw + 8
            bh_comp = stats[l, cv2.CC_STAT_HEIGHT] * bh + 8
            comp_box = [max(0, bx), max(0, by), min(w, bx + bw_comp), min(h, by + bh_comp)]
            findings.append({
                "id": "F-NOISE-01",
                "code": "noise_inconsistent",
                "severity": "medium",
                "message": (
                    f"Background color / noise anomaly around text at ({comp_box[0]}, {comp_box[1]}); "
                    "background tone differs from the rest of the page"
                ),
                "bbox_native": comp_box,
                "kind": "noise_inconsistent",
                "score": 3.6,
            })

    return findings
