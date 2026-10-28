"""
Engine package initialization.
Exports run_validation (returns ValidationResult contract)
and run_validation_full (from orchestrator).
"""
from engine.pipeline import run_validation
from engine.orchestrator import run_validation_full
from engine.errors import EngineError

__all__ = ["run_validation", "run_validation_full", "EngineError"]
