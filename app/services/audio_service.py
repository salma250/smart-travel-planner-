from typing import Optional


class AudioService:
    """Placeholder audio transcription service.

    Real implementation should call a transcription API (OpenRouter/Whisper/etc.).
    """

    async def transcribe(self, file_bytes: bytes, content_type: Optional[str] = None) -> str:
        # Placeholder: return a short message. Replace with real ASR integration.
        return "[transcription placeholder]"
