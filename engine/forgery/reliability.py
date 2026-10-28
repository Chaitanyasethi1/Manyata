"""Document scan degradation and image reliability assessment."""

import cv2
import numpy as np

from .config import DEGRADED_JPEG_QUALITY, NOISE_GLOBAL_SIGMA_THRESH
from .native import NativeImage


def compute_global_noise_sigma(bgr: np.ndarray) -> float:
    """Compute robust MAD of high-pass residual on uniform background pixels."""
    if bgr is None or bgr.size == 0:
        return 0.0

    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    # Background mask: bright paper pixels
    bg_mask = (gray > 210).astype(np.uint8)
    # Erode to stay away from text edges and borders
    kernel = np.ones((5, 5), np.uint8)
    eroded_mask = cv2.erode(bg_mask, kernel)

    if np.count_nonzero(eroded_mask) < 200:
        # Fallback to brighter pixels without erosion
        eroded_mask = (gray > 220).astype(np.uint8)
        if np.count_nonzero(eroded_mask) < 50:
            return 0.0

    # High-pass residual via median blur or gaussian blur
    blur = cv2.GaussianBlur(gray, (5, 5), 0).astype(np.float32)
    residual = gray.astype(np.float32) - blur
    bg_res = residual[eroded_mask > 0]

    med = np.median(bg_res)
    mad = float(np.median(np.abs(bg_res - med)) * 1.4826)
    return mad


def assess_reliability(native: NativeImage) -> str:
    """Assess whether document is of normal digital quality or degraded scan.

    Returns:
        'normal' or 'degraded'
    """
    if native is None or native.bgr is None:
        return "degraded"

    # Missing embedded JPEG stream in PDF indicates rasterized or non-standard creation
    if native.source_kind == "pdf_rasterized" or native.jpeg_bytes is None:
        if native.source_kind != "image_file":
            return "degraded"

    # Check compression quality
    if native.est_quality is not None and native.est_quality < DEGRADED_JPEG_QUALITY:
        return "degraded"

    # Check background sensor/scanner noise
    noise_sigma = compute_global_noise_sigma(native.bgr)
    if noise_sigma > NOISE_GLOBAL_SIGMA_THRESH:
        return "degraded"

    return "normal"
