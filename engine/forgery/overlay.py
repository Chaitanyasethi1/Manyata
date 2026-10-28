"""Visual forgery overlay generation with translucent heatmaps and annotated findings."""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import cv2
import numpy as np


def write_overlay(
    native_bgr: np.ndarray,
    ela_map: Optional[np.ndarray],
    findings: List[Dict[str, Any]],
    out_path: Union[str, Path],
) -> bool:
    """Generate and write a full-page forgery overlay image.

    Args:
        native_bgr: Base document image in native pixels.
        ela_map: 2D array of ELA intensity/z-scores, or None.
        findings: List of finding dicts containing 'bbox_native' and 'label' or 'kind'.
        out_path: Target PNG filepath to write.

    Returns:
        True if written successfully, False otherwise.
    """
    if native_bgr is None or native_bgr.size == 0:
        return False

    out_p = Path(out_path)
    out_p.parent.mkdir(parents=True, exist_ok=True)

    h, w = native_bgr.shape[:2]
    canvas = native_bgr.copy()

    # Apply translucent ELA heatmap if available
    if ela_map is not None and ela_map.size > 0:
        try:
            # Resize ela_map to match page if needed
            if ela_map.shape[:2] != (h, w):
                resized_ela = cv2.resize(ela_map.astype(np.float32), (w, h), interpolation=cv2.INTER_LINEAR)
            else:
                resized_ela = ela_map.astype(np.float32)

            min_val = float(np.min(resized_ela))
            max_val = float(np.max(resized_ela))
            if max_val > min_val:
                norm_ela = np.clip((resized_ela - min_val) / (max_val - min_val) * 255.0, 0, 255).astype(np.uint8)
            else:
                norm_ela = np.zeros((h, w), dtype=np.uint8)

            color_heat = cv2.applyColorMap(norm_ela, cv2.COLORMAP_JET)

            # Mask out cold areas (bottom 25%) so page stays mostly legible
            heat_mask = (norm_ela > 64).astype(np.float32)[:, :, np.newaxis]
            blended = cv2.addWeighted(canvas, 0.65, color_heat, 0.35, 0)
            canvas = (blended * heat_mask + canvas * (1.0 - heat_mask)).astype(np.uint8)
        except Exception:
            pass

    # Draw findings
    for item in findings:
        bbox = item.get("bbox_native")
        if not bbox or len(bbox) != 4:
            continue
        x1, y1, x2, y2 = bbox
        label = str(item.get("label") or item.get("kind") or "anomaly")

        # Red bounding box
        cv2.rectangle(canvas, (x1, y1), (x2, y2), (0, 0, 255), 2)

        # Label badge
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.45
        thickness = 1
        (tw, th), baseline = cv2.getTextSize(label, font, font_scale, thickness)

        badge_y1 = max(0, y1 - th - 6)
        badge_y2 = y1
        badge_x2 = min(w, x1 + tw + 6)
        cv2.rectangle(canvas, (x1, badge_y1), (badge_x2, badge_y2), (0, 0, 255), -1)
        cv2.putText(
            canvas,
            label,
            (x1 + 3, badge_y2 - 3),
            font,
            font_scale,
            (255, 255, 255),
            thickness,
            cv2.LINE_AA,
        )

    # Restrict max width to 1240 px
    if w > 1240:
        scale = 1240.0 / float(w)
        new_h = int(round(h * scale))
        canvas = cv2.resize(canvas, (1240, new_h), interpolation=cv2.INTER_AREA)

    return cv2.imwrite(str(out_p), canvas)
