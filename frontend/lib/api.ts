import { BookRequest, BookResponse } from "../types";

const API_BASE_URL = "http://localhost:8000/api";

export async function processBook(data: BookRequest): Promise<BookResponse> {
    const response = await fetch(`${API_BASE_URL}/process`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to process book");
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
