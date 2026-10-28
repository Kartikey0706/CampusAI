import logging

from app.services.category_service import category_signals, predict_category_with_confidence
from app.services.department_service import get_department
from app.services.priority_service import calculate_priority_details
from app.services.sentiment_service import predict_sentiment
from app.services.urgency_service import assess_urgency

logger = logging.getLogger(__name__)

def _analysis_reasons(text: str, category: str, urgency: str, sentiment: str) -> list[str]:
    reasons = []
    signals = category_signals(text, category)
    if signals:
        reasons.append(f"{category} signals detected: {', '.join(signals[:4])}")
    if urgency == "High":
        reasons.append("High-severity safety or health wording detected")
    elif urgency == "Medium":
        reasons.append("Service disruption, duration, or quality concern detected")
    if sentiment == "Negative":
        reasons.append("Negative complaint wording detected")
    return reasons


def analyze_complaint(text: str) -> dict:
    category, confidence, source = predict_category_with_confidence(text)
    urgency = assess_urgency(text)["urgency"]
    department = "Pending" if category == "Pending Analysis" else get_department(category)
    sentiment = predict_sentiment(text)
    reasons = _analysis_reasons(text, category, urgency, sentiment) if category != "Pending Analysis" else ["No high-confidence category signals detected"]
    priority = calculate_priority_details(urgency, text, category)

    return {
        "category": category or "Other",
        "sentiment": sentiment,
        "urgency": urgency,
        "department": department,
        "priority": priority["priority"],
        "reasons": reasons,
        "category_confidence": confidence,
        "category_source": source,
        "priority_score": priority["priority_score"],
        "priority_reasons": priority["priority_reasons"],
        "affected_scope": priority["affected_scope"],
        "safety_flag": priority["safety_flag"],
    }


def safe_analyze_complaint(text: str) -> dict:
    defaults = {
        "category": "Pending Analysis",
        "sentiment": "Pending",
        "urgency": "Pending",
        "department": "Pending",
        "priority": "Pending",
        "reasons": [],
    }

    try:
        result = analyze_complaint(text)
        defaults.update(result)
    except Exception:
        logger.exception("Complaint analysis failed")

    return defaults
