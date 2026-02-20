from .translator import Translator
from .tts import TTS
from models import SentenceSegment, WordToken
import re
import uuid

class Processor:
    def __init__(self):
        self.translator = Translator()
        self.tts = TTS()

    def process_text(self, text: str) -> list[SentenceSegment]:
        # 1. Segment text (Simple regex for splitting by . ! ?)
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s*', text) if s.strip()]
        
        batch_id = str(uuid.uuid4())[:8]
        results = []
        for idx, sentence in enumerate(sentences):
            if not sentence.strip():
                continue
                
            # 2. Translate full sentence
            translation = self.translator.translate(sentence)
            
            # 3. Create word tokens
            words = sentence.split()
            tokens = []
            
            # Improved dictionary for the "Reloj de Arena" story
            word_dict = {
                "El": "The", "Reloj": "Clock/Watch", "de": "of", "Arena": "Sand", "la": "the", "Abuela": "Grandmother",
                "En": "In", "el": "the", "pequeño": "small", "pueblo": "town", "San": "Saint", "Juan": "John",
                "donde": "where", "las": "the", "calles": "streets", "huelen": "smell", "a": "of/to", "jazmín": "jasmine",
                "y": "and", "café": "coffee", "recién": "freshly", "hecho": "made", "vivía": "lived", "una": "a",
                "niña": "girl", "llamada": "named", "Elena": "Elena", "Un": "A", "sábado": "Saturday", "por": "on",
                "tarde": "afternoon", "mientras": "while", "exploraba": "exploring", "desván": "attic", "su": "his/her",
                "encontró": "found", "caja": "box", "madera": "wood", "tallada": "carved", "con": "with", "extraños": "strange",
                "símbolos": "symbols", "Dentro": "Inside", "envuelto": "wrapped", "seda": "silk", "azul": "blue",
                "había": "there was", "un": "a", "Pero": "But", "no": "not", "era": "was", "común": "common",
                "marrón": "brown", "ni": "nor", "blanca": "white", "sino": "but rather", "color": "color", "dorado": "golden",
                "brillante": "bright", "que": "that", "parecía": "seemed", "emitir": "emit", "propia": "own"
            }

            for w_idx, word in enumerate(words):
                tokens.append(WordToken(
                    id=w_idx,
                    spanish=word,
                    english=word_dict.get(word.strip("¿?¡!.,:;")),
                ))

            # 4. Generate Audio
            audio_filename = f"audio_{batch_id}_{idx}.wav"
            audio_path = f"static/{audio_filename}"
            self.tts.generate_audio(sentence, audio_path)
            
            results.append(SentenceSegment(
                id=idx,
                original=sentence,
                translation=translation,
                tokens=tokens,
                audio_url=f"/static/{audio_filename}"
            ))
        return results
