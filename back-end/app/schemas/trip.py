from pydantic import BaseModel
from typing import Optional
from datetime import date


class TripCreate(BaseModel):
    title: str
    start_date: Optional[date]
    end_date: Optional[date]


class TripOut(BaseModel):
    id: int
    title: str
    start_date: Optional[date]
    end_date: Optional[date]

    model_config = {
        "from_attributes": True
    }
