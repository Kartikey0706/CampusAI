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


def _token_similarity(text1: str, text2: str) -> float:
    tokens1 = re.findall(r"[a-z0-9]+", text1.lower())
    tokens2 = re.findall(r"[a-z0-9]+", text2.lower())
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

    for complaint in existing_complaints:

        complaint_id = complaint.get("complaint_id")

        # Do not compare a complaint with itself.
        if (
            current_complaint_id
            and complaint_id == current_complaint_id
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