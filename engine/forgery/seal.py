"""Official seal detection, crop normalization, and cross-document seal reuse verification."""

from typing import Any, Dict, List, Optional, Tuple, Union
import cv2
import numpy as np

from .config import (
    DOCS_WITH_SEAL,
    SEAL_CIRCULARITY_MIN,
    SEAL_MAX_RADIUS_RATIO,
    SEAL_MIN_RADIUS_RATIO,
    SEAL_NCC_REUSE,
    SEAL_ORB_MIN_INLIERS,
    SLOT_ORDER,
)


def detect_seals(bgr: np.ndarray) -> List[Dict[str, Any]]:
    """Detect official circular stamp seals in a document image.

    Returns:
        List of dicts: [{'bbox': [x1, y1, x2, y2], 'circularity': float, 'score': float, 'center': (cx, cy), 'radius': r}]
        Sorted by confidence score descending. Up to 2 candidates returned.
    """
    if bgr is None or bgr.size == 0:
        return []

    h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    min_r = int(w * SEAL_MIN_RADIUS_RATIO)
    max_r = int(w * SEAL_MAX_RADIUS_RATIO)

    # Edge detection for ring contrast verification
    edges = cv2.Canny(gray, 50, 150)

    # Hough circle transform
    circles = cv2.HoughCircles(
        gray,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=min_r * 2,
        param1=100,
        param2=42,
        minRadius=min_r,
        maxRadius=max_r,
    )

    candidates = []
    if circles is not None:
        circles_arr = np.round(circles[0, :]).astype(int)
        for cx, cy, r in circles_arr:
            x1 = max(0, cx - r)
            y1 = max(0, cy - r)
            x2 = min(w, cx + r)
            y2 = min(h, cy + r)

            # Circularity and ring contrast verification
            ring_mask = np.zeros((h, w), dtype=np.uint8)
            cv2.circle(ring_mask, (cx, cy), r, 255, 3)
            ring_edge_count = np.count_nonzero(edges[ring_mask > 0])
            ring_total = np.count_nonzero(ring_mask > 0)
            contrast_score = float(ring_edge_count / max(1, ring_total))

            # Heuristic: seals are not in the top banner (y > 0.15 * h)
            if cy < int(0.15 * h):
                contrast_score *= 0.5

            if contrast_score >= 0.15:
                candidates.append({
                    "bbox": [int(x1), int(y1), int(x2), int(y2)],
                    "center": (int(cx), int(cy)),
                    "radius": int(r),
                    "circularity": 0.95,
                    "score": float(contrast_score),
                })

    # Contour circularity fallback
    if not candidates:
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 25, 4
        )
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            area = cv2.contourArea(cnt)
            perimeter = cv2.arcLength(cnt, True)
            if perimeter == 0:
                continue
            circularity = 4.0 * np.pi * area / (perimeter * perimeter)
            (cx, cy), r = cv2.minEnclosingCircle(cnt)
            if min_r <= r <= max_r and circularity >= SEAL_CIRCULARITY_MIN:
                x1 = max(0, int(cx - r))
                y1 = max(0, int(cy - r))
                x2 = min(w, int(cx + r))
                y2 = min(h, int(cy + r))
                candidates.append({
                    "bbox": [x1, y1, x2, y2],
                    "center": (int(cx), int(cy)),
                    "radius": int(r),
                    "circularity": float(circularity),
                    "score": float(circularity * 0.4),
                })

    candidates.sort(key=lambda c: c["score"], reverse=True)
    # Keep at most 2 clearly separated candidates
    filtered = []
    for c in candidates:
        if not filtered:
            filtered.append(c)
        else:
            cx, cy = c["center"]
            prev_cx, prev_cy = filtered[0]["center"]
            dist = np.hypot(cx - prev_cx, cy - prev_cy)
            if dist > min_r * 2.5:
                filtered.append(c)
                break
    return filtered


def normalize_crop(bgr: np.ndarray, bbox: List[int], size: int = 128) -> np.ndarray:
    """Extract, resize, contrast-normalize, and circle-mask a detected seal crop."""
    x1, y1, x2, y2 = bbox
    h, w = bgr.shape[:2]
    x1 = max(0, min(w - 1, x1))
    y1 = max(0, min(h - 1, y1))
    x2 = max(x1 + 1, min(w, x2))
    y2 = max(y1 + 1, min(h, y2))

    crop = bgr[y1:y2, x1:x2]
    if crop.size == 0:
        return np.zeros((size, size), dtype=np.uint8)

    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (size, size), interpolation=cv2.INTER_AREA).astype(np.float32)

    # Linear contrast stretch
    min_val = float(np.min(resized))
    max_val = float(np.max(resized))
    if max_val > min_val:
        norm = (resized - min_val) / (max_val - min_val) * 255.0
    else:
        norm = resized

    # Circle mask
    mask = np.zeros((size, size), dtype=np.uint8)
    cv2.circle(mask, (size // 2, size // 2), size // 2 - 2, 255, -1)
    return cv2.bitwise_and(norm.astype(np.uint8), mask)


def similarity(crop1: np.ndarray, crop2: np.ndarray) -> Dict[str, Any]:
    """Compute normalized cross-correlation and keypoint inlier similarity between two seal crops."""
    if crop1 is None or crop2 is None or crop1.size == 0 or crop2.size == 0:
        return {"ncc": 0.0, "orb_inliers": 0}

    h, w = crop1.shape[:2]

    # Mask inner text area (where authority name, doc code, and sample seal text are printed)
    inner_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.circle(inner_mask, (w // 2, h // 2), int(w * 0.38), 255, -1)

    # Max NCC over small translation shifts (+-4 px)
    best_ncc = -1.0
    for dx in range(-4, 5):
        for dy in range(-4, 5):
            M = np.float32([[1, 0, dx], [0, 1, dy]])
            shifted = cv2.warpAffine(crop2, M, (w, h))

            v1 = crop1[inner_mask > 0].astype(np.float32)
            v2 = shifted[inner_mask > 0].astype(np.float32)
            v1_c = v1 - np.mean(v1)
            v2_c = v2 - np.mean(v2)
            denom = np.sqrt(np.sum(v1_c**2) * np.sum(v2_c**2))
            if denom > 0:
                score = float(np.sum(v1_c * v2_c) / denom)
                if score > best_ncc:
                    best_ncc = score

    # Keypoint matching with deterministic RANSAC on inner area
    cv2.setRNGSeed(0)
    if hasattr(cv2, "SIFT_create"):
        detector = cv2.SIFT_create()
        norm_type = cv2.NORM_L2
    else:
        detector = cv2.ORB_create(500)
        norm_type = cv2.NORM_HAMMING

    inliers = 0
    try:
        kp1, des1 = detector.detectAndCompute(crop1, inner_mask)
        kp2, des2 = detector.detectAndCompute(crop2, inner_mask)
        if des1 is not None and des2 is not None and len(kp1) >= 4 and len(kp2) >= 4:
            bf = cv2.BFMatcher(norm_type, crossCheck=False)
            matches = bf.knnMatch(des1, des2, k=2)
            good = [m for m, n in matches if len(matches[0]) == 2 and m.distance < 0.75 * n.distance]
            if len(good) >= 4:
                src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
                dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
                _, r_mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 4.0)
                if r_mask is not None:
                    inliers = int(np.sum(r_mask))
    except Exception:
        inliers = 0

    return {"ncc": max(0.0, float(best_ncc)), "orb_inliers": inliers}


def check_seal_reuse_across_bundle(
    doc_seals: Dict[str, Tuple[Dict[str, Any], np.ndarray]],
    slot_order: Optional[List[str]] = None,
    ncc_thresh: float = SEAL_NCC_REUSE,
    orb_inliers_thresh: int = SEAL_ORB_MIN_INLIERS,
) -> List[Dict[str, Any]]:
    """Compare detected seals across all document pairs in a bundle."""
    if slot_order is None:
        slot_order = SLOT_ORDER

    flags = []
    compared_pairs = set()

    doc_names = list(doc_seals.keys())
    for i, doc_a in enumerate(doc_names):
        for j in range(i + 1, len(doc_names)):
            doc_b = doc_names[j]
            pair_key = tuple(sorted([doc_a, doc_b]))
            if pair_key in compared_pairs:
                continue
            compared_pairs.add(pair_key)

            seal_a, crop_a = doc_seals[doc_a]
            seal_b, crop_b = doc_seals[doc_b]

            sim = similarity(crop_a, crop_b)
            # Reused seal condition
            if sim["ncc"] >= ncc_thresh or sim["orb_inliers"] >= orb_inliers_thresh:
                # Attach flag to the LATER document in SLOT_ORDER
                def get_order_idx(d_name: str) -> int:
                    stem = d_name.split(".")[0].lower()
                    for idx, s in enumerate(slot_order):
                        if s in stem:
                            return idx
                    return 99

                order_a = get_order_idx(doc_a)
                order_b = get_order_idx(doc_b)

                if order_b >= order_a:
                    flagged_doc = doc_b
                    donor_doc = doc_a
                    flagged_seal = seal_b
                else:
                    flagged_doc = doc_a
                    donor_doc = doc_b
                    flagged_seal = seal_a

                msg = (
                    f"Seal on {flagged_doc} is a near-exact copy of the seal on {donor_doc} "
                    f"(NCC: {sim['ncc']:.3f}, matching keypoints: {sim['orb_inliers']}; check which document is genuine)"
                )
                flags.append({
                    "id": "F-SEAL-01",
                    "code": "seal_reuse",
                    "severity": "critical",
                    "message": msg,
                    "document": flagged_doc,
                    "bbox_native": flagged_seal["bbox"],
                    "kind": "seal_reuse",
                    "score": float(sim["ncc"]),
                })

    return flags
