import soundfile as sf
import torch
from transformers import AutoProcessor, AutoModel

class TTS:
    def __init__(self):
        print("Initializing Bark TTS Model...")
        # Bark is a very popular robust local TTS model that can handle multiple languages.
        self.device = "mps" if torch.backends.mps.is_available() else "cpu"
        self.processor = AutoProcessor.from_pretrained("suno/bark-small")
        self.model = AutoModel.from_pretrained("suno/bark-small").to(self.device)

    def generate_audio(self, text: str, output_path: str):
        # Prepare inputs
        inputs = self.processor(
            text=[text],
            return_tensors="pt",
        ).to(self.device)

        # Generate audio
        with torch.no_grad():
            audio_array = self.model.generate(
                **inputs,
                pad_token_id=10000,
            )
            
        audio_array = audio_array.cpu().numpy().squeeze()
        sample_rate = self.model.generation_config.sample_rate

        # Save to wav file
        sf.write(output_path, audio_array, sample_rate)
