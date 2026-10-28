"""
Classifies a document type from raw OCR text.
Uses keyword matching — no ML model needed for MVP.
Returns a DocType string matching engine.contracts field names.
"""

# Keywords that strongly indicate each doc type
_SIGNATURES: dict[str, list[str]] = {
    "land_deed": [
        "sale deed", "land registration", "survey number",
        "registrar", "area", "sq ft", "owner name",
    ],
    "trust_certificate": [
        "trust", "society", "registration certificate",
        "charity commissioner", "valid until", "registered on",
    ],
    "faculty_list": [
        "faculty list", "total faculty", "qualification",
        "designation", "joining date", "professor", "lecturer",
    ],
    "fire_noc": [
        "no objection certificate", "fire", "noc number",
        "fire & emergency", "fire dept", "valid until", "premises",
    ],
}

def classify_document(pages_text: list[str]) -> str:
    """
    Given a list of page texts (from OCR), return the most likely doc_type.
    Returns "unknown" if no confident match.
    """
    full_text = " ".join(pages_text).lower()
    scores: dict[str, int] = {k: 0 for k in _SIGNATURES}

    for doc_type, keywords in _SIGNATURES.items():
        for kw in keywords:
            if kw in full_text:
                scores[doc_type] += 1

    best = max(scores, key=lambda k: scores[k])
    return best if scores[best] >= 2 else "unknown"
