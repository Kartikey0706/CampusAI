"""Shared text helpers for the CampusAI analysis services.

Everything here works on *normalized* text (lowercase, letters/digits/spaces),
so matching is done on whole words instead of raw substrings. That avoids false
hits such as "nal" inside "final" or "room" inside "classroom".
"""

import re
from functools import lru_cache


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:
    text = (text or "").lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"(.)\1{2,}", r"\1\1", text)
    text = re.sub(r"\bpaa+n+i+\b", "pani", text)
    text = re.sub(r"\bpyaa+s+\b", "pyaas", text)
    text = re.sub(r"\bkha+n+a+\b", "khana", text)
    text = re.sub(r"\b(?:paani|panii)\b", "pani", text)
    text = re.sub(r"\b(?:rhaa|rahaaa|rhaa)\b", "raha", text)
    text = re.sub(r"\b(?:nhi|nai)\b", "nahi", text)
    text = re.sub(r"\b(?:khaana|khannaa)\b", "khana", text)
    text = re.sub(r"\b(?:mes)\b", "mess", text)
    text = re.sub(r"\b(?:gadbadi|gadbadhi)\b", "gadbad", text)
    text = re.sub(r"\b(?:insac|insakt|insectt)\b", "insect", text)
    text = re.sub(r"\b(?:kharnak|kharnaak)\b", "khatarnak", text)
    # Additional spelling variants seen in real student messages.
    text = re.sub(r"\bwi ?fi+\b", "wifi", text)
    text = re.sub(r"\b(?:rha)\b", "raha", text)
    text = re.sub(r"\b(?:rhi)\b", "rahi", text)
    text = re.sub(r"\b(?:rhe)\b", "rahe", text)
    text = re.sub(r"\b(?:hostal|hostle|hosel)\b", "hostel", text)
    text = re.sub(r"\bwash room\b", "washroom", text)
    text = re.sub(r"\b(?:bijlee|bijali)\b", "bijli", text)
    text = re.sub(r"\b(?:internt|intrnet|enternet)\b", "internet", text)
    text = re.sub(r"\b(?:profesor|proffesor|prof)\b", "professor", text)
    text = re.sub(r"\b(?:libary|libray)\b", "library", text)
    text = re.sub(r"\b(?:electrcity|electricty|electrisity)\b", "electricity", text)
    text = re.sub(r"\s+", " ", text)
    return text


# ============================================================
# WHOLE-WORD TERM MATCHING
# ============================================================
# A term is a normalized word or phrase. A trailing "*" means "any word that
# starts with this stem" (for example "vomit*" matches vomit and vomiting).

@lru_cache(maxsize=4096)
def _term_pattern(term: str):
    if term.endswith("*"):
        return re.compile(r"\b" + re.escape(term[:-1]) + r"\w*")
    return re.compile(r"\b" + re.escape(term) + r"\b")


def has_term(text: str, term: str) -> bool:
    return _term_pattern(term).search(text) is not None


def find_terms(text: str, terms) -> list[str]:
    """Return the words actually found in text (stems expanded to the real word)."""
    found = []
    for term in terms:
        match = _term_pattern(term).search(text)
        if match and match.group(0) not in found:
            found.append(match.group(0))
    return found


def any_term(text: str, terms) -> bool:
    return any(has_term(text, term) for term in terms)


# ============================================================
# DURATION
# ============================================================

_NUMBER_WORDS = {
    "a": 1, "an": 1, "one": 1, "ek": 1, "two": 2, "do": 2, "couple": 2,
    "three": 3, "teen": 3, "few": 3, "four": 4, "char": 4, "five": 5,
    "paanch": 5, "panch": 5, "six": 6, "seven": 7, "saat": 7, "ten": 10,
    "das": 10,
}
_NUMBER = r"(\d{1,3}|" + "|".join(_NUMBER_WORDS) + r")"

_DURATION_PATTERNS = (
    (re.compile(r"\b" + _NUMBER + r"\s*(?:hours?|hrs?|ghante|ghanta|ghanto)\b"), 1),
    (re.compile(r"\b" + _NUMBER + r"\s*(?:days?|din|dino|raat|raatein|nights?)\b"), 24),
    (re.compile(r"\b" + _NUMBER + r"\s*(?:weeks?|hafte|hafta|haftey)\b"), 24 * 7),
    (re.compile(r"\b" + _NUMBER + r"\s*(?:months?|mahine|mahina)\b"), 24 * 30),
)

_RELATIVE_DURATIONS = (
    (re.compile(r"\b(?:since|from)\s+(?:the\s+)?morning\b|\bsubah se\b"), 8),
    (re.compile(r"\b(?:since|from)\s+(?:last\s+)?night\b|\braat se\b"), 12),
    (re.compile(r"\b(?:since|from)\s+yesterday\b|\bkal se\b|\bkal raat se\b"), 24),
    (re.compile(r"\bparso se\b"), 48),
    (re.compile(r"\b(?:since|from)\s+last\s+week\b|\bpichhle hafte se\b"), 24 * 7),
    (re.compile(r"\bkaafi (?:time|din) se\b|\bbahut din se\b|\blong time\b"), 24 * 3),
)


def _number_value(token: str) -> int:
    return int(token) if token.isdigit() else _NUMBER_WORDS.get(token, 1)


def duration_hours(text: str):
    """Longest duration mentioned in the text, in hours (None when absent)."""
    best = None
    for pattern, factor in _DURATION_PATTERNS:
        for match in pattern.finditer(text):
            hours = _number_value(match.group(1)) * factor
            best = hours if best is None else max(best, hours)
    for pattern, hours in _RELATIVE_DURATIONS:
        if pattern.search(text):
            best = hours if best is None else max(best, hours)
    return best


def describe_duration(hours) -> str:
    if hours is None:
        return ""
    if hours < 24:
        return f"{int(hours)} hours"
    days = round(hours / 24)
    return "about 1 day" if days <= 1 else f"about {days} days"


# ============================================================
# SCOPE (how many people are affected)
# ============================================================

_CAMPUS_TERMS = (
    "whole campus", "entire campus", "all campus", "poore campus", "pure campus",
    "sabhi students", "all students", "every student", "everyone", "sab log",
    "sabhi log", "pure college", "whole college", "entire university",
    "whole university", "all hostels", "sabhi hostel*", "poori university",
)
_BLOCK_TERMS = (
    "block", "floor", "wing", "whole hostel", "poora hostel", "pura hostel",
    "entire hostel", "all rooms", "sabhi rooms", "sab rooms", "hostel wide",
    "whole mess", "all of us", "hum sab", "hum sabhi", "poore hostel",
    "pure hostel", "poore block", "pure block", "sabhi block*", "all blocks",
)
_GROUP_TERMS = (
    "students", "many students", "few students", "kai students", "kaafi students",
    "hum log", "we all", "batch", "my friends", "dost", "classmates",
)
_COUNT_PATTERN = re.compile(
    r"\b(\d{1,4})\s*\+?\s*(?:students?|log|logon|rooms?|bachche|children|ladke|ladkiyan|girls|boys)\b"
)

SCOPE_ORDER = {"individual": 0, "group": 1, "block": 2, "campus": 3}


def detect_scope(text: str):
    """Return (scope, reason) where scope is individual, group, block or campus."""
    scope, reason = "individual", ""

    def raise_to(new_scope, new_reason):
        nonlocal scope, reason
        if SCOPE_ORDER[new_scope] > SCOPE_ORDER[scope]:
            scope, reason = new_scope, new_reason

    count_match = _COUNT_PATTERN.search(text)
    if count_match:
        count = int(count_match.group(1))
        if count >= 50:
            raise_to("campus", f"Affects about {count} people")
        elif count >= 10:
            raise_to("block", f"Affects about {count} people")
        elif count >= 3:
            raise_to("group", f"Affects about {count} people")

    campus_hits = find_terms(text, _CAMPUS_TERMS)
    if campus_hits:
        raise_to("campus", f"Campus-wide impact wording: {campus_hits[0]}")
    block_hits = find_terms(text, _BLOCK_TERMS)
    if block_hits:
        raise_to("block", f"Affects a block, floor or hostel area: {block_hits[0]}")
    group_hits = find_terms(text, _GROUP_TERMS)
    if group_hits:
        raise_to("group", f"Multiple students affected: {group_hits[0]}")
    return scope, reason
