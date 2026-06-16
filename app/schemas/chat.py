from pydantic import BaseModel
from typing import Optional


class ChatMessage(BaseModel):
    conversationId: Optional[str]
    role: str
    content: str


class ChatResponse(BaseModel):
    conversationId: str
    message: dict
