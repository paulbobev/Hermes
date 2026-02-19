# Spanish Learning App

A web application that mimics Spotify's translated lyrics feature for books.

## Getting Started

To run the application, you need to start both the backend and the frontend.

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

---

### 1. Launch the Backend (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python main.py
   ```
   The backend will be available at `http://localhost:8000`.

### 2. Launch the Frontend (Next.js)

1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

---

## Project Structure

- `frontend/`: Next.js web application.
- `backend/`: FastAPI Python server.
- `AI-Plan.md`: Technical roadmap and architecture details.
