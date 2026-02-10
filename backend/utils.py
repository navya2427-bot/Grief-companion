import jwt
import os
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User

SECRET = os.getenv("SECRET_KEY", "secret")

def create_token(data: dict):
    return jwt.encode(data, SECRET, algorithm="HS256")

def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        user_id = payload["user_id"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
