"""Document loader for rasterizing PDFs and reading image files into BGR numpy arrays."""

from pathlib import Path
from typing import List, Union
import cv2
import numpy as np
import pymupdf


def load_pages(path: Union[str, Path], dpi: int = 200) -> List[np.ndarray]:
    """Load all pages of a document as a list of BGR numpy images.

    Args:
        path: Path to PDF or image file (JPG, PNG, etc.).
        dpi: DPI resolution for PDF rasterization (default: 200).

    Returns:
        List of BGR numpy ndarrays (H, W, 3). Empty list if file cannot be read.
    """
    path_obj = Path(path)
    if not path_obj.exists() or path_obj.is_dir():
        return []

    ext = path_obj.suffix.lower()

    if ext == ".pdf":
        pages = []
        try:
            doc = pymupdf.open(str(path_obj))
            for page in doc:
                pix = page.get_pixmap(dpi=dpi)
                samples = pix.samples
                if pix.n == 4:
                    img = np.frombuffer(samples, dtype=np.uint8).reshape((pix.height, pix.width, 4))
                    bgr = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
                elif pix.n == 3:
                    img = np.frombuffer(samples, dtype=np.uint8).reshape((pix.height, pix.width, 3))
                    bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                elif pix.n == 1:
                    img = np.frombuffer(samples, dtype=np.uint8).reshape((pix.height, pix.width, 1))
                    bgr = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
                else:
                    continue
                pages.append(bgr)
            doc.close()
        except Exception:
            return []
        return pages

    # Image file
    try:
        with open(str(path_obj), "rb") as f:
            data = f.read()
        nparr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is not None:
            return [img]
    except Exception:
        pass

    return []
