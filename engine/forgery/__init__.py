"""Forgery detection module for document validation."""

from .api import check_single_document, run_forgery

__all__ = ["run_forgery", "check_single_document"]
