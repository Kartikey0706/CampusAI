"""Loading and (re)building the CampusAI text classifiers.

Design goals:
  * Never break the API. Any failure returns None and callers fall back to the
    rule-based logic that was already in production.
  * Survive scikit-learn version differences. A pickled model is only trusted
    if it loads without a version warning and answers a smoke test. Otherwise
    the model is rebuilt from the CSV dataset in memory, which takes seconds.
  * No new dependencies: only scikit-learn and joblib, already required.
"""

import csv
import logging
import warnings
from pathlib import Path

from app.services.nlp_utils import normalize_text

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[3]
MODELS_DIR = BASE_DIR / "ai" / "models"
DATASET_PATH = BASE_DIR / "ai" / "datasets" / "complaints_v2.csv"

MODEL_FILES = {
    "category": "category_v2.joblib",
    "urgency": "urgency_v2.joblib",
}
LABEL_COLUMNS = {
    "category": "category",
    "urgency": "urgency",
}

_SMOKE_TEXT = "pani nahi aa raha"
_cache: dict = {}


def build_pipeline():
    """Word + character n-gram TF-IDF with logistic regression.

    Character n-grams make the model tolerant of Hinglish spelling variants
    and typos (pani/paani/pnai, wifi/wi-fi, nahi/nhi).
    """
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import FeatureUnion, Pipeline

    features = FeatureUnion([
        ("word", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, min_df=1)),
        ("char", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), sublinear_tf=True, min_df=2)),
    ])
    return Pipeline([
        ("features", features),
        ("clf", LogisticRegression(max_iter=3000, C=8.0, class_weight="balanced")),
    ])


def load_training_rows(label: str, path: Path = DATASET_PATH):
    """Return (normalized_texts, labels) for rows that have a value for label."""
    column = LABEL_COLUMNS[label]
    texts, labels = [], []
    with open(path, newline="", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            text = (row.get("text") or "").strip()
            value = (row.get(column) or "").strip()
            if text and value:
                texts.append(normalize_text(text))
                labels.append(value)
    return texts, labels


def train_model(label: str, path: Path = DATASET_PATH):
    texts, labels = load_training_rows(label, path)
    if len(set(labels)) < 2:
        raise ValueError(f"Not enough classes to train the {label} model")
    model = build_pipeline()
    model.fit(texts, labels)
    return model


def _load_saved_model(label: str):
    import joblib

    path = MODELS_DIR / MODEL_FILES[label]
    if not path.exists():
        return None

    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        model = joblib.load(path)

    if any("version" in str(item.message).lower() for item in caught):
        logger.warning("Saved %s model was built with another scikit-learn version; rebuilding", label)
        return None

    model.predict_proba([normalize_text(_SMOKE_TEXT)])
    return model


def get_model(label: str):
    """Return a fitted classifier for 'category' or 'urgency', or None."""
    if label in _cache:
        return _cache[label]

    model = None
    try:
        model = _load_saved_model(label)
    except Exception:
        logger.warning("Could not load saved %s model", label, exc_info=True)

    if model is None:
        try:
            model = train_model(label)
            logger.info("Built %s model in memory from %s", label, DATASET_PATH.name)
        except Exception:
            logger.warning("Could not build %s model; using rules only", label, exc_info=True)
            model = None

    _cache[label] = model
    return model


def predict_with_confidence(label: str, normalized_text: str):
    """Return (predicted_label, probability) or (None, 0.0) when unavailable."""
    model = get_model(label)
    if model is None or not normalized_text:
        return None, 0.0
    try:
        probabilities = model.predict_proba([normalized_text])[0]
        index = int(probabilities.argmax())
        return str(model.classes_[index]), float(probabilities[index])
    except Exception:
        logger.warning("%s prediction failed", label, exc_info=True)
        return None, 0.0


def reset_cache():
    """Test helper."""
    _cache.clear()
