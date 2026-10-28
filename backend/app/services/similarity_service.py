# CampusAI Similar Complaint Detection Service

import math
import re
from collections import Counter

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

try:
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    cosine_similarity = None


# ============================================================
# EMBEDDING MODEL
# ============================================================

MODEL_NAME = "all-MiniLM-L6-v2"

model = None


def _get_model():
    global model

    if model is None and SentenceTransformer is not None:
        try:
            model = SentenceTransformer(MODEL_NAME)
        except Exception:
            model = False

    return model if model is not False else None


# ============================================================
# TEXT EMBEDDING
# ============================================================

def create_embedding(text: str):
    """
    Convert complaint text into a numerical embedding.
    """

    if not text or not text.strip():
        return None

    embedding_model = _get_model()
    if embedding_model is None:
        return None

    embedding = embedding_model.encode(
        text,
        convert_to_numpy=True
    )

    return embedding


# ============================================================
# SIMILARITY CALCULATION
# ============================================================

def calculate_similarity(text1: str, text2: str) -> float:
    """
    Calculate semantic similarity between two complaints.

    Returns a value between 0 and 1.
    """

    if not text1 or not text2:
        return 0.0

    embedding1 = create_embedding(text1)
    embedding2 = create_embedding(text2)

    if embedding1 is None or embedding2 is None or cosine_similarity is None:
        return _token_similarity(text1, text2)

    similarity = cosine_similarity(
        [embedding1],
        [embedding2]
    )[0][0]

    return round(float(similarity), 4)


# Words that appear in almost every complaint and say nothing about the issue.
_STOPWORDS = {
    "is", "are", "was", "were", "am", "the", "a", "an", "of", "in", "on", "at", "to", "for",
    "and", "or", "my", "our", "we", "i", "it", "this", "that", "there", "here", "with", "has",
    "have", "had", "be", "been", "not", "no", "nahi", "hai", "hain", "ho", "raha", "rahi",
    "rahe", "me", "mein", "ka", "ki", "ke", "se", "ko", "par", "pe", "bhi", "aur", "yeh",
    "ye", "wo", "woh", "kuch", "bahut", "very", "please", "kindly", "since", "from", "ho",
    "hota", "hoti", "hote", "gaya", "gayi", "kar", "karo", "kr", "rha", "rhi", "hostel",
    "campus", "college", "working", "work", "problem", "issue", "block",
}

# Different words that mean the same thing, mapped to one token.
_SYNONYMS = {
    "net": "internet", "wifi": "internet", "network": "internet", "wi": "internet",
    "fi": "internet", "connection": "internet",
    "paani": "pani", "water": "pani", "tap": "pani", "nal": "pani",
    "bijli": "electricity", "power": "electricity", "light": "electricity",
    "lights": "electricity", "current": "electricity",
    "khana": "food", "khane": "food", "meal": "food", "mess": "food",
    "kharab": "broken", "damaged": "broken", "faulty": "broken",
    "band": "down", "stopped": "down", "off": "down",
}


def _content_tokens(text: str) -> list[str]:
    from app.services.nlp_utils import normalize_text

    tokens = re.findall(r"[a-z0-9]+", normalize_text(text))
    cleaned = []
    for token in tokens:
        token = _SYNONYMS.get(token, token)
        if token in _STOPWORDS or len(token) < 2:
            continue
        cleaned.append(token)
    return cleaned


def _token_similarity(text1: str, text2: str) -> float:
    tokens1 = _content_tokens(text1)
    tokens2 = _content_tokens(text2)
    if not tokens1 or not tokens2:
        return 0.0

    counts1 = Counter(tokens1)
    counts2 = Counter(tokens2)
    dot_product = sum(counts1[token] * counts2[token] for token in counts1)
    magnitude = math.sqrt(sum(value * value for value in counts1.values())) * math.sqrt(
        sum(value * value for value in counts2.values())
    )
    return round(dot_product / magnitude, 4) if magnitude else 0.0


# ============================================================
# SIMILARITY CHECK
# ============================================================

def is_similar(
    text1: str,
    text2: str,
    threshold: float = 0.50
) -> bool:
    """
    Determine whether two complaints are semantically similar.
    """

    similarity = calculate_similarity(
        text1,
        text2
    )

    return similarity >= threshold


# ============================================================
# FIND SIMILAR COMPLAINTS
# ============================================================

def find_similar_complaints(
    db,
    complaint_text: str,
    current_complaint_id: str = None,
    threshold: float = 0.50,
    limit: int = 5,
):
    """
    Search existing complaints in MongoDB and return
    complaints that are semantically similar.

    Parameters:
        db:
            MongoDB database instance.

        complaint_text:
            Title + description of the new complaint.

        current_complaint_id:
            ID of the current complaint so it is not
            compared with itself.

        threshold:
            Minimum similarity score.

        limit:
            Maximum number of similar complaints returned.
    """

    if not complaint_text or not complaint_text.strip():
        return []

    existing_complaints = list(
        db["complaints"].find(
            {},
            {
                "_id": 0,
                "complaint_id": 1,
                "title": 1,
                "description": 1,
                "category": 1,
                "department": 1,
                "urgency": 1,
                "priority": 1,
                "status": 1,
                "created_at": 1,
            },
        )
    )

    similar_complaints = []

    # Complaints about different kinds of problems are not duplicates, even if
    # they share common words ("not working in the hostel").
    try:
        from app.services.category_service import predict_category

        new_category = predict_category(complaint_text)
    except Exception:
        new_category = "Pending Analysis"

    for complaint in existing_complaints:

        complaint_id = complaint.get("complaint_id")

        # Do not compare a complaint with itself.
        if (
            current_complaint_id
            and complaint_id == current_complaint_id
        ):
            continue

        existing_category = complaint.get("category")
        if (
            new_category not in (None, "", "Pending Analysis", "Other")
            and existing_category not in (None, "", "Pending Analysis", "Other")
            and existing_category != new_category
        ):
            continue

        existing_text = (
            f"{complaint.get('title', '')}. "
            f"{complaint.get('description', '')}"
        ).strip()

        if not existing_text:
            continue

        score = calculate_similarity(
            complaint_text,
            existing_text
        )

        if score >= threshold:

            similar_complaints.append(
                {
                    "complaint_id": complaint_id,
                    "title": complaint.get("title"),
                    "description": complaint.get("description"),
                    "category": complaint.get("category"),
                    "department": complaint.get("department"),
                    "urgency": complaint.get("urgency"),
                    "priority": complaint.get("priority"),
                    "status": complaint.get("status"),
                    "similarity_score": score,
                    "similarity_percentage": round(
                        score * 100,
                        2
                    ),
                }
            )

    # Highest similarity first.
    similar_complaints.sort(
        key=lambda item: item["similarity_score"],
        reverse=True,
    )

    return similar_complaints[:limit]