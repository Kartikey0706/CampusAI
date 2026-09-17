# CampusAI Priority Detection Service


import re


URGENCY_PRIORITY = {
    "High": "High",
    "Medium": "Medium",
    "Low": "Low",
    "Critical": "High",
}


def calculate_priority(urgency: str, text: str = "") -> str:
    """
    Convert complaint urgency into a review priority label.

    High   -> High
    Medium -> Medium
    Low    -> Low
    """

    if urgency in {"High", "Critical"}:
        return "High"
    if urgency == "Medium":
        return "Medium"
    if re.search(r"\b(?:\d+\s+hours?|several hours?|since morning|since yesterday)\b", text.lower()):
        return "Medium"
    return "Low"