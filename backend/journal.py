from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
import jwt

from backend.database import get_db
from backend.models import JournalEntry, User

SECRET_KEY = "super-secret-key-which-is-at-least-32-bytes-long"
ALGORITHM = "HS256"

router = APIRouter(prefix="/journal", tags=["Journal"])


def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("user_id")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(401)

    return user


@router.post("")
def add_entry(
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = JournalEntry(
        user_id=user.id,
        text=data["text"],
        mood=data.get("mood")
    )
    db.add(entry)
    db.commit()
    return {"status": "saved"}


@router.get("")
def list_entries(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user.id)
        .order_by(JournalEntry.created_at.desc())
        .all()
    )

    return [
        {
            "id": str(e.id),
            "text": e.text,
            "mood": e.mood,
            "created_at": e.created_at.isoformat()
        }
        for e in entries
    ]


@router.delete("/{entry_id}")
def delete_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == user.id)
        .first()
    )

    if not entry:
        raise HTTPException(404)

    db.delete(entry)
    db.commit()
    return {"status": "deleted"}
