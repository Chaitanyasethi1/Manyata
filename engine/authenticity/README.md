# Authenticity Verification Module (`engine.authenticity`)

The authenticity module analyzes documents and application bundles for structural integrity, logical chronology, expiry dates, external registry consistency, QR code alignment, metadata editing traces, and cross-document agreement.

## Checks Performed

| Check | Description | Default Severity |
| :--- | :--- | :---: |
| **Slot Mismatch** | Uploaded document type does not match slot type | `high` |
| **Format Validation** | Registration and NOC numbers validated against AICTE pattern regexes | `high` / `low` (if unreadable) |
| **Date Logic** | Issue and registration dates must be $\le$ reference date; Issue date $<$ Validity date | `high` |
| **Expiry Verification** | Fire NOC validity date checked against reference date; warns on upcoming expiry ($\le 30$ days) | `critical` / `low` |
| **Metadata Analysis** | PDF Producer/Creator analyzed for editor software (Photoshop, Photopea, GIMP, etc.); date gap check | `medium` |
| **QR Code Verification** | Decodes embedded QR codes and verifies payload facts against printed text | `high` / `low` (if unreadable) |
| **Registry Verification** | Queries mock government registry for matching registration records | `high` / `low` (if unreadable) |
| **Cross-Doc Consistency** | Verifies institution name, trust name, land area, and faculty counts across documents and form data | `critical` / `high` / `medium` |
| **Internal Consistency** | Validates printed faculty count against parsed faculty roster table row count | `medium` |

## Confidence-Aware Severity Downgrade

Any flag based on a field with OCR confidence below `LOW_CONF_THRESHOLD` (0.60) or listed in `_low_confidence` is automatically downgraded to `low` severity with an advisory message (`"possible mismatch, low OCR confidence, verify manually"`).

## External Registry Integration

```python
from engine.authenticity.registry import MockRegistry, RegistryAdapter
```

The runtime system uses `MockRegistry` reading from `engine/authenticity/data/mock_registry.json`.
To rebuild the mock registry from genuine dataset ground truth:

```bash
python -m engine.authenticity.build_mock_registry
```

*Note: In production, `RegistryAdapter` is implemented by connecting to official government APIs (DigiLocker, State Land Revenue records, Fire Safety Bureau).*

## Running Evaluation

```bash
python -m engine.authenticity.evaluate
```

Optional `--limit N` to test a subset of files:
```bash
python -m engine.authenticity.evaluate --limit 5
```

## Known Limitations

1. **Metadata Scrubbing**: Metadata analysis relies on PDF internal tags (`/Producer`, `/Creator`, `/ModDate`). Scrubbed, re-printed, or flattened PDFs will not trigger metadata editor flags (this is a weak corroborating signal).
2. **Visual/Raster Tampering**: Pixel-level copy-move, splice, and signature cloning are handled by the separate Forgery Detection module (`engine.forgery`). Authenticity focuses on documentary, structural, and cross-reference validity.
