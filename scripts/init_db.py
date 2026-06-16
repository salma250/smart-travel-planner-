"""
Database initialization script.
Creates all tables and seeds sample cities.
Run from the `back/` directory:
    .venv/bin/python -m scripts.init_db
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.config.database import engine, Base, AsyncSessionLocal

from app.models.user import User        # noqa: F401
from app.models.trip import Trip        # noqa: F401
from app.models.itinerary import Itinerary  # noqa: F401
from app.models.message import Message  # noqa: F401
from app.models.city import City        # noqa: F401

SAMPLE_CITIES = [
    {
        "city": "Paris",
        "country": "France",
        "region": "Europe",
        "short_description": "City of light, art, and world-class cuisine.",
        "budget_level": "medium",
        "nature": 3,
        "beaches": 1,
        "nightlife": 5,
    },
    {
        "city": "Tokyo",
        "country": "Japan",
        "region": "Asia",
        "short_description": "Neon skylines meet ancient temples.",
        "budget_level": "high",
        "nature": 4,
        "beaches": 2,
        "nightlife": 5,
    },
    {
        "city": "Marrakech",
        "country": "Morocco",
        "region": "Africa",
        "short_description": "Spice-scented medinas and vibrant riads.",
        "budget_level": "low",
        "nature": 3,
        "beaches": 2,
        "nightlife": 4,
    },
]


async def seed_cities():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(City))
        if result.scalars().first():
            print("Cities already seeded, skipping.")
            return
        for row in SAMPLE_CITIES:
            session.add(City(**row))
        await session.commit()
        print(f"Seeded {len(SAMPLE_CITIES)} cities.")


async def init():
    print(f"Creating tables using engine: {engine.url}")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("All tables created successfully.")
    await seed_cities()


if __name__ == "__main__":
    asyncio.run(init())
