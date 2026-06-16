from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from ..config.database import get_db
from ..models.city import City

router = APIRouter()


@router.get("/")
async def list_cities(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(City).order_by(City.id))
    cities = result.scalars().all()
    return [
        {
            "id": c.id,
            "city": c.city,
            "country": c.country,
            "region": c.region,
            "short_description": c.short_description,
            "budget_level": c.budget_level,
            "nature": c.nature,
            "beaches": c.beaches,
            "nightlife": c.nightlife,
        }
        for c in cities
    ]


@router.get("/health-db")
async def cities_db_health(db: AsyncSession = Depends(get_db)):
    count_result = await db.execute(select(func.count()).select_from(City))
    city_count = count_result.scalar() or 0
    await db.execute(text("SELECT 1"))
    return {
        "status": "ok",
        "database": "connected",
        "cities_count": city_count,
    }
