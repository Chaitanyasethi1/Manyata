"""Intra-document copy-move forgery detection using keypoint self-matching and spatial clustering."""

from collections import defaultdict
from typing import Any, Dict, List, Optional
import cv2
import numpy as np

from .config import (
    COPYMOVE_KNN_RATIO,
    COPYMOVE_MIN_DISPLACEMENT_PX,
    COPYMOVE_MIN_INLIERS,
    COPYMOVE_SKIP_DOCS,
)


def detect_copymove(
    bgr: np.ndarray,
    doc_type: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Detect copy-move regions within a single document image.

    Args:
        bgr: Native document image.
        doc_type: Optional document type name (skips tabular rosters like faculty_list).

    Returns:
        List of copy-move findings with 'bbox_native', 'source_bbox', and 'score'.
    """
    if bgr is None or bgr.size == 0:
        return []

    if doc_type and doc_type in COPYMOVE_SKIP_DOCS:
        return []

    h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    cv2.setRNGSeed(0)
    if hasattr(cv2, "SIFT_create"):
        detector = cv2.SIFT_create(nfeatures=2500)
        norm_type = cv2.NORM_L2
    else:
        detector = cv2.ORB_create(nfeatures=2500)
        norm_type = cv2.NORM_HAMMING

    try:
        kp, des = detector.detectAndCompute(gray, None)
    except Exception:
        return []

    if des is None or len(kp) < 20:
        return []

    bf = cv2.BFMatcher(norm_type, crossCheck=False)
    try:
        # Match against itself; k=5 to skip self-match
        matches = bf.knnMatch(des, des, k=5)
    except Exception:
        return []

    candidate_pairs = []
    seen_pairs = set()

    for m_list in matches:
        if len(m_list) < 3:
            continue
        # Find 1st and 2nd non-self matches
        q_idx = m_list[0].queryIdx
        valid_m = [m for m in m_list if m.trainIdx != q_idx]
        if len(valid_m) < 2:
            continue
        m1, m2 = valid_m[0], valid_m[1]
        if m1.distance < COPYMOVE_KNN_RATIO * m2.distance:
            t_idx = m1.trainIdx
            pair_key = (min(q_idx, t_idx), max(q_idx, t_idx))
            if pair_key in seen_pairs:
                continue
            seen_pairs.add(pair_key)

            pt1 = np.array(kp[q_idx].pt)
            pt2 = np.array(kp[t_idx].pt)
            disp = pt2 - pt1
            dist = np.linalg.norm(disp)
            if dist >= COPYMOVE_MIN_DISPLACEMENT_PX:
                # Canonicalize vector direction (dy > 0 or dy == 0 and dx > 0)
                if disp[1] < 0 or (disp[1] == 0 and disp[0] < 0):
                    disp = -disp
                    pt_src, pt_dst = pt2, pt1
                else:
                    pt_src, pt_dst = pt1, pt2

                candidate_pairs.append((pt_src, pt_dst, disp))

    if len(candidate_pairs) < COPYMOVE_MIN_INLIERS:
        return []

    # Cluster by displacement vector (bin size 25 pixels)
    clusters = defaultdict(list)
    bin_size = 25.0
    for pt_src, pt_dst, disp in candidate_pairs:
        bx = int(round(disp[0] / bin_size))
        by = int(round(disp[1] / bin_size))
        clusters[(bx, by)].append((pt_src, pt_dst))

    findings = []
    for (bx, by), pair_pts in clusters.items():
        if len(pair_pts) < COPYMOVE_MIN_INLIERS:
            continue

        src_pts = np.float32([p[0] for p in pair_pts])
        dst_pts = np.float32([p[1] for p in pair_pts])

        # Verify geometric consistency using affine transformation
        try:
            _, inlier_mask = cv2.estimateAffinePartial2D(
                src_pts, dst_pts, method=cv2.RANSAC, ransacReprojThreshold=6.0
            )
        except Exception:
            continue

        if inlier_mask is None:
            continue

        num_inliers = int(np.sum(inlier_mask))
        if num_inliers < COPYMOVE_MIN_INLIERS:
            continue

        in_src = src_pts[inlier_mask.ravel() == 1]
        in_dst = dst_pts[inlier_mask.ravel() == 1]

        # Verify that regions are 2D patches and not a single straight line of repeated letters
        src_w = np.ptp(in_src[:, 0])
        src_h = np.ptp(in_src[:, 1])
        dst_w = np.ptp(in_dst[:, 0])
        dst_h = np.ptp(in_dst[:, 1])

        if src_w < 15 or src_h < 15 or dst_w < 15 or dst_h < 15:
            continue

        # Target bbox is the later/lower one
        pad = 8
        s_x1, s_y1 = int(np.min(in_src[:, 0])) - pad, int(np.min(in_src[:, 1])) - pad
        s_x2, s_y2 = int(np.max(in_src[:, 0])) + pad, int(np.max(in_src[:, 1])) + pad

        t_x1, t_y1 = int(np.min(in_dst[:, 0])) - pad, int(np.min(in_dst[:, 1])) - pad
        t_x2, t_y2 = int(np.max(in_dst[:, 0])) + pad, int(np.max(in_dst[:, 1])) + pad

        src_box = [max(0, s_x1), max(0, s_y1), min(w, s_x2), min(h, s_y2)]
        dst_box = [max(0, t_x1), max(0, t_y1), min(w, t_x2), min(h, t_y2)]

        # Lower region is target
        if t_y1 >= s_y1:
            target_bbox = dst_box
            source_bbox = src_box
        else:
            target_bbox = src_box
            source_bbox = dst_box

        # Patch cross-correlation check: verify that the two regions actually look identical
        c_src = gray[source_bbox[1]:source_bbox[3], source_bbox[0]:source_bbox[2]]
        c_dst = gray[target_bbox[1]:target_bbox[3], target_bbox[0]:target_bbox[2]]
        if c_src.size == 0 or c_dst.size == 0:
            continue

        min_ch = min(c_src.shape[0], c_dst.shape[0])
        min_cw = min(c_src.shape[1], c_dst.shape[1])
        if min_ch < 15 or min_cw < 15:
            continue

        c_s_crop = c_src[:min_ch, :min_cw]
        c_d_crop = c_dst[:min_ch, :min_cw]
        v_s = c_s_crop.astype(np.float32) - np.mean(c_s_crop)
        v_d = c_d_crop.astype(np.float32) - np.mean(c_d_crop)
        denom = np.sqrt(np.sum(v_s**2) * np.sum(v_d**2))
        patch_ncc = float(np.sum(v_s * v_d) / max(denom, 1e-6))

        if patch_ncc < 0.75:
            continue

        findings.append({
            "id": "F-CPMV-01",
            "code": "copy_move",
            "severity": "critical",
            "message": (
                f"Copy-move duplicate region detected near ({target_bbox[0]}, {target_bbox[1]}), "
                f"matching source patch near ({source_bbox[0]}, {source_bbox[1]}) with {num_inliers} consistent inliers "
                f"(patch NCC: {patch_ncc:.3f})"
            ),
            "bbox_native": target_bbox,
            "target_bbox": target_bbox,
            "source_bbox": source_bbox,
            "kind": "copy_move",
            "score": float(num_inliers),
        })

    return findings
