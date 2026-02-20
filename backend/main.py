from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

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

app.mount("/static", StaticFiles(directory="static"), name="static")

processor = Processor()

# In-memory storage for demo purposes
books_db = {}

@app.post("/api/process", response_model=BookResponse)
async def process_book(request: BookRequest):
    book_id = str(uuid.uuid4())
    segments = processor.process_text(request.text)
    
    book_data = {
        "id": book_id,
        "title": request.title,
        "segments": segments
    }
    books_db[book_id] = book_data
    return book_data

@app.get("/api/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: str):
    return books_db.get(book_id)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
