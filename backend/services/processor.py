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
                "el": "the", "la": "the", "lo": "it/the", "los": "the", "las": "the",
                "un": "a", "una": "a", "unos": "some", "unas": "some",
                "de": "of", "del": "of the", "en": "in", "y": "and", "a": "to/at",
                "reloj": "clock/watch", "arena": "sand", "abuela": "grandmother",
                "pequeño": "small", "pueblo": "town", "san": "saint", "juan": "john",
                "donde": "where", "calles": "streets", "huelen": "smell", "jazmín": "jasmine",
                "café": "coffee", "recién": "freshly", "hecho": "made", "vivía": "lived",
                "niña": "girl", "llamada": "named", "elena": "elena", "sábado": "saturday", "por": "on",
                "tarde": "afternoon", "mientras": "while", "exploraba": "exploring", "desván": "attic", "su": "his/her",
                "encontró": "found", "caja": "box", "madera": "wood", "tallada": "carved", "con": "with", "extraños": "strange",
                "símbolos": "symbols", "dentro": "inside", "envuelto": "wrapped", "seda": "silk", "azul": "blue",
                "había": "there was", "pero": "but", "no": "not", "era": "was", "común": "common",
                "marrón": "brown", "ni": "nor", "blanca": "white", "sino": "but rather", "color": "color", "dorado": "golden",
                "brillante": "bright", "que": "that", "parecía": "seemed", "emitir": "emit", "propia": "own", "luz": "light"
            }

            for w_idx, word in enumerate(words):
                clean_word = word.strip("¿?¡!.,:;").lower()
                tokens.append(WordToken(
                    id=w_idx,
                    spanish=word,
                    english=word_dict.get(clean_word),
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
