from sqlalchemy import Column, Integer, String, Text, DateTime, func
from ..config.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(255), index=True)
    role = Column(String(50))
    type = Column(String(50), default="text")
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
