from fastapi import APIRouter, HTTPException

from app.models.user import UserCreate, LoginRequest
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.database.mongodb import get_database


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post("/register")
def register_user(user: UserCreate):
    db = get_database()
    name = user.name.strip()

    if user.role == "student":
        roll_number = (user.roll_number or user.roll_no or "").strip()
        if not roll_number:
            raise HTTPException(status_code=400, detail="Roll number is required")
        if db.users.find_one({"roll_no": roll_number}):
            raise HTTPException(status_code=400, detail="User with this roll number already exists")

        payload = {
            "name": name,
            "roll_no": roll_number,
            "password": hash_password(user.password),
            "role": "student",
        }
        if user.email:
            payload["email"] = user.email.lower()

        result = db.users.insert_one(payload)
        return {
            "message": "User registered successfully",
            "user_id": str(result.inserted_id),
            "name": name,
            "roll_no": roll_number,
            "role": "student",
        }

    raise HTTPException(
        status_code=403,
        detail="Admin account creation is disabled",
    )

@router.post("/login")
def login_user(login: LoginRequest):
    db = get_database()
    identifier = login.identifier
    password = login.password

    user = None
    if login.employee_id:
        employee_id = login.employee_id.strip().upper()
        user = db.users.find_one({"employee_id": employee_id, "role": "admin"})
    elif login.roll_no or login.roll_number:
        selector = login.roll_no or login.roll_number
        user = db.users.find_one({"roll_no": selector.strip()})
    elif login.email:
        user = db.users.find_one({"email": login.email.lower()})

    if not user or not verify_password(password, user.get("password", "")):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    token = create_access_token(
        str(user["_id"]),
        user.get("email") or user.get("roll_no") or user.get("employee_id") or identifier,
        user["role"],
    )

    response_user = {
        "id": str(user["_id"]),
        "name": user["name"],
        "role": user["role"],
    }
    if user.get("roll_no"):
        response_user["roll_no"] = user["roll_no"]
    if user.get("employee_id"):
        response_user["employee_id"] = user["employee_id"]

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": response_user,
    }