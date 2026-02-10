from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from backend.utils import get_current_user
from backend.ai_client import call_perplexity

router = APIRouter()

# ---------- Schemas ----------
class ChatRequest(BaseModel):
    message: str
    mood: Optional[int] = None   # ✅ Python 3.9 compatible
    style: str = "friend"        # friend | listener | coach
    tone: str = "non-judging"    # non-judging | positive | neutral | supportive


class ChatResponse(BaseModel):
    reply: str
    risk: str


# ---------- Risk Detection ----------
def detect_risk(text: str) -> str:
    high_risk_words = [
        "suicide",
        "kill myself",
        "end my life",
        "no reason to live",
        "i want to die"
    ]
    for w in high_risk_words:
        if w in text.lower():
            return "HIGH"
    return "LOW"


# ---------- Prompt Builder ----------
def build_system_prompt(style: str, tone: str) -> str:
    return f"""
You are an emotional support AI for grief and distress.

Response style: {style}
Tone constraint: {tone}

Rules:
- Be empathetic, calm, and human.
- Never judge, shame, or diagnose.
- Do not give medical or legal advice.
- Keep responses short and gentle.
- If the user sounds unsafe, gently suggest seeking trusted help.
"""


# ---------- Route ----------
@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    user_id: str = Depends(get_current_user)  # JWT protected
):
    risk = detect_risk(payload.message)

    system_prompt = build_system_prompt(payload.style, payload.tone)

    if risk == "HIGH":
        system_prompt += "\nFocus on safety and encourage external support."

    reply = call_perplexity(system_prompt, payload.message)

    return {
        "reply": reply,
        "risk": risk
    }
