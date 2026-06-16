from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..schemas.user import UserCreate, UserOut
from ..config.database import get_db
from passlib.context import CryptContext
from ..models.user import User
from ..utils.jwt import create_access_token
from sqlalchemy.future import select
from typing import Dict

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


@router.post("/register")
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == payload.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = pwd_context.hash(payload.password)
    new = User(name=payload.name, email=payload.email, password=hashed)
    db.add(new)
    await db.commit()
    await db.refresh(new)
    token = create_access_token({"sub": str(new.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": new.id, "name": new.name, "email": new.email},
    }


@router.post("/login")
async def login(data: Dict[str, str], db: AsyncSession = Depends(get_db)):
    email = data.get("email")
    password = data.get("password")
    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email},
    }
