"""
THE CONTRACT between engine/ and backend/.
backend/ imports ONLY from engine.contracts and engine (run_validation).
engine/ imports NOTHING from backend/.
Both members must never change field names without a joint decision.
"""
from dataclasses import dataclass, field
from typing import Literal, Optional
from enum import Enum

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH     = "high"
    MEDIUM   = "medium"
    LOW      = "low"

class ModuleName(str, Enum):
    AUTHENTICITY = "authenticity"
    FORGERY      = "forgery"
    COMPLIANCE   = "compliance"

@dataclass
class BoundingBox:
    page: int
    x: float
    y: float
    w: float
    h: float

@dataclass
class Evidence:
    page: int
    bbox: Optional[BoundingBox] = None
    heatmap_path: Optional[str] = None   # relative path inside application_dir

@dataclass
class Flag:
    id: str                              # e.g. "AUTH_001"
    severity: Severity
    message: str
    document: str                        # doc_type string, e.g. "land_deed"
    evidence: Optional[Evidence] = None
    clause: Optional[str] = None        # e.g. "AICTE Handbook 2024, Clause 4.3.1"

@dataclass
class ExtractionResult:
    doc_type: str
    fields: dict                         # arbitrary key-value pairs
    confidence: float                    # 0.0 – 1.0

@dataclass
class ModuleResult:
    module: ModuleName
    sub_score: float                     # 0 – 100
    flags: list[Flag] = field(default_factory=list)

@dataclass
class ValidationResult:
    application_id: str
    extraction: list[ExtractionResult] = field(default_factory=list)
    modules: list[ModuleResult]         = field(default_factory=list)
