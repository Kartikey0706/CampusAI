from pathlib import Path
import re

try:
    import joblib
except ImportError:
    joblib = None


# ============================================================
# MODEL PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[3]
MODEL_PATH = BASE_DIR / "ai" / "models" / "category_model.joblib"

model = None
if joblib is not None:
    try:
        model = joblib.load(MODEL_PATH)
    except Exception:
        model = None


# ============================================================
# CATEGORY KEYWORDS
# ============================================================

CATEGORY_KEYWORDS = {
    "Wi-Fi": [
        "wifi",
        "wi-fi",
        "internet",
        "network",
        "connection",
        "router",
        "bandwidth",
    ],

    "Water": [
        "water",
        "tap",
        "drinking water",
        "water supply",
        "water leakage",
        "water leak",
    ],

    "Electricity": [
        "electricity",
        "power cut",
        "power outage",
        "light is not working",
        "lights are not working",
        "fan is not working",
        "voltage",
        "electric",
    ],

    "Faculty": [
        "professor",
        "teacher",
        "faculty",
        "lecturer",
        "sir",
        "ma'am",
        "madam",
        "teaching",
        "teacher behavior",
        "faculty behavior",
    ],

    "Timetable": [
        "timetable",
        "time table",
        "schedule",
        "class schedule",
        "lecture schedule",
        "class timing",
        "lecture timing",
        "period timing",
    ],

    "Hostel": [
        "hostel",
        "room",
        "warden",
        "hostel facility",
        "hostel maintenance",
    ],

    "Mess": [
        "mess",
        "food",
        "meal",
        "breakfast",
        "lunch",
        "dinner",
        "canteen",
    ],

    "Library": [
        "library",
        "book",
        "books",
        "reading room",
        "librarian",
    ],

    "Lab": [
        "lab",
        "laboratory",
        "computer lab",
        "practical",
        "equipment",
    ],

    "Transport": [
        "bus",
        "transport",
        "driver",
        "route",
        "college bus",
    ],

    "Fees": [
        "fee",
        "fees",
        "payment",
        "tuition",
        "refund",
        "scholarship",
    ],

    "Classroom": [
        "classroom",
        "class room",
        "bench",
        "desk",
        "projector",
        "board",
        "ac",
        "air conditioner",
    ],
}


# ============================================================
# TEXT NORMALIZATION
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
    text = re.sub(r"\s+", " ", text)
    return text


# ============================================================
# RULE-BASED CATEGORY DETECTION
# ============================================================

def keyword_category(text: str):
    text = normalize_text(text)

    # --------------------------------------------------------
    # Strong rules
    # These are checked before the ML model because
    # they represent clear campus complaint signals.
    # --------------------------------------------------------

    signal_groups = {
        "Water": ["water", "pani", "pyaas", "tap", "nal", "water supply", "pipeline", "tank"],
        "Wi-Fi": ["wifi", "wi fi", "internet", "network", "router", "bandwidth", "connection"],
        "Electricity": ["electricity", "bijli", "power cut", "power outage", "light", "voltage", "wire"],
        "Mess": ["mess", "food", "khana", "khane", "meal", "eating", "sick", "ill", "tabiyat", "vomit", "breakfast", "lunch", "dinner", "canteen", "badbu", "smell", "stale", "spoiled", "insect", "contaminated", "gadb", "quality"],
        "Faculty": ["professor", "teacher", "faculty", "lecturer", "sir", "maam", "madam", "attendance", "lecture"],
        "Academic": ["academic", "assignment", "exam", "course", "syllabus"],
        "Timetable": ["timetable", "time table", "schedule", "class timing", "lecture timing", "period timing"],
        "Hostel": ["hostel", "room", "kamra", "warden", "room lock", "lock kharab", "fan", "security", "unsafe", "safety"],
        "Transport": ["bus", "transport", "driver", "route"],
        "Fees": ["fee", "fees", "payment", "tuition", "refund", "scholarship"],
        "Library": ["library", "book", "reading room", "librarian"],
        "Lab": ["lab", "laboratory", "practical", "equipment"],
    }

    scores = {category: sum(1 for signal in signals if signal in text) for category, signals in signal_groups.items()}
    for category in ("Water", "Wi-Fi", "Electricity", "Mess", "Faculty", "Timetable"):
        if scores[category]:
            scores[category] += 2

    decisive_signals = {
        "Water": ["water", "pani", "pyaas", "tap", "nal"],
        "Wi-Fi": ["wifi", "internet", "network", "router"],
        "Electricity": ["electricity", "bijli", "power", "light", "voltage", "wire"],
        "Mess": ["food", "khana", "khane", "meal", "badbu", "stale", "spoiled", "insect", "contaminated", "gadbad"],
        "Faculty": ["teacher", "faculty", "professor", "attendance"],
        "Academic": ["academic", "assignment", "exam", "course", "syllabus"],
        "Timetable": ["timetable", "schedule", "class timing", "lecture timing"],
    }
    for category, signals in decisive_signals.items():
        if any(signal in text for signal in signals):
            scores[category] += 2

    # Service-specific signals outrank generic location words such as hostel/room.
    contextual_categories = {
        "Water", "Wi-Fi", "Electricity", "Mess", "Faculty", "Academic",
        "Timetable", "Transport", "Fees", "Library", "Lab",
    }
    contextual_scores = {category: scores[category] for category in contextual_categories if scores[category]}
    if contextual_scores:
        highest = max(contextual_scores.values())
        leaders = [category for category, score in contextual_scores.items() if score == highest]
        if len(leaders) == 1 and highest >= 1:
            return leaders[0]

    if scores["Hostel"]:
        return "Hostel"

    return None


def category_signals(text: str, category: str) -> list[str]:
    normalized = normalize_text(text)
    signals = {
        "Water": ["water", "pani", "pyaas", "tap", "nal", "water supply", "pipeline", "tank"],
        "Wi-Fi": ["wifi", "internet", "network", "router", "connection"],
        "Electricity": ["electricity", "bijli", "power", "light", "voltage", "wire"],
        "Mess": ["mess", "food", "khana", "khane", "meal", "eating", "sick", "ill", "tabiyat", "vomit", "badbu", "smell", "stale", "spoiled", "insect", "contaminated", "gadbad", "quality"],
        "Hostel": ["hostel", "room", "kamra", "warden", "lock", "fan", "security", "unsafe", "safety"],
        "Faculty": ["teacher", "faculty", "professor", "attendance", "lecture"],
        "Academic": ["academic", "assignment", "exam", "course", "syllabus"],
        "Timetable": ["timetable", "schedule", "class timing", "lecture timing"],
        "Transport": ["bus", "transport", "driver", "route"],
        "Fees": ["fee", "fees", "payment", "tuition", "refund", "scholarship"],
        "Library": ["library", "book", "reading room", "librarian"],
        "Lab": ["lab", "laboratory", "practical", "equipment"],
    }
    return [signal for signal in signals.get(category, []) if signal in normalized]


# ============================================================
# FINAL CATEGORY PREDICTION
# ============================================================

def predict_category(text: str) -> str:

    if not text or not text.strip():
        return "Pending Analysis"

    text = normalize_text(text)

    # First use deterministic rules
    rule_prediction = keyword_category(text)

    if rule_prediction:
        return rule_prediction

    # The legacy model exposes no probability/confidence API. It may still be
    # consulted for diagnostics, but its unsupported prediction is not shown.
    if model is not None:
        try:
            model.predict([text])
        except Exception:
            pass

    # Do not let an unsupported fallback silently assert a category.
    return "Pending Analysis"