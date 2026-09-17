import pandas as pd
import joblib

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_PATH = BASE_DIR / "ai" / "datasets" / "complaints_category.csv"
MODEL_DIR = BASE_DIR / "ai" / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# LOAD ORIGINAL DATASET
# ============================================================

df = pd.read_csv(DATA_PATH)

df = df[["text", "category"]].dropna()

print("\n===================================")
print("CampusAI Category Model Training")
print("===================================")
print(f"Original dataset: {len(df)}")


# ============================================================
# CAMPUS-SPECIFIC TRAINING EXAMPLES
# These strengthen important category keywords.
# ============================================================

extra_data = {

    "Wi-Fi": [
        "Wi-Fi is not working in the hostel",
        "Hostel Wi-Fi is very slow",
        "Campus Wi-Fi keeps disconnecting",
        "Unable to connect to Wi-Fi",
        "Internet connection is not working",
        "University Wi-Fi has no internet",
        "Wi-Fi signal is weak in my room",
        "Hostel internet keeps dropping",
        "Campus network is unavailable",
        "Wi-Fi problem in academic block",
        "Internet speed is extremely slow",
        "Cannot access online classes because of Wi-Fi",
        "Student Wi-Fi is not connecting",
        "Wi-Fi authentication is failing",
        "Network connection keeps disconnecting",
    ],

    "Water": [
        "There is no water supply in the hostel",
        "Hostel water supply is not working",
        "No drinking water is available",
        "Water tap is not working",
        "There is a water shortage in the hostel",
        "Water supply has stopped",
        "Washroom has no water",
        "Water leakage is happening",
        "Water problem in academic block",
        "Hostel bathrooms have no water",
        "Drinking water facility is not working",
        "Water tank is empty",
        "No water in hostel block",
        "Water pipeline is leaking",
        "Students are facing water supply problems",
    ],

    "Electricity": [
        "There is no electricity in the hostel",
        "Power outage in hostel block",
        "Electricity keeps going off",
        "Lights are not working",
        "Fan is not working because of power issue",
        "Power supply is interrupted",
        "Frequent electricity cuts are happening",
        "Electricity problem in classroom",
        "Hostel power supply is down",
        "Electrical connection is not working",
        "The classroom has no power",
        "Power failure in the academic block",
        "Electricity is unavailable",
        "Lights and fans are not working",
        "There is a power outage on campus",
    ],

    "Hostel": [
        "There is a problem with my hostel room",
        "Hostel room maintenance is required",
        "My hostel room has a maintenance issue",
        "Hostel accommodation problem",
        "Room allocation problem in hostel",
        "Hostel facilities are not proper",
        "There is an issue with my hostel block",
        "Hostel room needs repair",
        "Hostel cleanliness problem",
        "Hostel security issue",
        "Problem with hostel accommodation",
        "Hostel room is not maintained",
        "Complaint about hostel facilities",
        "Hostel management issue",
        "There is a problem in my hostel",
    ],

    "Classroom": [
        "The classroom is not properly maintained",
        "Classroom projector is not working",
        "Classroom fan is not working",
        "Classroom lights are not working",
        "The classroom is dirty",
        "There is a seating problem in the classroom",
        "Classroom equipment is damaged",
        "The classroom AC is not working",
        "There is a problem with classroom facilities",
        "Classroom benches are damaged",
        "The classroom needs maintenance",
        "Classroom infrastructure is poor",
        "The projector in class is broken",
        "Classroom cleanliness is a problem",
        "There is no proper seating in the classroom",
    ],

    "Faculty": [
        "I have an issue with a faculty member",
        "Faculty member is not available",
        "Teacher is not taking classes properly",
        "I have a complaint about my professor",
        "Faculty behavior is concerning",
        "Professor is not responding to students",
        "Teacher related complaint",
        "Faculty member is frequently absent",
        "I need help regarding a faculty issue",
        "Professor is not explaining the topic",
        "Faculty communication problem",
        "Complaint regarding teaching staff",
        "Teacher is not available during office hours",
        "Faculty related issue",
        "I want to report a problem with a teacher",
    ],

    "Timetable": [
        "My class timetable has a problem",
        "The timetable is incorrect",
        "Two classes are scheduled at the same time",
        "There is a timetable clash",
        "Class schedule is wrong",
        "My timetable has not been updated",
        "Lecture timing is incorrect",
        "The class schedule needs correction",
        "Timetable shows the wrong classroom",
        "There is a clash between lectures",
        "My classes are missing from the timetable",
        "The timetable has duplicate classes",
        "Exam timetable is incorrect",
        "Class timing needs to be changed",
        "Timetable information is not updated",
    ],

    "Fees": [
        "I have an issue with my university fees",
        "Fee payment is not showing",
        "My fee receipt is missing",
        "There is a problem with fee payment",
        "Tuition fee information is incorrect",
        "I cannot pay my semester fees",
        "Fee status has not been updated",
        "My payment was deducted but fees are not updated",
        "I have a complaint about fees",
        "Fee deadline information is unclear",
        "My fee transaction failed",
        "Scholarship fee adjustment is incorrect",
        "There is an error in my fee account",
        "Fee payment portal is not working",
        "I need help regarding semester fees",
    ],

    "Transport": [
        "The campus bus is not arriving",
        "University bus timing is incorrect",
        "There is a problem with campus transport",
        "Bus service is delayed",
        "Campus bus is overcrowded",
        "Transport route needs correction",
        "University bus is not available",
        "Bus driver related complaint",
        "Transport schedule is not updated",
        "Campus shuttle is not working",
        "Bus stop information is incorrect",
        "Transport service is unreliable",
        "There is a problem with the university bus",
        "Bus route has changed without notice",
        "Students are facing transport problems",
    ],

    "Mess": [
        "The hostel mess food quality is poor",
        "Mess food is not good",
        "There is a problem with mess food",
        "Mess is not maintaining cleanliness",
        "Food served in the mess is cold",
        "Mess menu is not being followed",
        "There is a hygiene problem in the mess",
        "Mess food is often late",
        "Complaint about hostel mess",
        "Mess utensils are not clean",
        "Food quality in mess needs improvement",
        "Mess management is not responding",
        "There is insufficient food in the mess",
        "Mess timing is inconvenient",
        "Students are unhappy with mess facilities",
    ],

    "Library": [
        "Library books are not available",
        "There is a problem with the library",
        "Library timing needs to be changed",
        "Library is not open on time",
        "I cannot issue a library book",
        "Library computer is not working",
        "Book return information is incorrect",
        "Library seating is insufficient",
        "Library facilities need improvement",
        "There is a problem with library access",
        "Library book is missing",
        "Library staff is not responding",
        "The library is overcrowded",
        "Library database is not working",
        "Complaint about library services",
    ],

    "Lab": [
        "Computer lab computers are not working",
        "There is a problem in the computer lab",
        "Lab equipment is damaged",
        "Laboratory system is not working",
        "Lab computers are very slow",
        "The practical lab equipment is unavailable",
        "Lab projector is not working",
        "There is no proper equipment in the lab",
        "Computer lab needs maintenance",
        "Lab internet is not working",
        "Software is missing from the lab computer",
        "Lab machines are not functioning",
        "Laboratory facilities are poor",
        "Practical equipment is damaged",
        "There is a problem with the college lab",
    ],

    "Other": [
        "I have a general campus complaint",
        "I want to report an issue not listed here",
        "There is another problem on campus",
        "I need help with a general university issue",
        "This complaint does not fit any category",
        "I have a miscellaneous campus problem",
        "There is an issue with a campus service",
        "I want to report another issue",
        "General complaint regarding campus",
        "I am facing an unexpected campus problem",
        "There is a problem that needs administration attention",
        "I need administrative assistance",
        "General student complaint",
        "Uncategorized campus issue",
        "I have a different complaint",
    ],
}


# ============================================================
# ADD EXTRA DATA
# ============================================================

extra_rows = []

for category, texts in extra_data.items():
    for text in texts:
        extra_rows.append({
            "text": text,
            "category": category
        })

extra_df = pd.DataFrame(extra_rows)

df = pd.concat([df, extra_df], ignore_index=True)

# Remove exact duplicates
df = df.drop_duplicates(subset=["text", "category"])

print(f"Final dataset   : {len(df)}")
print("\nCategory counts:")
print(df["category"].value_counts().sort_index())


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X = df["text"]
y = df["category"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ============================================================
# TF-IDF + LOGISTIC REGRESSION
# ============================================================

model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            sublinear_tf=True,
            min_df=1
        )
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=2000,
            class_weight="balanced"
        )
    )
])


# ============================================================
# TRAIN
# ============================================================

model.fit(X_train, y_train)


# ============================================================
# EVALUATE
# ============================================================

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\n===================================")
print("MODEL RESULTS")
print("===================================")
print(f"Training data: {len(X_train)}")
print(f"Testing data : {len(X_test)}")
print(f"Accuracy     : {accuracy:.2%}")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

model_path = MODEL_DIR / "category_model.joblib"

joblib.dump(model, model_path)

print("===================================")
print(f"Model saved:")
print(model_path)
print("===================================\n")