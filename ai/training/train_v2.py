"""Train the CampusAI category and urgency models and evaluate them.

Run from the repository root:
    python ai/training/build_dataset.py     (only if you changed the seeds)
    python ai/training/train_v2.py

What it does:
  * trains on ai/datasets/complaints_v2.csv
  * reports accuracy on ai/datasets/dev_set.csv, a hand-written set that is never
    used for training, for the ML model alone and for the full pipeline
    (rules + model), which is what the app actually runs
  * saves ai/models/category_v2.joblib and ai/models/urgency_v2.joblib

The saved files are optional: if they cannot be loaded on the server (for
example a different scikit-learn version), the backend rebuilds the models from
the CSV in memory.
"""

import csv
import sys
from collections import Counter
from pathlib import Path

import joblib

BASE_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.services import ml_models  # noqa: E402
from app.services.analysis_service import analyze_complaint  # noqa: E402
from app.services.nlp_utils import normalize_text  # noqa: E402

DEV_PATH = BASE_DIR / "ai" / "datasets" / "dev_set.csv"


def read_dev():
    with open(DEV_PATH, newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def accuracy(pairs):
    pairs = list(pairs)
    return sum(1 for a, b in pairs if a == b) / max(1, len(pairs))


def main():
    dev = read_dev()
    train_texts = {r["text"].strip().lower() for r in csv.DictReader(open(ml_models.DATASET_PATH, encoding="utf-8-sig"))}
    overlap = [r["text"] for r in dev if r["text"].strip().lower() in train_texts]
    print(f"dev set: {len(dev)} rows, overlap with training data: {len(overlap)}")

    for label in ("category", "urgency"):
        texts, labels = ml_models.load_training_rows(label)
        print(f"\n[{label}] training rows: {len(texts)}  classes: {len(set(labels))}")
        model = ml_models.train_model(label)
        joblib.dump(model, ml_models.MODELS_DIR / ml_models.MODEL_FILES[label])
        ml_models.reset_cache()

        gold = [r[label] for r in dev]
        predicted = model.predict([normalize_text(r["text"]) for r in dev])
        print(f"[{label}] ML model alone on dev set: {accuracy(zip(gold, predicted)):.1%}")

    results = [(r, analyze_complaint(r["text"])) for r in dev]
    cat = accuracy((r["category"], a["category"]) for r, a in results)
    urg = accuracy((r["urgency"], a["urgency"]) for r, a in results)
    pri = accuracy((r["priority"], a["priority"]) for r, a in results if r.get("priority"))
    print("\nFull pipeline (rules + model) on dev set")
    print(f"  category accuracy: {cat:.1%}")
    print(f"  urgency accuracy : {urg:.1%}")
    print(f"  priority accuracy: {pri:.1%}")

    wrong = Counter()
    for r, a in results:
        if r["category"] != a["category"]:
            wrong[(r["category"], a["category"])] += 1
    if wrong:
        print("\nMost common category mistakes (expected -> predicted):")
        for (expected, got), count in wrong.most_common(8):
            print(f"  {expected} -> {got}: {count}")


if __name__ == "__main__":
    main()
