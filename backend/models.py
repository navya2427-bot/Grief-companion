from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    ForeignKey,
    Table,
    Integer,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from backend.database import Base


# =========================
# Association table (Room ↔ Users)
# =========================
room_participants = Table(
    "room_participants",
    Base.metadata,
    Column("room_id", UUID(as_uuid=True), ForeignKey("rooms.id"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
)


# =========================
# USER
# =========================
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

    name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    rooms_hosted = relationship("Room", back_populates="host", cascade="all, delete")
    messages = relationship("Message", back_populates="user", cascade="all, delete")
    daily_moods = relationship("DailyMood", back_populates="user", cascade="all, delete")

    participating_rooms = relationship(
        "Room",
        secondary=room_participants,
        back_populates="participants",
    )


# =========================
# TOPIC
# =========================
class Topic(Base):
    __tablename__ = "topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)

    rooms = relationship("Room", back_populates="topic")


# =========================
# ROOM
# =========================
class Room(Base):
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    host_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=True)

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    host = relationship("User", back_populates="rooms_hosted")
    topic = relationship("Topic", back_populates="rooms")

    participants = relationship(
        "User",
        secondary=room_participants,
        back_populates="participating_rooms",
    )

    messages = relationship("Message", back_populates="room", cascade="all, delete")


# =========================
# MESSAGE
# =========================
class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id"), nullable=False)

    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="messages")
    room = relationship("Room", back_populates="messages")


# =========================
# DAILY MOOD (Graph)
# =========================
class DailyMood(Base):
    __tablename__ = "daily_moods"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    day_index = Column(Integer, nullable=False)   # Day 1, Day 2, Day 3...
    mood_score = Column(Integer, nullable=False)  # 1–10

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="daily_moods")
class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    text = Column(Text, nullable=False)
    mood = Column(Integer, nullable=True)  # optional 1–10
    created_at = Column(DateTime(timezone=True), server_default=func.now())
