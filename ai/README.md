# CampusAI analysis pipeline

Every new complaint goes through `backend/app/services/analysis_service.py`:

| Step | File | How it works |
|---|---|---|
| Category | `category_service.py` | Whole-word rule signals first; a character n-gram ML model fills the gaps. Unsure results stay `Pending Analysis`. |
| Urgency | `urgency_service.py` | Rules (safety, health, security wording, duration). The model may only raise the level, never lower a rule-detected risk. |
| Priority | `priority_service.py` | 0-100 score from urgency, safety risk, people affected, how long it has lasted, how essential the service is, and how many similar complaints exist. Returns High / Medium / Low plus plain-language reasons. |
| Sentiment | `sentiment_service.py` | Keyword based, understands "not working". |
| Similar complaints | `similarity_service.py` | Stopword and synonym aware, only compares complaints of the same category. |

The backend never depends on the saved model files. If `ai/models/*_v2.joblib` cannot be loaded (for example a different scikit-learn version on the server), the models are rebuilt from `ai/datasets/complaints_v2.csv` in a few seconds, and if that also fails the rules still work.

## Retraining

```
python ai/training/build_dataset.py   # only after editing the seed examples
python ai/training/train_v2.py        # trains, saves models, prints accuracy on dev_set.csv
```

`ai/datasets/dev_set.csv` is a hand-written evaluation set that is never used for training.
To improve the model, add real student complaints (with the correct category and urgency) to
`complaints_v2.csv` and retrain. Real complaints matter more than anything else.
