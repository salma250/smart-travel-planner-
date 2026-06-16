import re
import unicodedata
from datetime import date, timedelta
from typing import Any, Dict, List, Optional
from urllib.parse import quote_plus

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.city import City


def normalize_destination(value: str) -> str:
    cleaned = unicodedata.normalize("NFKD", value or "")
    cleaned = "".join(ch for ch in cleaned if not unicodedata.combining(ch))
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def destination_key(value: str) -> str:
    normalized = normalize_destination(value)
    city_part = normalized.split(",", 1)[0]
    key = re.sub(r"[^a-z0-9]+", " ", city_part.casefold()).strip()
    return key


def destination_label(value: str) -> str:
    normalized = normalize_destination(value)
    city_part = normalized.split(",", 1)[0].strip()
    return city_part or normalized


def destination_placeholder_image(city: str) -> str:
    label = quote_plus(f"{city} travel plan")
    return f"https://placehold.co/1600x900/0f172a/e2e8f0?text={label}"


DESTINATION_CATALOG: Dict[str, Dict[str, Any]] = {
    "tokyo": {
        "city": "Tokyo",
        "country": "Japan",
        "airport": "HND",
        "image": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80",
        "description": "Neon districts, quiet temples, food markets, gardens, and rail-linked neighborhoods.",
        "tags": ["Culture", "Food", "Urban", "Shopping"],
        "activities": ["Senso-ji Temple", "Meiji Shrine", "Shibuya Crossing", "Tsukiji Outer Market", "Ueno Park", "Akihabara"],
        "restaurants": ["Sushi Zanmai", "Ichiran Shibuya", "Afuri Ramen", "Gonpachi Nishi-Azabu"],
        "hotel_areas": ["Shinjuku", "Ginza", "Asakusa"],
        "hotel_image": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=80",
        "tip": "Use a Suica or Pasmo transit card and group nearby neighborhoods by train line.",
    },
    "paris": {
        "city": "Paris",
        "country": "France",
        "airport": "CDG",
        "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80",
        "description": "Museums, historic neighborhoods, river walks, bakeries, fashion streets, and classic cafes.",
        "tags": ["Culture", "Art", "Food", "Romance"],
        "activities": ["Louvre Museum", "Eiffel Tower", "Montmartre", "Seine river walk", "Le Marais", "Musee d'Orsay"],
        "restaurants": ["Bouillon Chartier", "Cafe de Flore", "Le Procope", "Breizh Cafe"],
        "hotel_areas": ["Le Marais", "Saint-Germain", "Opera"],
        "hotel_image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=80",
        "tip": "Book timed museum entries and keep one flexible evening for a Seine-side walk.",
    },
    "bali": {
        "city": "Bali",
        "country": "Indonesia",
        "airport": "DPS",
        "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80",
        "description": "Rice terraces, temples, beaches, surf towns, waterfalls, wellness retreats, and craft villages.",
        "tags": ["Nature", "Beach", "Wellness", "Adventure"],
        "activities": ["Ubud rice terraces", "Uluwatu Temple", "Seminyak Beach", "Tirta Empul", "Nusa Penida", "Tegenungan Waterfall"],
        "restaurants": ["Locavore NXT", "Sisterfields", "Warung Babi Guling Ibu Oka", "Motel Mexicola"],
        "hotel_areas": ["Ubud", "Seminyak", "Canggu"],
        "hotel_image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80",
        "tip": "Plan road transfers with buffer time because short distances can take longer than expected.",
    },
    "santorini": {
        "city": "Santorini",
        "country": "Greece",
        "airport": "JTR",
        "image": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=80",
        "description": "Cliffside villages with white domed buildings, stunning sunsets, volcanic beaches, and ancient ruins.",
        "tags": ["Romance", "Beach", "Views", "Culture"],
        "activities": ["Oia sunset watch", "Red Beach", "Akrotiri ruins", "Fira town walk", "Wine tasting tour", "Boat to volcano"],
        "restaurants": ["Sunset Ammoudi", "Metaxi Mas", "Argo Restaurant", "Kapari Wine Restaurant"],
        "hotel_areas": ["Oia", "Fira", "Imerovigli"],
        "hotel_image": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500&q=80",
        "tip": "Book sunset viewing spots in advance and rent an ATV to explore the island freely.",
    },
    "marrakech": {
        "city": "Marrakech",
        "country": "Morocco",
        "airport": "RAK",
        "image": "https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?w=1600&q=80",
        "description": "Spice-scented medinas, ornate palaces, bustling souks, tranquil riads, and desert excursions.",
        "tags": ["Culture", "Shopping", "History", "Adventure"],
        "activities": ["Jemaa el-Fnaa square", "Bahia Palace", "Majorelle Garden", "Souk shopping", "Atlas Mountains day trip", "Cooking class"],
        "restaurants": ["La Maison Arabe", "Nomad", "Le Jardin", "Dar Tajine"],
        "hotel_areas": ["Medina", "Gueliz", "Hivernage"],
        "hotel_image": "https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?w=500&q=80",
        "tip": "Hire a local guide for your first medina visit and carry cash for souk bargaining.",
    },
    "new york": {
        "city": "New York",
        "country": "USA",
        "airport": "JFK",
        "image": "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1600&q=80",
        "description": "Iconic skyscrapers, world-class museums, diverse neighborhoods, Broadway shows, and endless dining.",
        "tags": ["Urban", "Food", "Art", "Culture"],
        "activities": ["Central Park", "Statue of Liberty", "Times Square", "Met Museum", "Brooklyn Bridge walk", "Broadway show"],
        "restaurants": ["Katz's Delicatessen", "Le Bernardin", "Joe's Pizza", "Xi'an Famous Foods"],
        "hotel_areas": ["Manhattan Midtown", "SoHo", "Brooklyn Heights"],
        "hotel_image": "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=500&q=80",
        "tip": "Get a MetroCard for unlimited subway rides and book Broadway tickets in advance.",
    },
}


class TravelPlanService:
    async def build_plan(
        self,
        db: AsyncSession,
        destination: str,
        budget: int,
        days: int,
        travelers: int,
        styles: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        normalized = destination_label(destination)
        key = destination_key(destination)
        db_city = await self._find_city(db, key)
        base = self._catalog_entry(key, normalized, db_city)

        days = max(1, min(int(days or 1), 30))
        travelers = max(1, min(int(travelers or 1), 12))
        budget = max(0, int(budget or 0))
        per_person_flight = self._flight_price(base["airport"], budget, travelers)
        hotel_nightly = self._hotel_nightly(budget, days, travelers)
        hotel_total = hotel_nightly * max(days - 1, 1)
        activity_budget = max(0, int(budget * 0.18))
        food_budget = max(0, int(budget * 0.16))
        total_estimated = per_person_flight * travelers + hotel_total + activity_budget + food_budget

        flights = self._flights(base, per_person_flight)
        hotels = self._hotels(base, hotel_nightly, days)
        itinerary = self._itinerary(base, days, activity_budget, food_budget)
        recommendations = self._recommendations(base, styles or [])

        return {
            "destination": {
                "requested": destination,
                "normalized": base["city"],
                "city": base["city"],
                "country": base["country"],
                "image": base["image"],
                "description": base["description"],
                "tags": base["tags"],
                "match_source": "database+catalog" if db_city else "catalog",
            },
            "inputs": {
                "budget": budget,
                "days": days,
                "travelers": travelers,
                "styles": styles or [],
            },
            "flights": flights,
            "hotels": hotels,
            "recommendations": recommendations,
            "itinerary": itinerary,
            "budget": {
                "total": budget,
                "estimated_total": total_estimated,
                "remaining": budget - total_estimated,
                "breakdown": [
                    {"label": f"Flights x {travelers}", "amount": per_person_flight * travelers, "color": "bg-indigo-500"},
                    {"label": f"Hotel {max(days - 1, 1)} nights", "amount": hotel_total, "color": "bg-purple-500"},
                    {"label": "Activities", "amount": activity_budget, "color": "bg-amber-500"},
                    {"label": "Food and drinks", "amount": food_budget, "color": "bg-pink-500"},
                ],
            },
            "external_data": {
                "image_provider": "Destination-pinned Unsplash URLs for known cities; named placeholder for uncataloged cities",
                "metadata_provider": "local database city row when available",
                "destination_match_key": key,
                "destination_match_enforced": True,
            },
        }

    async def _find_city(self, db: AsyncSession, key: str) -> Optional[City]:
        result = await db.execute(select(City).where(func.lower(City.city) == key).limit(1))
        return result.scalar_one_or_none()

    def _catalog_entry(self, key: str, normalized: str, db_city: Optional[City]) -> Dict[str, Any]:
        catalog = DESTINATION_CATALOG.get(key)
        if catalog:
            base = dict(catalog)
        else:
            title = normalized.title()
            base = {
                "city": title,
                "country": db_city.country if db_city else "Unknown",
                "airport": "INT",
                "image": destination_placeholder_image(title),
                "description": db_city.short_description if db_city and db_city.short_description else f"Destination-specific plan for {title}.",
                "tags": ["Culture", "Food", "Sightseeing"],
                "activities": [f"{title} historic center", f"{title} food market", f"{title} landmark walk", f"{title} museum district"],
                "restaurants": [f"{title} local bistro", f"{title} market lunch", f"{title} rooftop dinner"],
                "hotel_areas": [f"Central {title}", f"{title} old town", f"{title} station area"],
                "hotel_image": destination_placeholder_image(f"{title} hotels"),
                "tip": f"Keep your first day in {title} light so arrival delays do not break the plan.",
            }
        if db_city:
            base["city"] = db_city.city
            base["country"] = db_city.country
            if db_city.short_description:
                base["description"] = db_city.short_description
        return base

    def _flight_price(self, airport: str, budget: int, travelers: int) -> int:
        baseline = {
            "HND": 5200,  # Tokyo
            "CDG": 2600,  # Paris
            "DPS": 6200,  # Bali
            "JTR": 4800,  # Santorini
            "RAK": 1800,  # Marrakech
            "JFK": 4500,  # New York
        }.get(airport, 3800)
        if budget and budget / max(travelers, 1) < baseline * 1.8:
            return int(baseline * 0.82)
        return baseline

    def _hotel_nightly(self, budget: int, days: int, travelers: int) -> int:
        if not budget:
            return 650
        nights = max(days - 1, 1)
        target = int((budget * 0.34) / nights)
        return max(280, min(target, 2200))

    def _flights(self, base: Dict[str, Any], price: int) -> List[Dict[str, Any]]:
        city = base["city"]
        airport = base["airport"]
        return [
            {"id": 1, "airline": "Royal Air Maroc", "from": "CMN", "fromCity": "Casablanca", "to": airport, "toCity": city, "dep": "08:45", "arr": "13:20", "duration": "Best available", "stops": "1 stop" if airport in {"HND", "DPS"} else "Direct", "price": price, "badge": "Best match"},
            {"id": 2, "airline": "International partner", "from": "CMN", "fromCity": "Casablanca", "to": airport, "toCity": city, "dep": "14:30", "arr": "20:10", "duration": "Flexible fare", "stops": "1 stop", "price": int(price * 1.18), "badge": "Flexible"},
            {"id": 3, "airline": "Budget connection", "from": "CMN", "fromCity": "Casablanca", "to": airport, "toCity": city, "dep": "06:00", "arr": "18:40", "duration": "Lowest fare", "stops": "1 stop", "price": int(price * 0.88), "badge": "Budget pick"},
        ]

    def _hotels(self, base: Dict[str, Any], nightly: int, days: int) -> List[Dict[str, Any]]:
        nights = max(days - 1, 1)
        areas = base["hotel_areas"]
        city = base["city"]
        return [
            {"id": 1, "name": f"{city} Central Stay", "area": areas[0], "stars": 4, "rating": 4.6, "reviews": 640, "price": nightly, "total": nightly * nights, "nights": nights, "photo": base["hotel_image"], "amenities": ["WiFi", "Breakfast", "Transit access"], "badge": "Recommended"},
            {"id": 2, "name": f"{city} Value Hotel", "area": areas[1], "stars": 3, "rating": 4.3, "reviews": 410, "price": int(nightly * 0.78), "total": int(nightly * 0.78) * nights, "nights": nights, "photo": base["hotel_image"], "amenities": ["WiFi", "Restaurant"], "badge": "Great value"},
            {"id": 3, "name": f"{city} Signature Hotel", "area": areas[2], "stars": 5, "rating": 4.8, "reviews": 910, "price": int(nightly * 1.45), "total": int(nightly * 1.45) * nights, "nights": nights, "photo": base["hotel_image"], "amenities": ["WiFi", "Spa", "Concierge"], "badge": "Premium"},
        ]

    def _recommendations(self, base: Dict[str, Any], styles: List[str]) -> List[Dict[str, str]]:
        picked = base["activities"][:4]
        return [{"title": item, "type": "Activity", "reason": f"Fits {base['city']} and your {', '.join(styles) if styles else 'travel'} interests."} for item in picked]

    def _itinerary(self, base: Dict[str, Any], days: int, activity_budget: int, food_budget: int) -> List[Dict[str, Any]]:
        start = date.today()
        rows = []
        activities = base["activities"]
        restaurants = base["restaurants"]
        daily_activity = max(0, int(activity_budget / max(days, 1)))
        daily_food = max(0, int(food_budget / max(days, 1)))
        for index in range(days):
            activity = activities[index % len(activities)]
            second = activities[(index + 1) % len(activities)]
            restaurant = restaurants[index % len(restaurants)]
            rows.append({
                "day": index + 1,
                "date": (start + timedelta(days=index)).strftime("%a, %d %b"),
                "theme": f"{base['city']} day {index + 1}: {activity}",
                "photo": base["image"],
                "budget": daily_activity + daily_food,
                "spent": int((daily_activity + daily_food) * 0.92),
                "tip": base["tip"],
                "events": [
                    {"time": "09:00", "type": "activity", "title": activity, "sub": f"{base['city']} destination highlight", "price": int(daily_activity * 0.45), "duration": "2h"},
                    {"time": "12:30", "type": "restaurant", "title": f"Lunch - {restaurant}", "sub": f"Local food stop in {base['city']}", "price": int(daily_food * 0.45), "duration": "1h"},
                    {"time": "15:00", "type": "activity", "title": second, "sub": f"Continue exploring {base['city']}", "price": int(daily_activity * 0.35), "duration": "2h"},
                    {"time": "19:30", "type": "restaurant", "title": f"Dinner - {restaurant}", "sub": f"Evening meal in {base['city']}", "price": int(daily_food * 0.55), "duration": "1h30"},
                ],
            })
        return rows
