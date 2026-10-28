"""Document type classifier based on keyword scoring and fuzzy matching."""

import difflib
import re
from typing import Dict, List, Tuple

DOC_KEYWORDS: Dict[str, Dict[str, float]] = {
    "land_deed": {
        "title deed": 3.0,
        "conveyance": 3.0,
        "demarcated area": 3.0,
        "deed registration": 3.0,
        "survey number": 2.5,
        "plot number": 2.5,
        "acres": 2.0,
        "acre": 2.0,
        "freehold": 2.0,
        "registration & stamps": 2.5,
        "ownership": 2.0,
        "plot": 1.5,
        "sub-registrar": 2.0,
    },
    "trust_cert": {
        "charity commissioner": 3.5,
        "public trusts": 3.0,
        "trust registration": 3.0,
        "governing trustees": 3.5,
        "trustees": 2.5,
        "trust / society": 2.5,
        "sponsored institution": 2.5,
        "trusts act": 3.0,
        "society name": 2.0,
        "trust name": 2.0,
        "registered office": 2.0,
    },
    "faculty_list": {
        "faculty appointment": 3.5,
        "faculty roster": 3.5,
        "total faculty": 3.5,
        "teaching staff": 3.0,
        "faculty member": 3.0,
        "qualification": 2.5,
        "designation": 2.5,
        "department": 2.0,
        "experience": 2.0,
        "exp (yrs)": 2.5,
        "s.no": 1.5,
        "professor": 2.0,
    },
    "fire_noc": {
        "fire & rescue": 3.5,
        "no objection certificate": 3.5,
        "fire noc": 3.5,
        "fire safety": 3.0,
        "valid upto": 3.0,
        "issuing fire authority": 3.0,
        "inspection & issue": 2.5,
        "disaster preparedness": 2.5,
        "hydrant": 2.0,
        "occupancy": 2.0,
        "divisional fire officer": 2.5,
    },
}


def _fuzzy_contains_phrase(text: str, phrase: str, threshold: float = 0.8) -> bool:
    """Check if a phrase exists in text with case-insensitivity or high fuzzy similarity."""
    if phrase in text:
        return True

    p_words = phrase.split()
    if len(p_words) == 1:
        # Single word: check similarity with tokens
        tokens = re.findall(r"\b[a-zA-Z]{3,}\b", text)
        for t in tokens:
            if abs(len(t) - len(phrase)) <= 2:
                if difflib.SequenceMatcher(None, t, phrase).ratio() >= threshold:
                    return True
        return False

    # Multi-word phrase: check sliding window of same word count
    tokens = text.split()
    w_len = len(p_words)
    p_joined = " ".join(p_words)
    for i in range(len(tokens) - w_len + 1):
        window = " ".join(tokens[i : i + w_len])
        if difflib.SequenceMatcher(None, window, p_joined).ratio() >= threshold:
            return True

    return False


def classify_document(text: str) -> Tuple[str, float]:
    """Classify OCR text into doc_type enum [land_deed, trust_cert, faculty_list, fire_noc] or 'unknown'.

    Returns:
        (doc_type, score) where score is in 0..1.
    """
    if not text or not text.strip():
        return ("unknown", 0.0)

    clean_text = text.lower()
    scores: Dict[str, float] = {}

    for doc_type, keywords in DOC_KEYWORDS.items():
        score = 0.0
        max_possible = sum(keywords.values())
        for phrase, weight in keywords.items():
            if _fuzzy_contains_phrase(clean_text, phrase):
                score += weight
        scores[doc_type] = score / max_possible if max_possible > 0 else 0.0

    best_type = max(scores, key=scores.get)
    best_score = scores[best_type]

    # Threshold for confident classification
    if best_score < 0.12:
        return ("unknown", round(best_score, 3))

    return (best_type, round(min(1.0, best_score), 3))
