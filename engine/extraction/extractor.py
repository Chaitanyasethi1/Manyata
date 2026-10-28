"""
Orchestrates: file → OCR → classify → parse → ExtractionResult
"""
from pathlib import Path
from engine.contracts import ExtractionResult
from engine.extraction.ocr import file_to_pages_text
from engine.extraction.classifier import classify_document
from engine.extraction.parsers import PARSER_MAP

def extract_document(file_path: str) -> ExtractionResult:
    """
    Process a single document file.
    Returns ExtractionResult with doc_type, fields, confidence.
    Confidence is a simple heuristic: fraction of expected fields
    that were successfully extracted (non-None).
    """
    pages_text = file_to_pages_text(file_path)
    doc_type   = classify_document(pages_text)

    parser = PARSER_MAP.get(doc_type)
    if parser is None:
        # Unknown doc type — return empty extraction
        return ExtractionResult(
            doc_type="unknown",
            fields={},
            confidence=0.0,
        )

    fields = parser(pages_text)

    # Confidence = fraction of non-None fields
    non_null = sum(1 for v in fields.values() if v is not None)
    confidence = round(non_null / max(len(fields), 1), 2)

    return ExtractionResult(
        doc_type=doc_type,
        fields=fields,
        confidence=confidence,
    )

def extract_documents(application_dir: str) -> list[ExtractionResult]:
    """
    Process all PDF/image files in application_dir.
    Skips form_data.json and any non-document files.
    Returns list of ExtractionResult, one per file.
    """
    supported = {".pdf", ".jpg", ".jpeg", ".png", ".tiff", ".tif"}
    results   = []

    for fpath in sorted(Path(application_dir).iterdir()):
        if fpath.suffix.lower() not in supported:
            continue
        try:
            result = extract_document(str(fpath))
            results.append(result)
        except Exception as e:
            # Log and continue — one bad file should not kill the pipeline
            print(f"[extraction] WARNING: skipping {fpath.name}: {e}")
            results.append(ExtractionResult(
                doc_type="unknown",
                fields={"error": str(e)},
                confidence=0.0,
            ))

    return results
