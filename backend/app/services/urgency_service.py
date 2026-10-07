# CampusAI Urgency Detection Service

HIGH_SIGNALS = [
    "urgent",
    "emergency",
    "immediately",
    "critical",
    "danger",
    "unsafe",
    "not safe",
    "serious",
    "severe",
    "no electricity",
    "power outage",
    "fire",
    "security issue",
    "medical",
    "insect",
    "contaminated",
    "poison",
    "vomit",
    "vomiting",
    "severe illness",
    "tabiyat kharab",
    "became sick",
    "became ill",
    "seriously ill",
    "exposed wire",
    "wire exposed",
    "khatarnak",
    "kharnak",
    "insac",
    "insakt",
]

MEDIUM_SIGNALS = [
    "for hours",
    "3 hours",
    "ghante",
    "4 hours",
    "since morning",
    "since yesterday",
    "repeated",
    "again and again",
    "bad smell",
    "smell",
    "badbu",
    "stale",
    "spoiled",
    "kharab",
    "gadbad",
    "gadbadi",
    "badbu",
    "quality",
    "pareshan",
    "frustrated",
    "fed up",
]


def predict_urgency(text: str) -> str:
    """
    Estimate complaint urgency using important
    impact-related keywords.
    """

    if not text or not text.strip():
        return "Low"

    text = text.lower()

    if any(keyword in text for keyword in HIGH_SIGNALS):
        return "High"

    if any(keyword in text for keyword in MEDIUM_SIGNALS):
        return "Medium"

    return "Low"