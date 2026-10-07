import logging
from datetime import datetime, timezone
from uuid import uuid4
from zoneinfo import ZoneInfo

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder
from pymongo import ReturnDocument

from app.auth.jwt import get_current_user, require_role
from app.database.mongodb import get_database
from app.models.complaint import ComplaintCreate, ComplaintStatusUpdate
from app.services.analysis_service import safe_analyze_complaint
from app.services.similarity_service import find_similar_complaints

logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/complaints",
    tags=["Complaints"],
)


def _serialize_datetime(value):
    if not isinstance(value, datetime):
        return value

    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    else:
        value = value.astimezone(timezone.utc)

    return value.isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _serialize_complaint(document: dict) -> dict:
    serialized = dict(document)
    for field in ("created_at", "updated_at"):
        if field in serialized:
            serialized[field] = _serialize_datetime(serialized[field])
    return serialized


# ============================================================
# CREATE COMPLAINT
# ============================================================

@router.post("", status_code=status.HTTP_201_CREATED)
def create_complaint(
    complaint: ComplaintCreate,
    current_user: dict = Depends(require_role("student")),
):
    db = get_database()

    now = datetime.now(timezone.utc)
    complaint_id = str(uuid4())

    student = None
    if ObjectId.is_valid(current_user["user_id"]):
        student = db["users"].find_one({"_id": ObjectId(current_user["user_id"])})
    student_roll_no = current_user.get("roll_no")
    if student:
        student_roll_no = student.get("roll_no", student_roll_no)

    # SAVE COMPLAINT
    complaint_document = {
        "id": complaint_id,
        "complaint_id": complaint_id,
        "student_id": current_user["user_id"],
        "student_roll_no": student_roll_no,
        "title": complaint.title,
        "description": complaint.description,
        "location": complaint.location,
        "evidence": complaint.evidence,
        "category": "Pending Analysis",
        "department": "Pending",
        "urgency": "Pending",
        "sentiment": "Pending",
        "priority": "Pending",
        "status": "Under Review",
        "similar_complaints": [],
        "created_at": now,
        "updated_at": now,
    }

    db["complaints"].insert_one(complaint_document)

    complaint_text = f"{complaint.title}. {complaint.description}"
    try:
        analysis = safe_analyze_complaint(complaint_text)
    except Exception:
        logger.exception("Complaint analysis wrapper failed for %s", complaint_id)
        analysis = {
            "category": "Pending Analysis",
            "sentiment": "Pending",
            "urgency": "Pending",
            "department": "Pending",
            "priority": "Pending",
        }

    try:
        similar_complaints = find_similar_complaints(
            db=db,
            complaint_text=complaint_text,
            current_complaint_id=complaint_id,
            threshold=0.35,
            limit=5,
        )
    except Exception:
        logger.exception("Complaint similarity analysis failed for %s", complaint_id)
        similar_complaints = []

    complaint_document.update(analysis)
    complaint_document["similar_complaints"] = similar_complaints
    db["complaints"].update_one(
        {"complaint_id": complaint_id},
        {"$set": {**analysis, "similar_complaints": similar_complaints}},
    )

    return jsonable_encoder(
        _serialize_complaint(complaint_document),
        custom_encoder={ObjectId: str},
    )


# ============================================================
# GET MY COMPLAINTS
# ============================================================

@router.get("/my")
def get_my_complaints(
    current_user: dict = Depends(require_role("student")),
):
    db = get_database()

    complaints = list(
        db["complaints"]
        .find(
            {
                "student_id": current_user["user_id"]
            },
            {
                "_id": 0
            },
        )
        .sort(
            "created_at",
            -1
        )
    )

    return {
        "count": len(complaints),
        "complaints": [_serialize_complaint(item) for item in complaints],
    }


# ============================================================
# ADMIN — GET ALL COMPLAINTS
# ============================================================

@router.get("/admin/all")
def get_all_complaints(
    current_user: dict = Depends(
        require_role("admin")
    ),
    search: str | None = Query(default=None, max_length=100),
    status_filter: str | None = Query(default=None, alias="status", max_length=30),
    category: str | None = Query(default=None, max_length=50),
    priority: str | None = Query(default=None, max_length=20),
):
    db = get_database()
    query = {}

    if search and search.strip():
        query["$or"] = [
            {"title": {"$regex": search.strip(), "$options": "i"}},
            {"description": {"$regex": search.strip(), "$options": "i"}},
            {"location": {"$regex": search.strip(), "$options": "i"}},
            {"category": {"$regex": search.strip(), "$options": "i"}},
        ]
    if status_filter:
        query["status"] = status_filter
    if category:
        query["category"] = category
    if priority:
        query["priority"] = priority

    complaints = list(
        db["complaints"]
        .find(
            query,
            {
                "_id": 0
            },
        )
        .sort(
            "created_at",
            -1
        )
    )

    return {
        "count": len(complaints),
        "complaints": [_serialize_complaint(item) for item in complaints],
    }


@router.get("/admin/stats")
def get_admin_stats(
    current_user: dict = Depends(require_role("admin")),
):
    db = get_database()
    categories = {
        item["_id"] or "Pending Analysis": item["count"]
        for item in db["complaints"].aggregate(
            [
                {
                    "$group": {
                        "_id": "$category",
                        "count": {"$sum": 1},
                    }
                },
                {"$sort": {"count": -1}},
            ]
        )
    }

    return {
        "total": db["complaints"].count_documents({}),
        "under_review": db["complaints"].count_documents({"status": "Under Review"}),
        "in_progress": db["complaints"].count_documents({"status": "In Progress"}),
        "resolved": db["complaints"].count_documents({"status": "Resolved"}),
        "high_priority": db["complaints"].count_documents({"priority": "High"}),
        "category_distribution": categories,
    }


# ============================================================
# ADMIN — GET SINGLE COMPLAINT
# ============================================================

@router.get("/admin/{complaint_id}")
def get_admin_complaint(
    complaint_id: str,
    current_user: dict = Depends(
        require_role("admin")
    ),
):
    db = get_database()

    complaint = db["complaints"].find_one(
        {
            "complaint_id": complaint_id
        },
        {
            "_id": 0
        },
    )

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    return _serialize_complaint(complaint)


# ============================================================
# STUDENT — GET SINGLE COMPLAINT
# ============================================================

@router.get("/{complaint_id}")
def get_complaint(
    complaint_id: str,
    current_user: dict = Depends(require_role("student")),
):
    db = get_database()

    complaint = db["complaints"].find_one(
        {
            "complaint_id": complaint_id,
            "student_id": current_user["user_id"],
        },
        {
            "_id": 0
        },
    )

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    return _serialize_complaint(complaint)


# ============================================================
# ADMIN — UPDATE COMPLAINT STATUS
# ============================================================

@router.patch("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str,
    status_update: ComplaintStatusUpdate,
    current_user: dict = Depends(
        require_role("admin")
    ),
):
    db = get_database()

    allowed_statuses = {"Under Review", "In Progress", "Resolved"}

    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid complaint status",
        )

    updated_complaint = db["complaints"].find_one_and_update(
        {
            "complaint_id": complaint_id
        },
        {
            "$set": {
                "status": status_update.status,
                "updated_at": datetime.now(
                    ZoneInfo("Asia/Kolkata")
                ),
            }
        },
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )

    if not updated_complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    return _serialize_complaint(updated_complaint)