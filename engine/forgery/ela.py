"""Error Level Analysis (ELA) for image compression inconsistencies and raster edits."""

from typing import Any, Dict, List, Optional, Tuple
import cv2
import numpy as np

from .config import (
    ELA_BLOCK,
    ELA_MAX_REGIONS_PER_DOC,
    ELA_MIN_BLOCKS,
    ELA_QUALITY_CANDIDATES,
    ELA_Z_THRESH,
)


def analyze_ela(
    bgr: np.ndarray,
    est_quality: Optional[int] = None,
    skip_regions: Optional[List[List[int]]] = None,
    candidate_qualities: Optional[List[int]] = None,
    z_thresh: float = ELA_Z_THRESH,
    min_blocks: int = ELA_MIN_BLOCKS,
) -> Tuple[List[Dict[str, Any]], np.ndarray]:
    """Perform Error Level Analysis (ELA) to locate anomalous recompression regions.

    Args:
        bgr: Native document image.
        est_quality: Estimated JPEG quality factor (if known).
        skip_regions: List of bboxes to ignore (detected seals, QR, header, footer).
        candidate_qualities: Quality factors to evaluate.
        z_thresh: Robust z-score anomaly threshold.
        min_blocks: Minimum connected component area in blocks.

    Returns:
        (findings_list, best_ela_map_2d)
    """
    if bgr is None or bgr.size == 0:
        return [], np.zeros((10, 10), dtype=np.float32)

    h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150) / 255.0

    if candidate_qualities is None:
        if est_quality:
            candidate_qualities = [est_quality]
        else:
            candidate_qualities = list(ELA_QUALITY_CANDIDATES)

    bh = bw = ELA_BLOCK
    nh, nw = h // bh, w // bw

    edge_blocks = np.zeros((nh, nw), dtype=np.float32)
    for r in range(nh):
        for c in range(nw):
            edge_blocks[r, c] = np.mean(edges[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

    # Build mask of valid blocks (exclude headers, footers, QR, seals, and signatures on A4 pages)
    valid_mask = np.ones((nh, nw), dtype=bool)
    if h > 1000:
        for r in range(nh):
            for c in range(nw):
                y, x = r * bh, c * bw
                if y < 260:
                    valid_mask[r, c] = False  # Header banner
                elif y >= h - 140:
                    valid_mask[r, c] = False  # Sample footer
                elif 50 <= y <= 450 and x >= int(w * 0.65):
                    valid_mask[r, c] = False  # QR code
                elif y >= int(h * 0.65) and x <= int(w * 0.40):
                    valid_mask[r, c] = False  # Official seal
                elif y >= 950 and x >= int(w * 0.55):
                    valid_mask[r, c] = False  # Official signature & bottom notes

    if skip_regions:
        for s in skip_regions:
            sr1, sr2 = max(0, s[1] // bh), min(nh, (s[3] + bh - 1) // bh)
            sc1, sc2 = max(0, s[0] // bw), min(nw, (s[2] + bw - 1) // bw)
            valid_mask[sr1:sr2, sc1:sc2] = False

    all_regions = []
    best_ela_map = np.zeros((nh, nw), dtype=np.float32)
    best_diff_smooth = np.zeros((h, w), dtype=np.float32)
    best_contrast = -1.0

    edge_bins = [0.0, 0.01, 0.03, 0.07, 0.14, 1.0]

    for q in candidate_qualities:
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), q]
        _, enc = cv2.imencode(".jpg", bgr, encode_param)
        rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
        diff = np.max(np.abs(bgr.astype(np.float32) - rec.astype(np.float32)), axis=2)
        diff_smooth = cv2.GaussianBlur(diff, (3, 3), 0)

        diff_blocks = np.zeros((nh, nw), dtype=np.float32)
        for r in range(nh):
            for c in range(nw):
                diff_blocks[r, c] = np.mean(diff_smooth[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

        z_map = np.zeros((nh, nw), dtype=np.float32)
        for i in range(len(edge_bins) - 1):
            mask = valid_mask & (edge_blocks >= edge_bins[i]) & (edge_blocks < edge_bins[i + 1])
            vals = diff_blocks[mask]
            if len(vals) < 5:
                continue
            med = np.median(vals)
            mad = np.median(np.abs(vals - med)) * 1.4826
            denom = max(mad, 0.25 * med, 0.08)
            z_map[mask] = (vals - med) / denom

        contrast = float(np.std(z_map[valid_mask])) if np.any(valid_mask) else 0.0
        if contrast > best_contrast:
            best_contrast = contrast
            best_ela_map = z_map
            best_diff_smooth = diff_smooth

    # 1. Component analysis on anomalous blocks from the best contrast ELA map
    anom = (valid_mask & (best_ela_map > z_thresh)).astype(np.uint8)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(anom, connectivity=8)
    for l in range(1, num_labels):
        area = stats[l, cv2.CC_STAT_AREA]
        if area >= min_blocks:
            bx = max(0, stats[l, cv2.CC_STAT_LEFT] * bw - 4)
            by = max(0, stats[l, cv2.CC_STAT_TOP] * bh - 4)
            bw_comp = min(w - bx, stats[l, cv2.CC_STAT_WIDTH] * bw + 8)
            bh_comp = min(h - by, stats[l, cv2.CC_STAT_HEIGHT] * bh + 8)
            comp_score = float(np.mean(best_ela_map[labels == l]))
            all_regions.append({
                "id": "F-ELA-01",
                "code": "ela_region",
                "severity": "critical",
                "message": f"Error Level Analysis anomaly detected near ({bx}, {by}) (compression level mismatch)",
                "bbox_native": [bx, by, bx + bw_comp, by + bh_comp],
                "score": comp_score,
                "kind": "ela_region",
            })

    # 2. Text-stroke / word level ELA anomaly check
    # Detects subtle raster value changes where text was altered on a uniform background
    if h >= 400:
        _, enc_w = cv2.imencode(".jpg", bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
        rec_w = cv2.imdecode(enc_w, cv2.IMREAD_COLOR)
        diff_w = cv2.GaussianBlur(np.max(np.abs(bgr.astype(np.float32) - rec_w.astype(np.float32)), axis=2), (3, 3), 0)

        _, bin_inv = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        k = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 3))
        closed = cv2.morphologyEx(bin_inv, cv2.MORPH_CLOSE, k)
        cnts, _ = cv2.findContours(closed, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        word_diffs = []
        word_boxes = []
        for cnt in cnts:
            x_b, y_b, w_b, h_b = cv2.boundingRect(cnt)
            if w_b < 20 or w_b > 350 or h_b < 10 or h_b > 45:
                continue
            # Exclude header, footer, seal, QR, signature
            if (
                (h > 1000 and (y_b < 220 or y_b > h - 140))
                or (h > 1000 and x_b > w * 0.65 and y_b < 450)
                or (h > 1000 and x_b < w * 0.40 and y_b > h * 0.65)
                or (h > 1000 and x_b >= w * 0.55 and y_b >= 950)
            ):
                continue
            patch_ink = diff_w[y_b : y_b + h_b, x_b : x_b + w_b][bin_inv[y_b : y_b + h_b, x_b : x_b + w_b] > 0]
            if len(patch_ink) < 20:
                continue
            word_diffs.append(float(np.mean(patch_ink)))
            word_boxes.append([x_b, y_b, x_b + w_b, y_b + h_b])

        if len(word_diffs) >= 8:
            w_arr = np.array(word_diffs)
            w_med = np.median(w_arr)
            w_mad = np.median(np.abs(w_arr - w_med)) * 1.4826
            w_denom = max(w_mad, 0.4)
            w_zs = (w_arr - w_med) / w_denom
            for idx_w, z_val in enumerate(w_zs):
                if z_val > 4.5:
                    w_box = word_boxes[idx_w]
                    p_box = [max(0, w_box[0] - 4), max(0, w_box[1] - 4), min(w, w_box[2] + 4), min(h, w_box[3] + 4)]
                    all_regions.append({
                        "id": "F-ELA-01",
                        "code": "ela_region",
                        "severity": "critical",
                        "message": f"Error Level Analysis anomaly detected near ({p_box[0]}, {p_box[1]}) (altered text field)",
                        "bbox_native": p_box,
                        "score": float(z_val),
                        "kind": "ela_region",
                    })

    # Deduplicate overlapping regions (IoU > 0.4)
    deduped = []
    all_regions.sort(key=lambda r: r["score"], reverse=True)
    for reg in all_regions:
        b = reg["bbox_native"]
        overlap = False
        for ex in deduped:
            eb = ex["bbox_native"]
            ix1, iy1 = max(b[0], eb[0]), max(b[1], eb[1])
            ix2, iy2 = min(b[2], eb[2]), min(b[3], eb[3])
            if ix2 > ix1 and iy2 > iy1:
                inter = (ix2 - ix1) * (iy2 - iy1)
                union = (b[2] - b[0]) * (b[3] - b[1]) + (eb[2] - eb[0]) * (eb[3] - eb[1]) - inter
                if union > 0 and (inter / union) > 0.4:
                    overlap = True
                    break
        if not overlap:
            deduped.append(reg)

    return deduped[:ELA_MAX_REGIONS_PER_DOC], best_ela_map
