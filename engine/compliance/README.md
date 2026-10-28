# AICTE Compliance Module (SIH26261)

The Compliance module evaluates institution applications against the AICTE handbook norms defined in `rules/rules.json` and checks the presence of mandatory documents according to `engine/compliance/data/mandatory_documents.json`.

---

## 1. Facts Table & Provenance

The compliance engine aggregates facts from application inputs (`form.json`, extracted document fields from `engine.extraction.extract_bundle`, and file presence).

| Field Name | Type | Source & Provenance | Description |
|:---|:---:|:---|:---|
| `land_area_acre` | float | `form_data` (claim); fallback to `land_deed.pdf` | Total land area in acres. |
| `total_faculty` | int | `form_data` | Total teaching faculty claimed on application form. |
| `total_students` | int | `form_data` | Total student enrollment claimed on application form. |
| `faculty_count_listed` | int | `faculty_list.pdf` (OCR) | Number of faculty rows extracted from faculty list table. |
| `student_faculty_ratio` | float | `computed` | Computed as `round(total_students / total_faculty, 2)`. |
| `noc_present` | bool | `file_system` | `True` if `fire_noc.{pdf,jpg,png}` exists in application directory. |
| `noc_validity_ok` | bool | `fire_noc.pdf` (OCR) | `True` if fire NOC validity date $\ge$ application reference date. |
| `land_deed_present` | bool | `file_system` | `True` if `land_deed.{pdf,jpg,png}` exists in application directory. |
| `trust_cert_present` | bool | `file_system` | `True` if `trust_cert.{pdf,jpg,png}` exists in application directory. |
| `faculty_list_present` | bool | `file_system` | `True` if `faculty_list.{pdf,jpg,png}` exists in application directory. |

*Note: Missing facts evaluate to `None` (never `0`). If a fact derived from OCR originates from a field flagged in `_low_confidence`, any failing rule on that fact is downgraded to severity `low` with manual verification guidance.*

---

## 2. Rule Status Meanings

During evaluation, each rule in `rules/rules.json` is mapped to one of the following statuses:

- **`pass`**: The fact exists, matches the expected data type, and satisfies the operator condition (`>=`, `<=`, `==`, `in`). No flag emitted.
- **`fail`**: The fact exists but violates the operator condition. Emits a `C-RULE-<rule_id>` flag using the rule's severity (or downgraded to `low` if OCR confidence was low).
- **`pending_verification`**: The rule's `value` is `null` in `rules/rules.json`. Indicates an AICTE handbook threshold that has not yet been codified. No flag emitted.
- **`not_evaluable`**: The rule value is specified, but the required fact is `None` (e.g. missing document or unreadable field) or has an incompatible data type. Emits a low-severity `C-DATA-<rule_id>` flag.
- **`unknown_field`**: The rule's `field` is not in `KNOWN_FIELDS`. Recorded in `details["warnings"]`; no flag emitted.

---

## 3. Severity Map

Severity mappings are loaded from `engine/compliance/severity.json` and handbook rule specifications:

| Code / Violation | Severity | Notes |
|:---|:---:|:---|
| `missing_document` | `critical` | Missing mandatory file from checklist (`C-MISSING-<doc_type>`). |
| `data_not_evaluable` | `low` | Fact unavailable or unparseable for active rule (`C-DATA-<rule_id>`). |
| Rule violation (`fail`) | Rule severity | Inherits the rule's `severity` from `rules.json` (`critical`, `high`, `medium`, `low`). |
| Low-confidence violation | `low` | Downgraded to `low` with suffix `"(possible violation, low OCR confidence, verify manually)"`. |

---

## 4. How to Add a Rule

Rules are configured in `rules/rules.json` as a JSON array of objects with 7 required keys:

```json
{
  "rule_id": "RULE_LAND_AREA_UG_DEGREE",
  "category": "infrastructure",
  "field": "land_area_acre",
  "operator": ">=",
  "value": 7.5,
  "clause": "AICTE APH 2024-27 Clause 4.1.2",
  "severity": "critical",
  "description": "Minimum land requirement for Mega/Metro cities"
}
```

### Constraints:
1. `rule_id`: Unique non-empty string.
2. `operator`: Must be one of `">="`, `"<="`, `"=="`, `"in"`.
3. `severity`: Must be one of `"critical"`, `"high"`, `"medium"`, `"low"`.
4. `value`: Must be `null` (for pending verification) or a valid number, boolean, string, or list (for `in`).
5. Extra keys (e.g. `"description"`, `"category"`) are preserved.

---

## 5. Guidelines for Member B (Field Naming)

When Member B codifies handbook clauses into `rules/rules.json`:
1. Use exact field names from `KNOWN_FIELDS`:
   - `land_area_acre`
   - `total_faculty`
   - `total_students`
   - `faculty_count_listed`
   - `student_faculty_ratio`
   - `noc_present`
   - `noc_validity_ok`
   - `land_deed_present`
   - `trust_cert_present`
   - `faculty_list_present`
2. Avoid inventing ad-hoc field names; unknown field names trigger a warning and cannot be evaluated against application facts.
3. Replace `"value": null` and `"clause": "TO_VERIFY"` with real handbook constants and section citations.

---

## 6. Limitations

1. **No RAG / Dynamic Retrieval**: The module uses deterministic rule matching rather than LLM text retrieval.
2. **Clause Text Not Extracted from PDF**: Clause citations come strictly from `rules.json` and checklist configurations; they are not dynamically looked up from raw handbook PDF files.
3. **MVP Mandatory Checklist**: The mandatory documents checklist (`mandatory_documents.json`) is an MVP system checklist for the 4 core supported document types (`land_deed`, `trust_cert`, `faculty_list`, `fire_noc`). Full handbook checklists across institution types must be verified by Member B.
