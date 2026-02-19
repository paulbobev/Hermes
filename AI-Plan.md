# Spanish Translator Book Reading Website Plan

The goal is to build a web application that mimics Spotify's translated lyrics feature for books. It will take text input (Spanish), translate it sentence-by-sentence to English, and generate audio using a local TTS model (Qwen-TTS 1.7B).

## User Review Required

> [!IMPORTANT]
> **Model Running Requirements**: Running Qwen-TTS 1.7B and LibreTranslate locally requires significant computational resources (GPU/RAM). The backend will be designed to interface with these, but ensuring they run on the local machine is a prerequisite for full functionality. I will implement mocks/placeholders for development.

## Proposed Changes

### Frontend (Next.js + Tailwind CSS)
- **Framework**: Next.js (App Router) for a modern, responsive web application.
- **Styling**: Tailwind CSS for rapid UI development.
- **State Management**: React Context or Zustand for managing player state (current sentence, audio playback).
- **Audio**: HTML5 Audio API or a wrapper like `react-use-audio-player` for precise control.

#### File Structure
- `frontend/`: Root for the Next.js app.
- `frontend/components/Player.tsx`: The main player component handling text display and audio sync.
- `frontend/components/TextDisplay.tsx`: Renders the Spanish/English sentence pairs.
- `frontend/lib/api.ts`: API client to communicate with the Python backend.

### Backend (FastAPI + Python)
- **Framework**: FastAPI for high performance and easy integration with Python ML libraries.
- **Data Model**: Pydantic models for request/response (e.g., `BookRequest`, `SentenceSegment`).
- **Processing Pipeline**:
    1.  **Segmentation**: Split text into sentences.
    2.  **Translation**: Call LibreTranslate (local instance or API).
    3.  **TTS**: Call Qwen-TTS (local model).
    4.  **Alignment**: Map audio timestamps to sentences (if possible) or generate separate audio per sentence. *Generating audio per sentence is easier for synchronization.*

#### File Structure
- `backend/`: Root for the backend.
- `backend/main.py`: FastAPI entry point.
- `backend/services/translator.py`: Interface for LibreTranslate.
- `backend/services/tts.py`: Interface for Qwen-TTS.
- `backend/services/processor.py`: Orchestrates segmentation, translation, and TTS.

## Verification Plan

### Automated Tests
- **Backend Tests**: `pytest` for testing the segmentation logic and API endpoints. Mocks will be used for the heavy ML models.
- **Frontend Tests**: Basic component rendering tests.

### Manual Verification
1.  **Upload Flow**: Upload a sample Spanish text file.
2.  **Processing**: Verify that the backend splits it into sentences and generates mock audio/translation.
3.  **Playback**: Verify that clicking "Play" advances through sentences and highlights text correctly.
