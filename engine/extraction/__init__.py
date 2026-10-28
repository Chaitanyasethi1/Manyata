"""Document extraction engine for AICTE application validation.

Exports:
    extract_document: Extract structured fields from a single document.
    extract_bundle: Extract structured fields from an application bundle directory.
    classify_document: Classify OCR text into a document type enum.
"""

from .api import extract_bundle, extract_document
from .classify import classify_document

__all__ = [
    "extract_document",
    "extract_bundle",
    "classify_document",
]
