import { BookRequest, BookResponse } from "../types";

const API_BASE_URL = "http://localhost:8000/api";

export async function processBook(data: BookRequest): Promise<{ job_id: string }> {
    const response = await fetch(`${API_BASE_URL}/process`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to start processing book");
    }

    return response.json();
}

export function processBookStream(
    jobId: string,
    onProgress: (event: any) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const eventSource = new EventSource(`${API_BASE_URL}/jobs/${jobId}/stream`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.status === 'completed') {
                eventSource.close();
                resolve(data.book_id);
            } else if (data.status === 'failed') {
                eventSource.close();
                reject(new Error(data.message || 'Processing failed'));
            } else {
                onProgress(data);
            }
        };

        eventSource.onerror = (error) => {
            eventSource.close();
            reject(new Error("SSE Connection Error"));
        };
    });
}

export async function getBooks(): Promise<{ id: string, title: string }[]> {
    const response = await fetch(`${API_BASE_URL}/books`);

    if (!response.ok) {
        throw new Error("Failed to fetch books library");
    }

    return response.json();
}

export async function getBook(id: string): Promise<BookResponse> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);

    if (!response.ok) {
        throw new Error("Failed to fetch book");
    }

    return response.json();
}
