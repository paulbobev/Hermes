import torch
from qwen_tts import Qwen3TTSModel

try:
    model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice",
        device_map="auto",
        torch_dtype=torch.float16,
    )
    print("Languages:", model.get_supported_languages())
    print("Speakers:", model.get_supported_speakers())
except Exception as e:
    print(f"Error: {e}")
