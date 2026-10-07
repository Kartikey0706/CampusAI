import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24
security = HTTPBearer()

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is missing. Add it to backend/.env.")

def create_access_token(user_id: str, email: str, role: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {"user_id": user_id, "email": email, "role": role, "exp": expires}
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        if not payload.get("user_id") or not payload.get("role"):
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def require_role(role: str):
    def checker(current_user=Depends(get_current_user)):
        if current_user.get("role") != role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return checker
