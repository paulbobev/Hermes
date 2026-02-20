from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi.responses import StreamingResponse
import json

app = FastAPI(title="Spanish Translator Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
    ],  # Allow multiple frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from models import BookRequest, BookResponse
from services.processor import Processor
import uuid
import os

app.mount("/static", StaticFiles(directory="static"), name="static")

processor = Processor()

# Persistent Storage Logic
DATA_FILE = "data/books.json"

def load_books():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading books: {e}")
    return {}

def save_books(books):
    try:
        os.makedirs("data", exist_ok=True)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(books, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving books: {e}")

books_db = load_books()
jobs_db = {}

@app.post("/api/process", response_model=dict)
async def process_book(request: BookRequest):
    job_id = str(uuid.uuid4())
    book_id = str(uuid.uuid4())
    
    jobs_db[job_id] = {
        "status": "pending",
        "book_id": book_id,
        "request": request
    }
    
    return {"job_id": job_id}

@app.get("/api/jobs/{job_id}/stream")
async def stream_job(job_id: str):
    job = jobs_db.get(job_id)
    if not job:
        return {"error": "Job not found"}
        
    async def event_generator():
        request = job["request"]
        book_id = job["book_id"]
        job["status"] = "processing"
        
        try:
            async for event in processor.process_text_stream(request.text):
                if event["type"] == "complete":
                    book_data = {
                        "id": book_id,
                        "title": request.title,
                        "segments": [s.model_dump() for s in event["results"]]
                    }
                    books_db[book_id] = book_data
                    save_books(books_db)
                    job["status"] = "completed"
                    yield f"data: {json.dumps({'status': 'completed', 'book_id': book_id})}\n\n"
                else:
                    yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            job["status"] = "failed"
            yield f"data: {json.dumps({'status': 'failed', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/books")
async def get_books():
    # Return a list of book summaries without the heavy segments
    summaries = []
    for book_id, b_data in books_db.items():
        summaries.append({
            "id": book_id,
            "title": b_data.get("title", "Untitled")
        })
    return summaries

@app.get("/api/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: str):
    return books_db.get(book_id)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
