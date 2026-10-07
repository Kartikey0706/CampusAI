# Department mapping for CampusAI complaints

CATEGORY_DEPARTMENT = {
    "Wi-Fi": "IT / Network Department",
    "Water": "Maintenance Department",
    "Electricity": "Electrical / Maintenance Department",
    "Hostel": "Hostel Administration",
    "Classroom": "Maintenance Department",
    "Faculty": "Academic Administration",
    "Academic": "Academic Administration",
    "Timetable": "Academic Administration",
    "Fees": "Accounts / Finance Department",
    "Transport": "Transport Department",
    "Mess": "Mess / Catering Department",
    "Library": "Library Administration",
    "Lab": "Lab / Technical Department",
    "Other": "General Administration",
}


def get_department(category: str) -> str:
    return CATEGORY_DEPARTMENT.get(
        category,
        "General Administration"
    )