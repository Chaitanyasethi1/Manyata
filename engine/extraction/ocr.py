"""
Converts a PDF or image file to raw text using pytesseract.
Returns list of strings, one per page.
"""
from pathlib import Path
from PIL import Image
import pytesseract

SUPPORTED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".tiff", ".tif"}

def _pdf_to_images(path: Path, dpi: int = 200) -> list:
    """Convert PDF pages to PIL Images."""
    from pdf2image import convert_from_path
    return convert_from_path(str(path), dpi=dpi)

def _image_to_text(image: Image.Image) -> str:
    """Run tesseract on one PIL Image, return raw text."""
    config = "--oem 3 --psm 6"   # LSTM engine, assume uniform block of text
    return pytesseract.image_to_string(image, config=config)

def file_to_pages_text(file_path: str) -> list[str]:
    """
    Main entry point.
    Accepts PDF or image file path.
    Returns list of raw text strings, one per page.
    Raises FileNotFoundError if path does not exist.
    """
    p = Path(file_path)
    if not p.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    suffix = p.suffix.lower()

    if suffix == ".pdf":
        images = _pdf_to_images(p)
        return [_image_to_text(img) for img in images]

    if suffix in SUPPORTED_IMAGE_EXTS:
        img = Image.open(p)
        return [_image_to_text(img)]

    raise ValueError(f"Unsupported file type: {suffix}")
