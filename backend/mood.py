from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import DailyMood, User
from backend.utils import get_current_user

router = APIRouter(prefix="/mood", tags=["Mood"])


# -------------------------
# Helper: calculate day index
# -------------------------
def calculate_day_index(db: Session, user_id):
    """
    Day number = total moods already saved + 1
    """
    count = (
        db.query(DailyMood)
        .filter(DailyMood.user_id == user_id)
        .count()
    )
    return count + 1


# -------------------------
# Save today's mood
# -------------------------
@router.post("/daily")
def save_daily_mood(
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    mood = data.get("mood_score")

    if mood is None or not (1 <= mood <= 10):
        raise HTTPException(
            status_code=400,
            detail="Mood must be between 1 and 10"
        )

    day_index = calculate_day_index(db, user.id)

    entry = DailyMood(
        user_id=user.id,
        day_index=day_index,
        mood_score=mood
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return {
        "message": "Mood saved",
        "day": day_index,
        "mood": mood,
        "user_id": str(user.id)  # For debugging
    }


# -------------------------
# Fetch mood history (filtered by user)
# -------------------------
@router.get("/daily")
def get_daily_moods(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Returns all mood entries for the current authenticated user only
    """
    moods = (
        db.query(DailyMood)
        .filter(DailyMood.user_id == user.id)  # ← This filters by user
        .order_by(DailyMood.day_index)
        .all()
    )

    print(f"User ID: {user.id}")  # Debugging
    print(f"Found {len(moods)} mood entries")  # Debugging

    return [
        {
            "day": m.day_index,
            "mood": m.mood_score,
            "created_at": m.created_at.isoformat()
        }
        for m in moods
    ]