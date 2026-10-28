import re

from app.services.nlp_utils import find_terms, normalize_text

POSITIVE_SIGNALS = {"good", "great", "helpful", "resolved", "working", "thank", "thanks", "accha", "acha"}
NEGATIVE_SIGNALS = {"bad", "broken", "cannot", "cant", "crash", "danger", "delay", "failed", "issue", "problem", "unavailable", "unsafe", "worst", "kharab", "gadbad", "gadbadi", "galat", "wrong", "pareshan", "frustrated", "fed up", "dimag kharab", "bekar", "badbu", "khatarnak", "insac"}

# Extra complaint wording that is clearly negative.
EXTRA_NEGATIVE_TERMS = [
    "not working", "nahi chal*", "band hai", "band ho*", "nahi aa*", "nahi mil*",
    "not available", "no water", "no electricity", "no internet", "slow",
    "late", "dirty", "ganda", "gandi", "gandagi", "stale", "spoiled", "smell",
    "bimar*", "sick", "vomit*", "unhygienic", "overcrowded", "disconnect*",
    "not responding", "not working properly", "rude", "harass*", "ragging",
    "pareshani", "problem", "issue", "damaged", "leak*", "not clean", "tang",
    "poor", "horrible", "terrible", "useless", "unacceptable",
]

# "not working", "nahi chal raha" etc. turn the positive word "working" negative.
_NEGATED_POSITIVE = re.compile(
    r"\b(?:not|no|nahi|nhi|never|na|cannot|cant|can t|isn t|aren t)\b(?:\s+\w+){0,2}?\s+"
    r"(?:working|good|great|helpful|resolved|accha|acha)\b"
    r"|\b(?:working|good|great|helpful|resolved|accha|acha)\s+(?:nahi|nhi|nai)\b"
)


def predict_sentiment(text: str) -> str:
    original = (text or "").lower()
    normalized = normalize_text(text)

    positive = sum(1 for signal in POSITIVE_SIGNALS if signal in original)
    negative = sum(1 for signal in NEGATIVE_SIGNALS if signal in original)

    # A negated positive word ("not working") is a complaint, not praise.
    negated = len(_NEGATED_POSITIVE.findall(normalized))
    if negated:
        positive = max(0, positive - negated)
        negative += negated

    negative += len(find_terms(normalized, EXTRA_NEGATIVE_TERMS))

    if negative > positive:
        return "Negative"
    if positive > negative:
        return "Positive"
    return "Neutral"
