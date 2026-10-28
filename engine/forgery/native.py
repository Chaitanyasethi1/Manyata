"""Native image loading and JPEG metadata extraction."""

from dataclasses import dataclass
import io
from pathlib import Path
import statistics
from typing import Any, List, Optional, Tuple, Union
import cv2
import numpy as np
from PIL import Image
import pymupdf

from .config import PAGE_DPI

# Standard IJG luminance quantization table (baseline 50% quality)
STANDARD_LUMINANCE_QUANT_TABLE: List[int] = [
    16, 11, 10, 16, 24, 40, 51, 61,
    12, 12, 14, 19, 26, 58, 60, 55,
    14, 13, 16, 24, 40, 57, 69, 56,
    14, 17, 22, 29, 51, 87, 80, 62,
    18, 22, 37, 56, 68, 109, 103, 77,
    24, 35, 55, 64, 81, 104, 113, 92,
    49, 64, 78, 87, 103, 121, 120, 101,
    72, 92, 95, 98, 112, 100, 103, 99,
]


@dataclass
class NativeImage:
    """Represents a loaded document image in native resolution."""
    bgr: np.ndarray
    jpeg_bytes: Optional[bytes]
    est_quality: Optional[int]
    width: int
    height: int
    page_scale_to_200dpi: float
    source_kind: str
    page_width_pt: float = 0.0
    page_height_pt: float = 0.0


def estimate_jpeg_quality(jpeg_bytes: bytes) -> Optional[int]:
    """Estimate the JPEG compression quality factor (1-100) from quantization tables.

    Uses the luminance quantization table from PIL and calculates the median
    scaling factor relative to the standard IJG baseline table.
    """
    if not jpeg_bytes:
        return None
    try:
        with Image.open(io.BytesIO(jpeg_bytes)) as im:
            if not hasattr(im, "quantization") or not im.quantization:
                return None
            # Table 0 is luminance
            if 0 not in im.quantization:
                return None
            table = list(im.quantization[0])
            scales = []
            for i, base_val in enumerate(STANDARD_LUMINANCE_QUANT_TABLE):
                if i < len(table) and base_val > 0 and table[i] > 0:
                    scales.append(100.0 * table[i] / base_val)
            if not scales:
                return None
            scale = statistics.median(scales)
            if scale <= 100.0:
                q = round((200.0 - scale) / 2.0)
            else:
                q = round(5000.0 / scale)
            return int(max(1, min(100, q)))
    except Exception:
        return None


def get_native_image(path: Union[str, Path]) -> Optional[NativeImage]:
    """Extract native document pixels and original embedded JPEG stream.

    For PDFs:
      Extracts the original embedded JPEG stream from Page 1 without re-encoding.
      Falls back to 150 dpi rendering if no embedded image exists.
    For Image files (JPG, PNG):
      Loads raw image bytes.
    """
    path_obj = Path(path)
    if not path_obj.exists() or path_obj.is_dir():
        return None

    ext = path_obj.suffix.lower()

    if ext == ".pdf":
        try:
            doc = pymupdf.open(str(path_obj))
            if len(doc) == 0:
                doc.close()
                return None
            page = doc[0]
            w_pt = float(page.rect.width)
            h_pt = float(page.rect.height)

            img_list = page.get_images()
            if img_list:
                # Primary embedded image
                xref = img_list[0][0]
                base_img = doc.extract_image(xref)
                raw_bytes = base_img.get("image")
                img_ext = base_img.get("ext", "").lower()
                doc.close()

                if raw_bytes:
                    nparr = np.frombuffer(raw_bytes, np.uint8)
                    bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    if bgr is not None:
                        h, w = bgr.shape[:2]
                        scale = (w_pt * 200.0 / 72.0) / float(w)
                        is_jpeg = img_ext in ["jpeg", "jpg"]
                        jpeg_bytes = raw_bytes if is_jpeg else None
                        est_q = estimate_jpeg_quality(jpeg_bytes) if jpeg_bytes else None
                        return NativeImage(
                            bgr=bgr,
                            jpeg_bytes=jpeg_bytes,
                            est_quality=est_q,
                            width=w,
                            height=h,
                            page_scale_to_200dpi=scale,
                            source_kind="pdf_embedded",
                            page_width_pt=w_pt,
                            page_height_pt=h_pt,
                        )

            # Fallback: render at 150 DPI
            pix = page.get_pixmap(dpi=150)
            doc.close()
            samples = pix.samples
            if pix.n >= 3:
                img = np.frombuffer(samples, dtype=np.uint8).reshape((pix.height, pix.width, pix.n))
                bgr = cv2.cvtColor(img[:, :, :3], cv2.COLOR_RGB2BGR)
            else:
                img = np.frombuffer(samples, dtype=np.uint8).reshape((pix.height, pix.width, 1))
                bgr = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
            h, w = bgr.shape[:2]
            scale = (w_pt * 200.0 / 72.0) / float(w)
            return NativeImage(
                bgr=bgr,
                jpeg_bytes=None,
                est_quality=None,
                width=w,
                height=h,
                page_scale_to_200dpi=scale,
                source_kind="pdf_rasterized",
                page_width_pt=w_pt,
                page_height_pt=h_pt,
            )
        except Exception:
            return None

    # Image inputs (.jpg, .jpeg, .png)
    try:
        raw_bytes = path_obj.read_bytes()
        nparr = np.frombuffer(raw_bytes, np.uint8)
        bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if bgr is None:
            return None
        h, w = bgr.shape[:2]
        is_jpeg = ext in [".jpg", ".jpeg"]
        jpeg_bytes = raw_bytes if is_jpeg else None
        est_q = estimate_jpeg_quality(jpeg_bytes) if jpeg_bytes else None
        return NativeImage(
            bgr=bgr,
            jpeg_bytes=jpeg_bytes,
            est_quality=est_q,
            width=w,
            height=h,
            page_scale_to_200dpi=1.0,
            source_kind="image_file",
            page_width_pt=0.0,
            page_height_pt=0.0,
        )
    except Exception:
        return None


def scale_bbox_to_200dpi(
    bbox_native: List[int],
    scale_or_native: Any,
    max_w: int = 1655,
    max_h: int = 2339,
) -> List[int]:
    """Convert native bbox [x1, y1, x2, y2] to 200 DPI page pixels, clamped."""
    scale = (
        scale_or_native.page_scale_to_200dpi
        if hasattr(scale_or_native, "page_scale_to_200dpi")
        else float(scale_or_native)
    )
    x1, y1, x2, y2 = bbox_native
    s_x1 = int(round(x1 * scale))
    s_y1 = int(round(y1 * scale))
    s_x2 = int(round(x2 * scale))
    s_y2 = int(round(y2 * scale))

    # Clamp
    s_x1 = max(0, min(max_w - 1, s_x1))
    s_y1 = max(0, min(max_h - 1, s_y1))
    s_x2 = max(0, min(max_w, s_x2))
    s_y2 = max(0, min(max_h, s_y2))

    # Ensure non-empty
    if s_x2 <= s_x1:
        s_x2 = min(max_w, s_x1 + 1)
    if s_y2 <= s_y1:
        s_y2 = min(max_h, s_y1 + 1)

    return [s_x1, s_y1, s_x2, s_y2]
