from sqlalchemy import Column, Integer, String, Text
from ..config.database import Base


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(255), nullable=False)
    country = Column(String(255), nullable=False)
    region = Column(String(255), nullable=True)
    short_description = Column(Text, nullable=True)
    budget_level = Column(String(50), nullable=True)
    nature = Column(Integer, nullable=True)
    beaches = Column(Integer, nullable=True)
    nightlife = Column(Integer, nullable=True)
