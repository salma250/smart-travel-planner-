from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Optional
from ..services.ai_service import AIService
from ..services.audio_service import AudioService
from ..utils.dependencies import get_db, get_current_user
from ..models.message import Message
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime

router = APIRouter()
ai_service = AIService()
audio_service = AudioService()


def build_response(conversation_id: str, text: str):
    mid = str(uuid.uuid4())
    return {
        "conversationId": conversation_id,
        "message": {
            "id": mid,
            "role": "assistant",
            "type": "text",
            "content": text,
            "createdAt": datetime.utcnow().isoformat() + "Z",
        },
    }


@router.post("/message")
async def post_message(payload: dict, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    # payload: {conversationId, content}
    conv = payload.get("conversationId") or str(uuid.uuid4())
    content = payload.get("content")
    if not content:
        raise HTTPException(status_code=400, detail="No content provided")
    # Ask AI
    reply = await ai_service.ask_ai(content)
    # Save message
    msg = Message(conversation_id=conv, role="assistant", content=reply)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return build_response(conv, reply)


@router.post("/message-with-attachments")
async def post_message_attachments(
    conversationId: Optional[str] = Form(None),
    text: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    conv = conversationId or str(uuid.uuid4())
    content = text or ""
    # If audio provided, transcribe
    if audio:
        b = await audio.read()
        transcription = await audio_service.transcribe(b, audio.content_type)
        content = (content + " " + transcription).strip()
    # images are placeholders
    prompt = content
    if image:
        prompt += "\n[Image attached]"
    reply = await ai_service.ask_ai(prompt)
    msg = Message(conversation_id=conv, role="assistant", content=reply)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return build_response(conv, reply)
