from pydantic import BaseModel
from typing import Any, List


class ItineraryCreate(BaseModel):
    trip_id: int
    days: Any


class ItineraryOut(BaseModel):
    id: int
    trip_id: int
    days: Any

    model_config = {
        "from_attributes": True
    }
