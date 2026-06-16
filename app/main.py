from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .routes import auth, chat, trips, cities, itinerary, travel_plan
from .config.settings import settings
from .config.database import engine

app = FastAPI(title="Smart Travel API")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(cities.router, prefix="/api/cities", tags=["cities"])
app.include_router(itinerary.router, prefix="/api/itinerary", tags=["itinerary"])
app.include_router(travel_plan.router, prefix="/api/travel", tags=["travel"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "fastapi"}


@app.get("/api/health/db")
async def health_db():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        return {"status": "error", "database": "disconnected", "detail": str(exc)}
