from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..utils.dependencies import get_db, get_current_user
from ..schemas.trip import TripCreate, TripOut
from ..models.trip import Trip

router = APIRouter()


@router.get("/", response_model=List[TripOut])
async def list_trips(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    stmt = select(Trip).where(Trip.user_id == user.id)
    result = await db.execute(stmt)
    trips = result.scalars().all()
    return trips


@router.get("/{trip_id}", response_model=TripOut)
async def get_trip(trip_id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    stmt = select(Trip).where(Trip.id == trip_id, Trip.user_id == user.id)
    result = await db.execute(stmt)
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post("/", response_model=TripOut)
async def create_trip(payload: TripCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    trip = Trip(title=payload.title, start_date=payload.start_date, end_date=payload.end_date, user_id=user.id)
    db.add(trip)
    await db.commit()
    await db.refresh(trip)
    return trip
