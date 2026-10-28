"""External registry interface and mock registry implementation.

Mock of an external registry; real integration (DigiLocker/land records) needs official access.
"""

from abc import ABC, abstractmethod
import difflib
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from .config import AREA_TOL, NAME_MATCH_MIN


class RegistryAdapter(ABC):
    """Abstract adapter interface for external government/authority database lookups."""

    @abstractmethod
    def lookup_trust(self, reg_no: str) -> Optional[Dict[str, Any]]:
        """Lookup trust certificate details by registration number."""
        pass

    @abstractmethod
    def lookup_land(self, reg_no: str) -> Optional[Dict[str, Any]]:
        """Lookup land conveyance deed details by registration number."""
        pass

    @abstractmethod
    def lookup_noc(self, noc_no: str) -> Optional[Dict[str, Any]]:
        """Lookup fire safety NOC details by certificate reference number."""
        pass


class MockRegistry(RegistryAdapter):
    """Mock registry reading from committed mock_registry.json database."""

    def __init__(self, registry_path: Optional[Path] = None):
        self.path = registry_path or Path("engine/authenticity/data/mock_registry.json")
        self._data: Dict[str, Dict[str, Any]] = {"trusts": {}, "lands": {}, "nocs": {}}
        self._loaded = False
        self._load()

    def _load(self) -> None:
        if self.path.exists():
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
                    self._loaded = True
            except Exception:
                self._data = {"trusts": {}, "lands": {}, "nocs": {}}

    @property
    def is_available(self) -> bool:
        return self._loaded

    def lookup_trust(self, reg_no: str) -> Optional[Dict[str, Any]]:
        if not reg_no:
            return None
        return self._data.get("trusts", {}).get(reg_no.strip())

    def lookup_land(self, reg_no: str) -> Optional[Dict[str, Any]]:
        if not reg_no:
            return None
        return self._data.get("lands", {}).get(reg_no.strip())

    def lookup_noc(self, noc_no: str) -> Optional[Dict[str, Any]]:
        if not noc_no:
            return None
        return self._data.get("nocs", {}).get(noc_no.strip())


_DEFAULT_REGISTRY: Optional[MockRegistry] = None


def get_default_registry() -> MockRegistry:
    global _DEFAULT_REGISTRY
    if _DEFAULT_REGISTRY is None:
        _DEFAULT_REGISTRY = MockRegistry()
    return _DEFAULT_REGISTRY


def _fuzzy_match(s1: Optional[str], s2: Optional[str]) -> bool:
    if not s1 or not s2:
        return False
    norm1 = " ".join(s1.lower().split())
    norm2 = " ".join(s2.lower().split())
    return difflib.SequenceMatcher(None, norm1, norm2).ratio() >= NAME_MATCH_MIN


def check_registry_flags(
    doc_type: str,
    fields: Dict[str, Any],
    field_bboxes: Optional[Dict[str, Any]] = None,
    low_confidence_fields: Optional[List[str]] = None,
    registry: Optional[RegistryAdapter] = None,
) -> List[Dict[str, Any]]:
    """Query official registry and flag records not found or mismatched.

    If registry file is absent, skips silently.
    If the lookup key is low-confidence or missing, emits unreadable_field once and skips lookup.
    """
    if doc_type not in ["land_deed", "trust_cert", "fire_noc"]:
        return []

    reg = registry or get_default_registry()
    if isinstance(reg, MockRegistry) and not reg.is_available:
        return []

    bboxes = field_bboxes or {}
    low_confs = set(low_confidence_fields or [])

    id_field_name = "noc_number" if doc_type == "fire_noc" else "registration_number"
    raw_key = fields.get(id_field_name)
    key_str = str(raw_key).strip() if raw_key else ""

    if not key_str or id_field_name in low_confs:
        return [{
            "code": "unreadable_field",
            "field": id_field_name,
            "message": f"Document lookup key '{id_field_name}' is unreadable or has low OCR confidence",
            "bbox": bboxes.get(id_field_name),
            "is_low_conf": True,
        }]

    flags: List[Dict[str, Any]] = []

    if doc_type == "land_deed":
        record = reg.lookup_land(key_str)
        if record is None:
            flags.append({
                "code": "registry_not_found",
                "field": id_field_name,
                "message": f"Land deed registration number '{key_str}' was not found in official registry",
                "bbox": bboxes.get(id_field_name),
            })
        else:
            # Check owner_name
            reg_owner = record.get("owner_name", "")
            ext_owner = str(fields.get("owner_name") or "").strip()
            if ext_owner and reg_owner and not _fuzzy_match(ext_owner, reg_owner):
                flags.append({
                    "code": "registry_mismatch",
                    "field": "owner_name",
                    "message": f"Owner name '{ext_owner}' does not match official registry record ('{reg_owner}')",
                    "bbox": bboxes.get("owner_name"),
                })

            # Check land_area_acre
            reg_area = record.get("land_area_acre")
            ext_area = fields.get("land_area_acre")
            if ext_area is not None and reg_area is not None:
                try:
                    if abs(float(ext_area) - float(reg_area)) > AREA_TOL:
                        flags.append({
                            "code": "registry_mismatch",
                            "field": "land_area_acre",
                            "message": (
                                f"Land area ({float(ext_area):.1f} acre) does not match "
                                f"official registry record ({float(reg_area):.1f} acre)"
                            ),
                            "bbox": bboxes.get("land_area_acre"),
                        })
                except (ValueError, TypeError):
                    pass

            # Check registration_date
            reg_date = str(record.get("registration_date") or "").strip()
            ext_date = str(fields.get("registration_date") or "").strip()
            if ext_date and reg_date and ext_date != reg_date:
                flags.append({
                    "code": "registry_mismatch",
                    "field": "registration_date",
                    "message": (
                        f"Registration date '{ext_date}' does not match "
                        f"official registry record ('{reg_date}')"
                    ),
                    "bbox": bboxes.get("registration_date"),
                })

    elif doc_type == "trust_cert":
        record = reg.lookup_trust(key_str)
        if record is None:
            flags.append({
                "code": "registry_not_found",
                "field": id_field_name,
                "message": f"Trust registration number '{key_str}' was not found in official registry",
                "bbox": bboxes.get(id_field_name),
            })
        else:
            # Check trust_name
            reg_tname = record.get("trust_name", "")
            ext_tname = str(fields.get("trust_name") or "").strip()
            if ext_tname and reg_tname and not _fuzzy_match(ext_tname, reg_tname):
                flags.append({
                    "code": "registry_mismatch",
                    "field": "trust_name",
                    "message": f"Trust name '{ext_tname}' does not match official registry record ('{reg_tname}')",
                    "bbox": bboxes.get("trust_name"),
                })

            # Check institution_name
            reg_inst = record.get("institution_name", "")
            ext_inst = str(fields.get("institution_name") or "").strip()
            if ext_inst and reg_inst and not _fuzzy_match(ext_inst, reg_inst):
                flags.append({
                    "code": "registry_mismatch",
                    "field": "institution_name",
                    "message": (
                        f"Institution name '{ext_inst}' does not match "
                        f"official registry record ('{reg_inst}')"
                    ),
                    "bbox": bboxes.get("institution_name"),
                })

            # Check registration_date
            reg_date = str(record.get("registration_date") or "").strip()
            ext_date = str(fields.get("registration_date") or "").strip()
            if ext_date and reg_date and ext_date != reg_date:
                flags.append({
                    "code": "registry_mismatch",
                    "field": "registration_date",
                    "message": (
                        f"Registration date '{ext_date}' does not match "
                        f"official registry record ('{reg_date}')"
                    ),
                    "bbox": bboxes.get("registration_date"),
                })

    elif doc_type == "fire_noc":
        record = reg.lookup_noc(key_str)
        if record is None:
            flags.append({
                "code": "registry_not_found",
                "field": id_field_name,
                "message": f"Fire NOC number '{key_str}' was not found in official registry",
                "bbox": bboxes.get(id_field_name),
            })
        else:
            # Check institution_name
            reg_inst = record.get("institution_name", "")
            ext_inst = str(fields.get("institution_name") or "").strip()
            if ext_inst and reg_inst and not _fuzzy_match(ext_inst, reg_inst):
                flags.append({
                    "code": "registry_mismatch",
                    "field": "institution_name",
                    "message": (
                        f"Institution name '{ext_inst}' does not match "
                        f"official registry record ('{reg_inst}')"
                    ),
                    "bbox": bboxes.get("institution_name"),
                })

            # Check issue_date
            reg_idate = str(record.get("issue_date") or "").strip()
            ext_idate = str(fields.get("issue_date") or "").strip()
            if ext_idate and reg_idate and ext_idate != reg_idate:
                flags.append({
                    "code": "registry_mismatch",
                    "field": "issue_date",
                    "message": f"Issue date '{ext_idate}' does not match official registry record ('{reg_idate}')",
                    "bbox": bboxes.get("issue_date"),
                })

            # Check validity_date
            reg_vdate = str(record.get("validity_date") or "").strip()
            ext_vdate = str(fields.get("validity_date") or "").strip()
            if ext_vdate and reg_vdate and ext_vdate != reg_vdate:
                flags.append({
                    "code": "registry_mismatch",
                    "field": "validity_date",
                    "message": f"Validity date '{ext_vdate}' does not match official registry record ('{reg_vdate}')",
                    "bbox": bboxes.get("validity_date"),
                })

    return flags
