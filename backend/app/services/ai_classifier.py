import joblib
from pathlib import Path


MODEL_PATH = (
    Path(__file__).resolve().parents[3]
    / "ai"
    / "models"
    / "category_classifier.joblib"
)

model = joblib.load(MODEL_PATH)


def predict_category(text: str) -> str:
    prediction = model.predict([text])[0]
    return prediction