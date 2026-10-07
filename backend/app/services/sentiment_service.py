POSITIVE_SIGNALS = {"good", "great", "helpful", "resolved", "working", "thank", "thanks", "accha", "acha"}
NEGATIVE_SIGNALS = {"bad", "broken", "cannot", "cant", "crash", "danger", "delay", "failed", "issue", "problem", "unavailable", "unsafe", "worst", "kharab", "gadbad", "gadbadi", "galat", "wrong", "pareshan", "frustrated", "fed up", "dimag kharab", "bekar", "badbu", "khatarnak", "insac"}


def predict_sentiment(text: str) -> str:
    normalized = (text or "").lower()
    positive = sum(1 for signal in POSITIVE_SIGNALS if signal in normalized)
    negative = sum(1 for signal in NEGATIVE_SIGNALS if signal in normalized)
    if negative > positive:
        return "Negative"
    if positive > negative:
        return "Positive"
    return "Neutral"