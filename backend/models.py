from pydantic import BaseModel
from typing import List, Optional

class BookRequest(BaseModel):
    title: str
    text: str

class WordToken(BaseModel):
    id: int
    spanish: str
    english: Optional[str] = None

class SentenceSegment(BaseModel):
    id: int
    original: str
    translation: str
    tokens: List[WordToken] = []
    audio_url: Optional[str] = None

class BookResponse(BaseModel):
    id: str
    title: str
    segments: List[SentenceSegment]
