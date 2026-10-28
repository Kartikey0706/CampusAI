# CampusAI Urgency Detection Service
#
# Rules decide first (they are explainable and cover safety wording that must
# never be missed). The ML model may only *raise* the level when it is
# confident, so it can add nuance but never hide a rule-detected risk.

from app.services.ml_models import predict_with_confidence
from app.services.nlp_utils import any_term, duration_hours, find_terms, normalize_text

LEVELS = {"Low": 0, "Medium": 1, "High": 2}
LEVEL_NAMES = {value: key for key, value in LEVELS.items()}

# Wording that signals danger to health, safety or personal security.
# Any hit forces High urgency and High priority.
SAFETY_TERMS = [
    "danger*", "unsafe", "not safe", "security issue", "fire", "smoke",
    "exposed wire", "open wire", "naked wire", "wire exposed", "sparking",
    "spark*", "short circuit", "shock*", "electrocut*", "gas leak*",
    "explosion", "blast", "snake*", "saanp", "collapse*",
    "poison*", "food poisoning", "contaminated", "insect*", "vomit*",
    "severe illness", "seriously ill", "tabiyat kharab", "became sick",
    "became ill", "fell sick", "fallen sick", "got sick", "faint*",
    "unconscious", "ambulance", "bleeding", "injur*", "accident",
    "heart attack", "seizure", "fever", "bukhar", "bimar*", "medical",
    "ragging", "harass*", "molest*", "assault*", "threat*", "dhamki",
    "blackmail*", "stalk*", "eve teasing", "suicid*", "self harm",
    "beaten", "marpeet", "violence", "weapon*", "knife",
    "khatarnak",
    "felt sick", "feel sick", "feeling sick", "feeling unwell", "unwell",
    "keeda", "keede", "kide", "worm*", "rash driving", "tez chalata",
    "overspeed*", "dar lagta", "ghutan", "suffocat*", "saans",
    "koi bhi andar", "anyone can enter", "guard nahi", "no guard",
    "without guard", "phans*", "trapped",
]

# Service-level wording that was already treated as High before.
HIGH_SERVICE_TERMS = ["no electricity", "power outage"]

# The student explicitly says it is urgent.
DECLARED_URGENCY_TERMS = [
    "urgent*", "emergenc*", "immediate*", "critical*", "serious*", "severe*",
]

MEDIUM_TERMS = [
    "for hours", "hours", "ghante", "ghanta", "ghanto",
    "since morning", "since yesterday", "repeated*", "again and again",
    "baar baar", "bar bar", "frequent*", "daily", "everyday", "roz",
    "regularly", "bad smell", "smell", "badbu", "stale", "spoiled",
    "kharab", "gadbad", "quality", "pareshan*", "frustrat*", "fed up",
    "leak*", "overcrowd*", "deducted", "not refunded", "double payment",
    "stolen", "chori", "theft",
    "choke*", "overflow*", "bhar gaya", "flooded", "waterlogg*",
    "gaddhe", "gadda", "khatmal", "bedbug*", "bed bug*", "rok diya",
]

DEADLINE_TERMS = ["exam", "exams", "viva", "submission", "deadline", "interview", "placement"]
# A hard deadline that is about to pass while the student is blocked.
HARD_DEADLINE_TERMS = ["last date", "last day", "deadline", "submission date", "due date"]
TIME_PRESSURE_TERMS = ["tomorrow", "today", "kal", "aaj", "tonight"]

MIN_MEDIUM_DURATION_HOURS = 2

# Model confidence needed to raise the rule-based level.
ML_ESCALATE_PROBABILITY = 0.65
ML_STRONG_PROBABILITY = 0.85


def find_safety_terms(normalized: str) -> list[str]:
    return find_terms(normalized, SAFETY_TERMS)


def _rule_urgency(normalized: str):
    """Return (level, evidence) from the rule signals."""
    safety = find_safety_terms(normalized)
    if safety:
        return "High", safety[:3]

    declared = find_terms(normalized, DECLARED_URGENCY_TERMS)
    if declared:
        return "High", declared[:2]

    service = find_terms(normalized, HIGH_SERVICE_TERMS)
    if service:
        return "High", service[:2]

    if any_term(normalized, HARD_DEADLINE_TERMS) and any_term(normalized, TIME_PRESSURE_TERMS):
        return "High", ["deadline is about to pass"]

    medium = find_terms(normalized, MEDIUM_TERMS)
    if medium:
        return "Medium", medium[:3]

    hours = duration_hours(normalized)
    if hours is not None and hours >= MIN_MEDIUM_DURATION_HOURS:
        return "Medium", [f"{int(hours)} hours"]

    if any_term(normalized, DEADLINE_TERMS) and any_term(normalized, TIME_PRESSURE_TERMS):
        return "Medium", ["deadline pressure"]

    return "Low", []


def assess_urgency(text: str) -> dict:
    """Urgency with the evidence behind it."""
    if not text or not text.strip():
        return {"urgency": "Low", "source": "none", "evidence": []}

    normalized = normalize_text(text)
    level, evidence = _rule_urgency(normalized)
    source = "rules"

    ml_label, ml_probability = predict_with_confidence("urgency", normalized)
    if ml_label in LEVELS and LEVELS[ml_label] > LEVELS[level] and ml_probability >= ML_ESCALATE_PROBABILITY:
        gap = LEVELS[ml_label] - LEVELS[level]
        if gap == 1 or ml_probability >= ML_STRONG_PROBABILITY:
            level, source = ml_label, "model"
        else:
            level, source = LEVEL_NAMES[LEVELS[level] + 1], "model"

    return {"urgency": level, "source": source, "evidence": evidence}


def predict_urgency(text: str) -> str:
    """
    Estimate complaint urgency using impact-related wording, duration, and a
    model that can raise (never lower) the rule-based level.
    """
    return assess_urgency(text)["urgency"]
