import os
import base64
import requests
from typing import Optional, Dict, Any
from fastapi import UploadFile


class AIService:
    """Wrapper for an AI provider using OpenRouter (as gateway to OpenAI-like models).

    Behavior:
    - If `OPENROUTER_API_KEY` is provided it will call the OpenRouter chat completions
      endpoint with model `gpt-3.5-turbo`.
    - If no API key is configured, methods return safe fallback responses (no crash).
    - Provides `ask_ai` compatibility method used by routes.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('OPENROUTER_API_KEY') or os.getenv('GEMINI_API_KEY')
        self.openrouter_url = 'https://api.openrouter.ai/v1/chat/completions'

    def _call_openrouter(self, prompt: str) -> Optional[str]:
        if not self.api_key:
            return None
        try:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}'
            }
            payload = {
                'model': 'gpt-3.5-turbo',
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
                'max_tokens': 800,
            }
            resp = requests.post(self.openrouter_url, json=payload, headers=headers, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            # try to be robust to different shapes
            choices = data.get('choices') or []
            if choices:
                message = choices[0].get('message') or {}
                content = message.get('content')
                if isinstance(content, dict):
                    # some providers return {'type':'output_text','text': '...'}
                    return content.get('text') or content.get('message') or str(content)
                return content or str(data)
            # fallback to text field
            return data.get('text') or str(data)
        except Exception:
            return None

    async def ask_ai(self, prompt: str, include_image_base64: Optional[str] = None) -> str:
        """Synchronous wrapper used by routes. Returns a string reply or fallback message."""
        # If image base64 provided, append a short note: provider may or may not support raw base64
        full_prompt = prompt
        if include_image_base64:
            # include a small hint to the model that image_base64 follows
            full_prompt = f"{prompt}\n[ImageBase64Attached]\n{include_image_base64}"

        resp = self._call_openrouter(full_prompt)
        if resp:
            return resp
        # fallback: echo with note
        return f"[AI provider not configured or failed] {prompt[:240]}"

    async def generate_text(self, prompt: str) -> str:
        # Keep async signature for compatibility
        return await self.ask_ai(prompt)

    async def process_message(self, text: Optional[str] = None, audio: Optional[UploadFile] = None, image: Optional[UploadFile] = None) -> Dict[str, Any]:
        result: Dict[str, Any] = {"text_response": None, "audio_transcript": None, "image_description": None}

        prompt = text or ""

        # handle audio transcription via AudioService in routes (audio_service is lighter here)
        if audio is not None:
            try:
                audio_bytes = await audio.read()
                # No native ASR here; services should call AudioService separately.
                result["audio_transcript"] = "[Audio reçu — transcription non disponible]"
                prompt = (prompt + " " + result["audio_transcript"]).strip()
            finally:
                try:
                    await audio.close()
                except Exception:
                    pass

        # handle image: optionally include base64 in prompt if API key available
        image_b64 = None
        if image is not None:
            try:
                img_bytes = await image.read()
                if self.api_key:
                    image_b64 = base64.b64encode(img_bytes).decode('ascii')
                    # include a short hint in the prompt; providers may have limits
                    prompt = (prompt + "\n[Image attached: base64 below]\n" + image_b64[:1024]).strip()
                else:
                    result["image_description"] = "[Image reçue — analyse non disponible]"
            finally:
                try:
                    await image.close()
                except Exception:
                    pass

        # Ask AI
        try:
            ai_reply = self._call_openrouter(prompt) if self.api_key else None
            if ai_reply is None:
                # fallback behaviour: if text provided, echo or return helpful fallback
                if prompt:
                    result["text_response"] = f"[AI provider not configured] {prompt}"
                else:
                    result["text_response"] = "[AI provider not configured — no input]"
            else:
                result["text_response"] = ai_reply
        except Exception:
            result["text_response"] = "[AI provider error — please try again]"

        # if image_description not set but we included base64, leave None (provider output in text_response may include image commentary)
        return result