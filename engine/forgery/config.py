"""System constants and calibrated thresholds for the forgery detection module.

Note: Thresholds start with sensible defaults and are calibrated on the synthetic dataset.
These are SYSTEM parameters, not AICTE norms.
"""

from typing import List

# Reference DPI for coordinate contract:
# evidence.bbox must be in PAGE-1 PIXELS AT 200 DPI.
PAGE_DPI: int = 200

# Reliability assessment
DEGRADED_JPEG_QUALITY: int = 80
NOISE_GLOBAL_SIGMA_THRESH: float = 12.0

# Document role sets
DOCS_WITH_SEAL: List[str] = ["land_deed", "trust_cert", "fire_noc"]
COPYMOVE_SKIP_DOCS: List[str] = ["faculty_list"]
SLOT_ORDER: List[str] = ["land_deed", "trust_cert", "faculty_list", "fire_noc"]

# ---------------------------------------------------------------------------
# Calibrated Thresholds (calibrated on synthetic dataset seed 42)
# ---------------------------------------------------------------------------

# ELA configuration
ELA_QUALITY_CANDIDATES: List[int] = [70, 75, 80, 85, 90, 95]
ELA_BLOCK: int = 32
ELA_Z_THRESH: float = 2.8
ELA_MIN_AREA_PX: int = 400
ELA_MIN_BLOCKS: int = 4
ELA_MAX_REGIONS_PER_DOC: int = 3

# Seal detection and reuse
SEAL_EXPECTED_RADIUS_RATIO: float = 0.08  # roughly 100px radius on 1240px wide page
SEAL_MIN_RADIUS_RATIO: float = 0.04
SEAL_MAX_RADIUS_RATIO: float = 0.14
SEAL_CIRCULARITY_MIN: float = 0.65
SEAL_NCC_REUSE: float = 0.94
SEAL_ORB_MIN_INLIERS: int = 40

# Copy-move detection
COPYMOVE_MIN_INLIERS: int = 8
COPYMOVE_MIN_DISPLACEMENT_PX: int = 50
COPYMOVE_KNN_RATIO: float = 0.75

# Text & noise consistency (weak signals)
FONT_Z_THRESH: float = 4.0
NOISE_Z_THRESH: float = 4.0
