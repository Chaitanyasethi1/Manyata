# API Contract — engine ↔ backend

## The ONE function
```python
from engine import run_validation
result: ValidationResult = run_validation(application_dir, form_data)
```

## Rules
1. backend/ imports ONLY `engine.contracts` types and `engine.run_validation`.
2. engine/ imports NOTHING from backend/.
3. `ValidationResult`, `Flag`, `ModuleResult`, `ExtractionResult` fields are frozen
   until both members agree to change them.
4. `heatmap_path` is relative to `application_dir`.
5. `sub_score` is always float 0–100. Scoring math lives in backend/services/.
6. Mock is the default until Member A ships the real module.

## Status lifecycle (enforced in backend)
SUBMITTED → PROCESSING → CLEARED | UNDER_REVIEW | DEFICIENT
UNDER_REVIEW → CLEARED | DEFICIENT
DEFICIENT → RESUBMITTED → PROCESSING
CLEARED → FORWARDED
