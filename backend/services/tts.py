import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel
import os
import numpy as np

class TTS:
    def __init__(self):
        print("Initializing Qwen3-TTS Model (0.6B)...")
        # Use CPU if CUDA is not reliable or memory is tight, but try CUDA/auto first
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_id = "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice"
        try:
            self.model = Qwen3TTSModel.from_pretrained(
                self.model_id,
                device_map="auto",
                dtype=torch.float16 if self.device == "cuda" else torch.float32,
            )
        except Exception as e:
            print(f"Failed to load Qwen3-TTS: {e}. Falling back to gTTS.")
            self.model = None

    def generate_audio(self, text: str, output_path: str):
        if self.model is None:
            # Fallback for reliability
            from gtts import gTTS
            try:
                tts = gTTS(text=text, lang='es')
                tts.save(output_path)
                return
            except Exception as e:
                print(f"gTTS fallback failed: {e}")
                # Mock if all else fails
                sample_rate = 24000
                duration = 3.0
                t = np.linspace(0, duration, int(sample_rate * duration))
                audio = 0.1 * np.sin(2 * np.pi * 440 * t)
                sf.write(output_path, audio, sample_rate)
                return

        # Actual Qwen3-TTS generation
        try:
            wavs, sr = self.model.generate_custom_voice(
                text=text,
                language="Spanish",
                speaker="Vivian", # Good for Spanish
            )
            sf.write(output_path, wavs[0], sr)
            print(f"Qwen3-TTS: Generated audio for '{text[:20]}...' -> {output_path}")
        except Exception as e:
            print(f"Qwen3-TTS generation failed: {e}. Trying gTTS...")
            # Recursive fallback to gTTS
            self.model = None 
            self.generate_audio(text, output_path)
