from sqlalchemy import Column, Integer, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from ..config.database import Base


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False, index=True)
    days = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
