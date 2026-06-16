from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..utils.dependencies import get_db, get_current_user
from ..services.itinerary_service import ItineraryService
from ..models.itinerary import Itinerary
from ..schemas.itinerary import ItineraryCreate, ItineraryOut

router = APIRouter()
service = ItineraryService()


@router.get("/{trip_id}", response_model=ItineraryOut)
async def get_itinerary(trip_id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    stmt = select(Itinerary).where(Itinerary.trip_id == trip_id)
    result = await db.execute(stmt)
    itinerary = result.scalar_one_or_none()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return itinerary


@router.post("/generate")
async def generate_itinerary(payload: ItineraryCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    # Use AI to generate itinerary
    res = await service.generate_itinerary(prompt=str(payload.days), budget=None)
    # Save to DB
    it = Itinerary(trip_id=payload.trip_id, days=res)
    db.add(it)
    await db.commit()
    await db.refresh(it)
    return it
