from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from backend.database import get_db
from backend.models import Room, Topic, Message, User
from backend.utils import get_current_user

router = APIRouter(prefix="/rooms", tags=["Rooms"])


# -------------------------
# Create Room
# -------------------------

class MessageCreate(BaseModel):
    body: str

@router.post("")
def create_room(
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if not data.get("name") or not data.get("topic"):
        raise HTTPException(400, "Name and topic required")

    topic = db.query(Topic).filter(Topic.name == data["topic"]).first()
    if not topic:
        topic = Topic(name=data["topic"])
        db.add(topic)
        db.commit()
        db.refresh(topic)

    room = Room(
        name=data["name"],
        description=data.get("description"),
        host_id=user.id,
        topic_id=topic.id
    )

    db.add(room)
    db.commit()
    db.refresh(room)

    return {
        "id": room.id,
        "name": room.name,
        "topic": topic.name,
        "description": room.description
    }


# -------------------------
# List Rooms
# -------------------------
@router.get("")
def list_rooms(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    rooms = db.query(Room).all()

    return [
        {
            "id": room.id,
            "name": room.name,
            "topic": room.topic.name if room.topic else "",
            "description": room.description,
            "is_owner": room.host_id == user.id
        }
        for room in rooms
    ]


# -------------------------
# Get Room Info
# -------------------------
@router.get("/{room_id}")
def get_room(
    room_id: UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # ✅ Auto-join user
    if user not in room.participants:
        room.participants.append(user)
        db.commit()

    return {
        "id": str(room.id),
        "name": room.name,
        "topic": room.topic.name if room.topic else "",
        "description": room.description,
        "participants_count": len(room.participants),
        "is_owner": room.host_id == user.id
    }
# -------------------------
# Get Room Messages
# -------------------------
@router.get("/{room_id}/messages")
def get_messages(
    room_id: UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    messages = (
        db.query(Message)
        .filter(Message.room_id == room_id)
        .order_by(Message.created_at)
        .all()
    )

    return [
    {
        "id": str(m.id),
        "sender": m.user.email,
        "body": m.body,
        "created_at": m.created_at.isoformat(),
    }
    for m in messages
]


# -------------------------
# Send Message
# -------------------------
@router.post("/{room_id}/messages")
def send_message(
    room_id: UUID,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    message = Message(
        room_id=room.id,
        user_id=user.id,
        body=payload.body
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return {
    "id": str(message.id),
    "sender": message.user.email,
    "body": message.body,
    "created_at": message.created_at.isoformat()
}

@router.delete("/{room_id}")
def delete_room(
    room_id: UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    print("DELETE REQUEST RECEIVED")
    print("Room ID:", room_id)
    print("User ID:", user.id)

    room = db.query(Room).filter(Room.id == room_id).first()
    print("Room found:", room)

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    print("Room host_id:", room.host_id)

    if room.host_id != user.id:
        print("❌ NOT OWNER")
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(room)
    db.commit()

    print("✅ ROOM DELETED")

    return {"message": "Room deleted"}
