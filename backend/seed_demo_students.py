from pathlib import Path

import openpyxl

from app.auth.password import hash_password
from app.database.mongodb import get_database


BASE_DIR = Path(__file__).resolve().parent
EXCEL_FILE = BASE_DIR / "CampusAI_Demo_Credentials.xlsx"


workbook = openpyxl.load_workbook(
    EXCEL_FILE,
    data_only=True,
)

sheet = workbook["Demo Students"]

db = get_database()

created = 0
skipped = 0


for row in sheet.iter_rows(
    min_row=2,
    values_only=True,
):
    student_no, roll_no, password, role = row

    roll_no = str(roll_no).strip()

    existing = db.users.find_one(
        {"roll_no": roll_no}
    )

    if existing:
        skipped += 1
        continue

    db.users.insert_one(
        {
            "name": f"Student {student_no}",
            "roll_no": roll_no,
            "password": hash_password(
                str(password)
            ),
            "role": role,
        }
    )

    created += 1


print("Demo student seeding complete.")
print("Created:", created)
print("Skipped:", skipped)
print("Total:", created + skipped)