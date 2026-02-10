from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from backend.database import get_db
from backend.models import User
from backend.utils import create_token

router = APIRouter()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register")
def register(data: dict, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data["email"]).first():
        raise HTTPException(400, "Email already exists")

    user = User(
        email=data["email"],
        password_hash=pwd.hash(data["password"]),
        name=data.get("name")
    )

    db.add(user)
    db.commit()

    return {"message": "registered"}

@router.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data["email"]).first()

    if not user or not pwd.verify(data["password"], user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    token = create_token({"user_id": str(user.id)})
    return {"access_token": token}
