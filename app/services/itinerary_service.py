from typing import Any, Dict
from .ai_service import AIService


class ItineraryService:
    def __init__(self):
        self.ai = AIService()

    async def generate_itinerary(self, prompt: str, budget: int = None, preferences: Dict = None) -> Dict[str, Any]:
        # Build a system/user prompt guiding the model to return JSON with days and total_budget
        system = (
            "You are an assistant that MUST output valid JSON. Return an object with keys: 'days' (array) and 'total_budget' (number). "
            "Each day should have 'date' and 'activities' list. Activities must include 'time', 'title', 'price'."
        )
        user_prompt = f"{system}\nUser request: {prompt}\nBudget: {budget}\nPreferences: {preferences}" 
        raw = await self.ai.ask_ai(user_prompt)
        # Try to extract JSON from raw response
        import json, re
        try:
            return json.loads(raw)
        except Exception:
            m = re.search(r"\{[\s\S]*\}", str(raw))
            if m:
                return json.loads(m.group(0))
            return {"error": "Could not parse AI response", "raw": raw}
