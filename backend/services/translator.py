import requests

class Translator:
    def __init__(self, endpoint_url="http://localhost:11434/api/generate", model="llama3.1"):
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
            })
            response.raise_for_status()
            translated_text = response.json().get("response", "").strip()
            
            # Clean up if the model accidentally wrapped in quotes
            if translated_text.startswith('"') and translated_text.endswith('"'):
                translated_text = translated_text[1:-1]
                
            return translated_text
        except Exception as e:
            print(f"Ollama Translation failed: {e}")
            return f"[Ollama Error] {text}"

