"""Image pre-processing pipeline for OCR: grayscale, denoising, CLAHE contrast, skew estimation, deskew."""

import cv2
import numpy as np


def to_gray(img: np.ndarray) -> np.ndarray:
    """Convert an image to grayscale if it is BGR or color."""
    if img is None:
        return np.zeros((0, 0), dtype=np.uint8)
    if len(img.shape) == 2:
        return img.copy()
    if len(img.shape) == 3:
        if img.shape[2] == 1:
            return img[:, :, 0].copy()
        if img.shape[2] == 4:
            return cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
        return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return img.copy()


def denoise(img: np.ndarray) -> np.ndarray:
    """Denoise grayscale or BGR image using median blur."""
    if img is None or img.size == 0:
        return img
    if len(img.shape) == 2:
        return cv2.medianBlur(img, 3)
    return cv2.medianBlur(img, 3)


def contrast_clahe(img: np.ndarray, clip_limit: float = 2.0, tile_grid_size: tuple = (8, 8)) -> np.ndarray:
    """Enhance local contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)."""
    if img is None or img.size == 0:
        return img
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    if len(img.shape) == 2:
        return clahe.apply(img)
    # If color image, apply to L channel in LAB color space
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    lab_planes = list(cv2.split(lab))
    lab_planes[0] = clahe.apply(lab_planes[0])
    lab = cv2.merge(lab_planes)
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def estimate_skew_angle(img: np.ndarray) -> float:
    """Estimate document skew angle in degrees using minAreaRect on foreground text pixels.

    Returns:
        Skew angle in degrees. Positive indicates counter-clockwise tilt.
    """
    if img is None or img.size == 0:
        return 0.0

    gray = to_gray(img)
    # Otsu threshold to isolate text foreground (white text on black background)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    pts = cv2.findNonZero(thresh)
    if pts is None or len(pts) < 50:
        return 0.0

    rect = cv2.minAreaRect(pts)
    (w, h) = rect[1]
    angle = rect[2]

    # OpenCV minAreaRect angle formatting
    if w < h:
        angle = angle + 90.0

    # In OpenCV minAreaRect, counter-clockwise rotated text has rect angle = -skew
    skew = -angle
    while skew > 45.0:
        skew -= 90.0
    while skew < -45.0:
        skew += 90.0

    return float(skew)


def deskew(img: np.ndarray, angle: float) -> np.ndarray:
    """Deskew image by rotating to cancel the estimated skew angle.

    Only corrects when |angle| <= 10 degrees. Does nothing if outside this range or near zero.
    """
    if img is None or img.size == 0:
        return img

    # Only correct when |angle| <= 10 deg
    if abs(angle) > 10.0 or abs(angle) < 0.05:
        return img

    h, w = img.shape[:2]
    center = (w / 2.0, h / 2.0)
    # Rotating by -angle cancels out +angle skew
    M = cv2.getRotationMatrix2D(center, -angle, 1.0)
    border_val = 255 if len(img.shape) == 2 else (255, 255, 255)
    return cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=border_val)


def preprocess(img: np.ndarray) -> np.ndarray:
    """Run full pre-processing pipeline: grayscale, skew estimation and deskew, denoise, CLAHE.

    Returns:
        Processed grayscale image ready for OCR.
    """
    if img is None or img.size == 0:
        return img

    gray = to_gray(img)
    angle = estimate_skew_angle(gray)
    # deskew only applies when |angle| <= 10.0
    deskewed = deskew(gray, angle)
    denoised = denoise(deskewed)
    enhanced = contrast_clahe(denoised)
    return enhanced
