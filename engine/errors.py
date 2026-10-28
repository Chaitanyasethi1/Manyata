"""Engine error hierarchy for validation orchestration."""

from typing import Optional


class EngineError(Exception):
    """Raised when an internal error occurs during validation execution.

    Attributes:
        stage: Pipeline stage where the error occurred
               (e.g., 'extraction', 'authenticity', 'forgery', 'compliance', 'contract').
        cause: The underlying exception that caused the error, if any.
    """

    def __init__(
        self,
        message: str,
        stage: str,
        cause: Optional[Exception] = None,
    ) -> None:
        super().__init__(message)
        self.stage = stage
        self.cause = cause

    def __repr__(self) -> str:
        return f"EngineError(stage={self.stage!r}, message={str(self)!r}, cause={self.cause!r})"
