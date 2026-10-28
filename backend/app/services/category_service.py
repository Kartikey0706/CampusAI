"""Complaint category detection.

Hybrid design:
  1. Rule signals matched on whole words (fast, explainable, handles Hinglish).
  2. A character n-gram ML model that fills the gaps: it is consulted when the
     rules find nothing, or when the rule evidence is weak and the model is
     confident about a different category.
  3. If neither is sure, the complaint stays "Pending Analysis" instead of
     guessing, exactly like before.
"""

import logging

from app.services.ml_models import predict_with_confidence
from app.services.nlp_utils import any_term, find_terms, normalize_text  # noqa: F401  (normalize_text is re-exported)

logger = logging.getLogger(__name__)


# ============================================================
# SIGNALS
# ============================================================
# Terms are normalized words/phrases. A trailing "*" matches any word that
# starts with the stem. "decisive" terms add extra weight (they are specific to
# one category), "weak" terms count for little and never unlock the category
# bonus on their own.

SIGNALS = {
    "Water": {
        "strong": ["water", "pani", "pyaas", "tap", "nal", "water supply", "pipeline", "tank", "water cooler", "geyser", "hot water"],
        "decisive": ["water", "pani", "pyaas", "tap", "nal", "geyser"],
    },
    "Wi-Fi": {
        "strong": ["wifi", "internet", "network", "router", "bandwidth", "connection", "net", "hotspot", "ethernet"],
        "decisive": ["wifi", "internet", "network", "router", "net"],
    },
    "Electricity": {
        "strong": ["electricity", "bijli", "power cut", "power outage", "power", "light", "lights", "voltage", "wire", "short circuit", "socket", "mcb", "fuse", "tube light", "inverter", "generator"],
        "decisive": ["electricity", "bijli", "power", "light", "lights", "voltage", "wire", "short circuit", "socket", "mcb", "fuse"],
    },
    "Mess": {
        "strong": ["mess", "food", "khana", "khane", "meal", "eating", "breakfast", "lunch", "dinner", "canteen", "badbu", "smell", "stale", "spoiled", "insect*", "contaminated", "gadbad", "roti", "chawal", "dal", "sabzi", "chapati", "menu", "kitchen", "paneer", "rice", "thali"],
        "decisive": ["food", "khana", "khane", "meal", "badbu", "stale", "spoiled", "insect*", "contaminated", "gadbad", "roti", "chawal", "dal", "sabzi", "chapati", "thali", "paneer", "rice"],
        "weak": ["quality"],
    },
    "Faculty": {
        "strong": ["professor", "teacher", "faculty", "lecturer", "attendance", "teaching", "hod", "mentor"],
        "decisive": ["teacher", "faculty", "professor", "attendance", "lecturer", "teaching", "hod"],
        "weak": ["sir", "maam", "ma am", "mam", "madam", "lecture", "lectures"],
    },
    "Academic": {
        "strong": ["academic", "assignment", "exam", "exams", "course", "syllabus", "result", "results", "marks", "marksheet", "backlog", "revaluation", "internals", "admit card", "exam form", "assessment", "quiz", "viva"],
        "decisive": ["academic", "assignment", "exam", "exams", "course", "syllabus", "result", "results", "marks", "marksheet", "backlog", "revaluation"],
    },
    "Timetable": {
        "strong": ["timetable", "time table", "schedule", "class schedule", "lecture schedule", "class timing", "lecture timing", "period timing", "clash", "free period", "reschedule*"],
        "decisive": ["timetable", "time table", "class schedule", "lecture schedule", "class timing", "lecture timing", "period timing", "clash"],
    },
    "Hostel": {
        "strong": ["hostel", "room", "kamra", "warden", "room lock", "lock", "fan", "roommate", "mattress", "cupboard", "almirah", "laundry", "curfew", "room allocation"],
        "decisive": [],
    },
    "Classroom": {
        "strong": ["classroom", "class room", "projector", "bench", "benches", "desk", "desks", "whiteboard", "white board", "blackboard", "smart board", "lecture hall", "seminar hall", "auditorium", "podium"],
        "decisive": ["classroom", "class room", "projector", "whiteboard", "blackboard", "smart board", "seminar hall", "lecture hall"],
    },
    "Transport": {
        "strong": ["bus", "buses", "transport", "driver", "route", "shuttle", "bus stop", "conductor", "bus timing"],
        "decisive": ["bus", "buses", "transport", "shuttle", "conductor", "bus stop"],
    },
    "Fees": {
        "strong": ["fee", "fees", "payment", "tuition", "refund", "scholarship", "receipt", "challan", "dues", "transaction"],
        "decisive": ["fee", "fees", "tuition", "refund", "scholarship", "challan"],
    },
    "Library": {
        "strong": ["library", "book", "books", "reading room", "librarian", "journal*"],
        "decisive": ["library", "librarian", "reading room"],
    },
    "Lab": {
        "strong": ["lab", "labs", "laboratory", "practical", "practicals", "equipment", "microscope", "experiment*"],
        "decisive": ["lab", "labs", "laboratory", "microscope"],
    },
    "Security": {
        "strong": ["security", "guard", "guards", "theft", "stolen", "steal*", "thief", "chor", "chori", "cctv", "gate", "intruder*", "outsider*", "trespass*", "unsafe", "not safe", "safety", "suspicious", "night patrol"],
        "decisive": ["theft", "stolen", "steal*", "thief", "chor", "chori", "cctv", "guard", "guards", "intruder*", "outsider*", "trespass*", "security", "unsafe", "suspicious"],
    },
    "Ragging": {
        "strong": ["ragging", "ragged", "harass*", "bully*", "threat*", "dhamki", "eve teasing", "teasing", "abus*", "misbehav*", "torture", "blackmail*", "stalk*", "molest*", "chhed*"],
        "decisive": ["ragging", "ragged", "harass*", "bully*", "molest*", "blackmail*", "stalk*", "eve teasing", "dhamki", "threat*"],
    },
    "Medical": {
        "strong": ["doctor", "ambulance", "medical", "medicine*", "first aid", "dispensary", "health center", "health centre", "infirmary", "nurse", "hospital", "pharmacy", "fever", "bukhar", "injur*", "accident", "faint*", "unconscious", "bleeding", "allergy", "injection", "bimar*", "counsel*", "mental health"],
        "decisive": ["doctor", "ambulance", "medicine*", "first aid", "dispensary", "health center", "health centre", "infirmary", "hospital", "bukhar", "fever", "injur*", "accident", "faint*", "unconscious", "bimar*"],
        "weak": ["sick", "ill", "vomit*", "tabiyat", "pain", "dard"],
    },
    "Sanitation": {
        "strong": ["washroom", "toilet*", "bathroom*", "garbage", "kooda", "kachra", "dustbin*", "drain*", "sewage", "cockroach*", "rats", "rat", "mosquito*", "machhar", "pest*", "sweeper", "housekeeping", "unhygienic", "gandagi", "ganda", "gandi"],
        "decisive": ["garbage", "kooda", "kachra", "dustbin*", "drain*", "sewage", "cockroach*", "mosquito*", "machhar", "pest*", "housekeeping", "sweeper", "gandagi", "unhygienic"],
        "weak": ["dirty", "cleaning", "cleanliness", "hygiene", "hygienic"],
    },
    "Infrastructure": {
        "strong": ["lift", "elevator", "staircase", "stairs", "roof", "ceiling", "crack*", "window", "windows", "door", "doors", "road", "roads", "pothole*", "parking", "wall", "walls", "furniture", "construction", "paint", "ramp", "pillar", "chhat", "seepage", "tapak*"],
        "decisive": ["lift", "elevator", "staircase", "roof", "ceiling", "pothole*", "parking", "furniture", "construction"],
    },
}

# Extra weight when a category matched at least one strong term.
BONUS = {
    "Water": 2, "Wi-Fi": 2, "Electricity": 2, "Mess": 2, "Faculty": 2,
    "Timetable": 2, "Transport": 2, "Security": 2, "Medical": 2,
    "Sanitation": 2, "Ragging": 4,
}

ILLNESS_TERMS = ["sick", "ill", "vomit*", "tabiyat", "nind", "stomach", "food poisoning"]
FOOD_TERMS = ["food", "khana", "khane", "meal", "eating", "ate", "mess", "canteen", "breakfast", "lunch", "dinner"]

_last_tie: list = []

# Rule evidence at or above this score is trusted without asking the model.
STRONG_RULE_SCORE = 4
# A model prediction must reach this probability to override weak rule evidence.
ML_OVERRIDE_PROBABILITY = 0.60
# A model prediction must reach this probability when the rules found nothing.
ML_MIN_PROBABILITY = 0.50


def _all_terms(spec):
    return list(dict.fromkeys(spec.get("strong", []) + spec.get("decisive", [])))


def _score_categories(normalized: str) -> dict:
    scores = {}
    for category, spec in SIGNALS.items():
        strong = find_terms(normalized, _all_terms(spec))
        weak = find_terms(normalized, spec.get("weak", []))
        score = len(strong) + len(weak)
        if strong and category in BONUS:
            score += BONUS[category]
        if any_term(normalized, spec.get("decisive", [])):
            score += 2
        scores[category] = score

    if any_term(normalized, ILLNESS_TERMS) and any_term(normalized, FOOD_TERMS):
        scores["Mess"] += 3
    return scores


def _rule_category(normalized: str):
    """Return (category, score) from the rules, or (None, 0).

    When two categories tie, the tied names are stored in _last_tie so the
    model can break the tie.
    """
    _last_tie.clear()
    scores = _score_categories(normalized)

    # Service-specific signals outrank generic location words like hostel/room.
    contextual = {c: s for c, s in scores.items() if c != "Hostel" and s > 0}
    if contextual:
        highest = max(contextual.values())
        leaders = [c for c, s in contextual.items() if s == highest]
        if len(leaders) > 1:
            _last_tie.extend(leaders)
        if len(leaders) == 1:
            leader = leaders[0]
            if leader == "Infrastructure" and highest < 3 and scores["Hostel"] >= 2:
                return "Hostel", scores["Hostel"]
            return leader, highest

    if scores["Hostel"]:
        return "Hostel", scores["Hostel"]
    return None, 0


def keyword_category(text: str):
    """Rule-only category (kept for backward compatibility)."""
    category, _ = _rule_category(normalize_text(text))
    return category


def category_signals(text: str, category: str) -> list[str]:
    normalized = normalize_text(text)
    spec = SIGNALS.get(category)
    if not spec:
        return []
    return find_terms(normalized, _all_terms(spec) + spec.get("weak", []))


def _rule_confidence(score: int) -> float:
    if score >= 5:
        return 0.95
    if score >= 4:
        return 0.85
    if score >= 3:
        return 0.65
    return 0.5


# ============================================================
# FINAL CATEGORY PREDICTION
# ============================================================

def predict_category_with_confidence(text: str):
    """Return (category, confidence, source). source is rules, model or none."""
    if not text or not text.strip():
        return "Pending Analysis", 0.0, "none"

    normalized = normalize_text(text)
    rule_category, rule_score = _rule_category(normalized)
    tied = list(_last_tie)

    ml_category, ml_probability = predict_with_confidence("category", normalized)
    if ml_category == "Other":
        # "Other" is not an actionable category; keep it as Pending Analysis.
        ml_category, ml_probability = None, 0.0

    if rule_category:
        if rule_score >= STRONG_RULE_SCORE:
            return rule_category, _rule_confidence(rule_score), "rules"
        if ml_category and ml_category != rule_category and ml_probability >= ML_OVERRIDE_PROBABILITY:
            return ml_category, round(ml_probability, 2), "model"
        return rule_category, _rule_confidence(rule_score), "rules"

    if ml_category and ml_probability >= ML_MIN_PROBABILITY:
        return ml_category, round(ml_probability, 2), "model"

    # Rules tied between categories: let the model pick among the tied ones.
    if tied and ml_category in tied and ml_probability >= 0.30:
        return ml_category, round(ml_probability, 2), "model"

    return "Pending Analysis", 0.0, "none"


def predict_category(text: str) -> str:
    return predict_category_with_confidence(text)[0]
