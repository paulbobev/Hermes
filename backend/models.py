from pydantic import BaseModel
from typing import List, Optional

class BookRequest(BaseModel):
    title: str
    text: str

class SentenceSegment(BaseModel):
    id: int
    original: str
    translation: str
    audio_url: Optional[str] = None

class BookResponse(BaseModel):
    id: str
    title: str
    segments: List[SentenceSegment]
