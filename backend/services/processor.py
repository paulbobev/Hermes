from .translator import Translator
from .tts import TTS
from models import SentenceSegment
import re
import uuid

class Processor:
    def __init__(self):
        self.translator = Translator()
        self.tts = TTS()

    def process_text(self, text: str) -> list[SentenceSegment]:
        # 1. Segment text (Simple regex for splitting by . ! ?)
        # This handles multiple punctuation marks and spaces
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        batch_id = str(uuid.uuid4())[:8]
        results = []
        for idx, sentence in enumerate(sentences):
            if not sentence.strip():
                continue
                
            # 2. Translate
            translation = self.translator.translate(sentence)
            
            # 3. Generate Audio (Mock to actual file in static)
            audio_filename = f"audio_{batch_id}_{idx}.wav"
            audio_path = f"static/{audio_filename}"
            self.tts.generate_audio(sentence, audio_path)
            
            results.append(SentenceSegment(
                id=idx,
                original=sentence,
                translation=translation,
                audio_url=f"/static/{audio_filename}"
            ))
        return results
