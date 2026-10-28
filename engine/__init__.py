"""
Swap this file when real pipeline is ready.
To use mock:  from engine.mock_engine import run_validation
To use real:  from engine.pipeline import run_validation
"""
# During integration: use real pipeline with mock fallback
from engine.pipeline import run_validation

__all__ = ["run_validation"]
