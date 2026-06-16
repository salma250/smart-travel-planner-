import logging
from typing import List, Union

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from ..config.database import get_db
from ..services.travel_plan_service import TravelPlanService, normalize_destination

logger = logging.getLogger(__name__)
router = APIRouter()
service = TravelPlanService()


class TravelPlanRequest(BaseModel):
    destination: str = Field(..., min_length=1)
    budget: int = Field(..., ge=0)
    days: int = Field(..., ge=1, le=30)
    travelers: int = Field(..., ge=1, le=12)
    styles: Union[List[str], str] = []

    @field_validator("destination")
    @classmethod
    def validate_destination(cls, value: str) -> str:
        normalized = normalize_destination(value)
        if not normalized:
            raise ValueError("Destination is required")
        return normalized

    @field_validator("styles")
    @classmethod
    def normalize_styles(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@router.post("/plan")
async def generate_travel_plan(payload: TravelPlanRequest, db: AsyncSession = Depends(get_db)):
    try:
        logger.info(
            "Generating travel plan destination=%s budget=%s days=%s travelers=%s",
            payload.destination,
            payload.budget,
            payload.days,
            payload.travelers,
        )
        return await service.build_plan(
            db=db,
            destination=payload.destination,
            budget=payload.budget,
            days=payload.days,
            travelers=payload.travelers,
            styles=payload.styles,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
