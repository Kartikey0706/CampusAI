from fastapi import APIRouter, Depends
from app.auth.jwt import get_current_user, require_role

router = APIRouter(prefix="/api", tags=["Protected"])

@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {"user": current_user}

@router.get("/student/ping")
def student_ping(current_user=Depends(require_role("student"))):
    return {"message": "Student access verified", "user_id": current_user["user_id"]}

@router.get("/admin/ping")
def admin_ping(current_user=Depends(require_role("admin"))):
    return {"message": "Admin access verified", "user_id": current_user["user_id"]}
