import requests

class Translator:
    def __init__(self, endpoint_url="http://localhost:11434/api/generate", model="qwen2.5:7b"):
        self.endpoint_url = endpoint_url
        self.model = model

    def translate(self, text: str) -> str:
        try:
            prompt = (
                "You are a strict and rigorous Spanish-to-English translator. "
                "You must ONLY reply with the direct English translation of the provided text. "
                "Do NOT include any commentary, notes, preambles like 'Here is the translation', or quotation marks. "
                f"Text to translate: {text}"
            )
            
            response = requests.post(self.endpoint_url, json={
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }, timeout=30) # Increased timeout for Ollama
            response.raise_for_status()
            translated_text = response.json().get("response", "").strip()
            
            # Clean up if the model accidentally wrapped in quotes
            if translated_text.startswith('"') and translated_text.endswith('"'):
                translated_text = translated_text[1:-1]
                
            return translated_text
        except Exception as e:
            print(f"Ollama Translation failed: {e}.")
            # Fallback to returning the text without prefixing if it's already Spanish-like
            # or use mock if available.
            return text

    def translate_words(self, words: list[str], context_sentence: str) -> dict:
        try:
            prompt = (
                f"You are a strict Spanish-to-English dictionary. "
                f"Given this sentence: '{context_sentence}'\n"
                f"Translate these words to English based on their context: {', '.join(words)}. "
                "Reply strictly with ONLY a valid, raw JSON object where keys are the Spanish words and values are the English translations. "
                "Do not include any markdown formatting, backticks, or explanations."
            )
            
            response = requests.post(self.endpoint_url, json={
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }, timeout=60)
            response.raise_for_status()
            text = response.json().get("response", "").strip()
            
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            import json
            return json.loads(text)
        except Exception as e:
            print(f"Word translation failed: {e}")
            return {}
