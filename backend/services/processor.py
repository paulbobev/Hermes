from .translator import Translator
from .tts import TTS
from models import SentenceSegment, WordToken
import re
import uuid

class Processor:
    def __init__(self):
        self.translator = Translator()
        self.tts = TTS()

    async def process_text_stream(self, text: str):
        # 1. Segment text (Simple regex for splitting by . ! ?)
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s*', text) if s.strip()]
        
        batch_id = str(uuid.uuid4())[:8]
        results = []
        for idx, sentence in enumerate(sentences):
            if not sentence.strip():
                continue
                
            yield {"type": "progress", "translation": idx, "audio": idx, "total": len(sentences), "message": f"Translating sentence {idx+1}/{len(sentences)}..."}
            
            # 2. Translate full sentence
            translation = self.translator.translate(sentence)
            
            yield {"type": "progress", "translation": idx + 1, "audio": idx, "total": len(sentences), "message": f"Generating audio for sentence {idx+1}/{len(sentences)}..."}
            
            # 3. Create word tokens
            words = sentence.split()
            tokens = []
            
            clean_words = [word.strip("¿?¡!.,:;").lower() for word in words]
            # Use LLM to dynamically translate words in context
            word_dict = self.translator.translate_words(clean_words, sentence)
            
            for w_idx, (word, clean_word) in enumerate(zip(words, clean_words)):
                english_translation = word_dict.get(clean_word) or word_dict.get(word) or ""
                tokens.append(WordToken(
                    id=w_idx,
                    spanish=word,
                    english=english_translation,
                ))

            # 4. Generate Audio
            audio_filename = f"audio_{batch_id}_{idx}.wav"
            audio_path = f"static/{audio_filename}"
            self.tts.generate_audio(sentence, audio_path)
            
            yield {"type": "progress", "translation": idx + 1, "audio": idx + 1, "total": len(sentences), "message": f"Completed sentence {idx+1}/{len(sentences)}"}
            
            results.append(SentenceSegment(
                id=idx,
                original=sentence,
                translation=translation,
                tokens=tokens,
                audio_url=f"/static/{audio_filename}"
            ))
            
        yield {"type": "complete", "results": results}
