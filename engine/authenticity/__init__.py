"""Authenticity verification module for AICTE application validation.

Exports:
    run_authenticity: Validate an application bundle against authenticity rules.
    check_single_document: Validate an individual document file without cross-document rules.
"""

from .api import check_single_document, run_authenticity

__all__ = [
    "run_authenticity",
    "check_single_document",
]
