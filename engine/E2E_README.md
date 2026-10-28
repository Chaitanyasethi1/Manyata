# AICTE Application Validation Engine - End-to-End Orchestrator

The validation engine composes four specialized stages into a unified pipeline conforming to `contracts/validation_result.schema.json`.

---

## 1. Pipeline Execution Order

```
[Application Folder + form_data]
              │
              ▼
   Stage 1: Extraction        (PyMuPDF + Tesseract: text, tables, QR, fields, confidence)
              │
              ▼
   Stage 2: Authenticity      (Format checks, date logic, registry lookup, cross-doc consistency)
              │
              ▼
   Stage 3: Forgery           (ELA, seal detection/reuse, copy-move, font/noise consistency)
              │
              ▼
   Stage 4: Compliance        (Mandatory documents check, AICTE handbook rules engine)
              │
              ▼
   [ValidationResult JSON]    (Contract validation against validation_result.schema.json)
```

The resulting modules list is strictly ordered:
`["authenticity", "forgery", "compliance"]`

---

## 2. Environment Variables

- `ENGINE_MODE`:
  - `"real"` (default): Runs the live 4-stage pipeline.
  - `"mock"`: Bypasses live extraction and delegates to `engine.mock.run_validation` (used for frontend mock development).
- `STORAGE_DIR`:
  - Directory where artifacts (such as full-page ELA forgery heatmaps) are written.
  - Default: `"storage"`.

---

## 3. How Member B / Backend Should Call It

The engine exposes two frozen public functions from `engine`:

```python
from engine import run_validation, run_validation_full, EngineError

# 1. Standard entry point returning strictly contract-valid ValidationResult
try:
    result = run_validation(
        application_dir="path/to/app_01",
        form_data={"application_id": "AICTE-2026-0001", ...}
    )
    # result conforms to contracts/validation_result.schema.json
    print("Application:", result["application_id"])
    print("Modules:", len(result["modules"]))
except ValueError as e:
    # Caller error (e.g., application_id missing or invalid format)
    print("Bad request:", e)
except EngineError as e:
    # Internal pipeline stage failure
    print(f"Engine failed at stage {e.stage}: {e} (cause: {e.cause})")

# 2. Detailed entry point returning (result, details)
result, details = run_validation_full(
    application_dir="path/to/app_01",
    form_data={"application_id": "AICTE-2026-0001", ...},
    storage_dir="storage"
)
print("Execution timings (sec):", details["timings_sec"])
print("Config SHAs:", details["engine_versions"])
```

---

## 4. Error Handling Behavior

- **`ValueError`**: Raised immediately if `application_id` is missing and cannot be derived from folder name. This signifies a caller error.
- **`EngineError`**: Raised if an unexpected crash occurs during any stage:
  - `stage="extraction"`: Document read or OCR failure.
  - `stage="authenticity"`: Authenticity analysis crash.
  - `stage="forgery"`: CV tamper analysis crash.
  - `stage="compliance"`: Rules syntax/type violation (`RulesError`) or compliance engine crash.
  - `stage="contract"`: Output failed contract JSON schema validation.
- **Empty / Non-Existent Directory**: Does **not** crash; gracefully emits mandatory missing document flags for all 4 slots.

---

## 5. Output Files & Artifacts

- **Heatmaps**: Written to `<storage_dir>/heatmaps/<app_dir>_<doc_type>_forgery.png` only when a document has $\ge 1$ forgery flag.
- **Demo Outputs**: When `python -m engine.demo` runs, it writes:
  - `engine/demo_out/<app_id>.json`: Comprehensive payload with validation results and details.
  - `engine/demo_out/summary.md`: Markdown summary table and flag listings.
