# CampusAI Priority Service
#
# Priority answers "how soon should an administrator act?". It is NOT the same
# as urgency (how serious the wording sounds). It combines:
#   * urgency level from the text
#   * safety / health / personal-security risk (always High)
#   * how many people are affected
#   * how long the problem has lasted
#   * how essential the service is (water, power, medical, ...)
#   * how many similar complaints already exist
#
# The result is a 0-100 score, a High/Medium/Low label (unchanged API), and a
# list of plain-language reasons so an admin can see why.

import re

from app.services.nlp_utils import describe_duration, detect_scope, duration_hours, normalize_text
from app.services.urgency_service import find_safety_terms

URGENCY_PRIORITY = {
    "High": "High",
    "Medium": "Medium",
    "Low": "Low",
    "Critical": "High",
}

BASE_SCORE = {"High": 66, "Medium": 38, "Low": 15}
SCOPE_POINTS = {"individual": 0, "group": 6, "block": 12, "campus": 22}

# Services people cannot do without, or where delay carries real risk.
CATEGORY_WEIGHT = {
    "Medical": 14,
    "Ragging": 20,
    "Security": 12,
    "Electricity": 8,
    "Water": 8,
    "Mess": 6,
    "Sanitation": 5,
    "Wi-Fi": 3,
    "Hostel": 3,
    "Transport": 3,
    "Infrastructure": 3,
    "Fees": 3,
    "Academic": 3,
}
# Categories that are High priority by nature, whatever the wording.
ALWAYS_HIGH = {"Ragging"}

# Basic services: an outage should never be treated as a minor issue.
OUTAGE_CATEGORIES = {"Water", "Electricity", "Medical", "Security"}
OUTAGE_FLOOR = 36
_OUTAGE_WORDS = re.compile(
    r"\b(?:nahi|nhi|no|not|band|unavailable|kharab|missing|gone|off|stopped|out)\b"
)

HIGH_CUTOFF = 65
MEDIUM_CUTOFF = 35


def _label(score: int) -> str:
    if score >= HIGH_CUTOFF:
        return "High"
    if score >= MEDIUM_CUTOFF:
        return "Medium"
    return "Low"


def calculate_priority_details(
    urgency: str,
    text: str = "",
    category: str = "",
    similar_count: int = 0,
) -> dict:
    """Full priority breakdown: score, label, reasons, scope, safety flag."""
    normalized = normalize_text(text)
    reasons: list[str] = []

    level = URGENCY_PRIORITY.get(urgency, urgency if urgency in BASE_SCORE else "Low")
    score = BASE_SCORE.get(level, BASE_SCORE["Low"])

    safety_terms = find_safety_terms(normalized)
    safety_flag = bool(safety_terms)
    if safety_flag:
        reasons.append(f"Safety or health risk wording: {', '.join(safety_terms[:3])}")

    if level == "High" and not safety_flag:
        reasons.append("High urgency wording")
    elif level == "Medium":
        reasons.append("Service disruption or quality concern")

    scope, scope_reason = detect_scope(normalized)
    if SCOPE_POINTS[scope]:
        score += SCOPE_POINTS[scope]
        reasons.append(scope_reason)

    hours = duration_hours(normalized)
    if hours is not None:
        if hours >= 72:
            score += 14
        elif hours >= 24:
            score += 10
        elif hours >= 6:
            score += 5
        elif hours >= 2:
            score += 3
        if hours >= 2:
            reasons.append(f"Ongoing for {describe_duration(hours)}")
    elif re.search(r"\b(?:baar baar|bar bar|again and again|repeated\w*|frequent\w*|daily|roz)\b", normalized):
        score += 6
        reasons.append("Problem keeps repeating")

    weight = CATEGORY_WEIGHT.get(category, 0)
    if weight:
        score += weight
        if weight >= 8:
            reasons.append(f"{category} is an essential service")

    outage = category in OUTAGE_CATEGORIES and bool(_OUTAGE_WORDS.search(normalized))
    if outage:
        if score < OUTAGE_FLOOR:
            score = OUTAGE_FLOOR
        long_or_wide = (
            scope == "campus"
            or (scope == "block" and hours is not None and hours >= 6)
            or (hours is not None and hours >= 48)
        )
        if category in {"Water", "Electricity"} and long_or_wide:
            score = max(score, HIGH_CUTOFF)
            reasons.append(f"{category} outage that is widespread or long-running")

    if similar_count:
        extra = min(15, 5 * similar_count)
        score += extra
        reasons.append(f"{similar_count} similar complaint{'s' if similar_count != 1 else ''} already reported")

    if safety_flag:
        score = max(score, HIGH_CUTOFF + 10)
    if category in ALWAYS_HIGH:
        score = max(score, HIGH_CUTOFF + 5)
        reasons.append(f"{category} complaints are always treated as High priority")

    score = max(0, min(100, int(round(score))))
    return {
        "priority": _label(score),
        "priority_score": score,
        "priority_reasons": reasons,
        "affected_scope": scope,
        "safety_flag": safety_flag,
    }


def calculate_priority(urgency: str, text: str = "") -> str:
    """
    Convert complaint urgency (plus context in the text) into a priority label.

    Kept for backward compatibility; new code should use
    calculate_priority_details() to get the score and reasons.
    """
    return calculate_priority_details(urgency, text)["priority"]
