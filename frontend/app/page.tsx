"use client";

import { useState } from 'react';
import BookInput from '@/components/BookInput';
import Player from '@/components/Player';
import { processBook } from '@/lib/api';
import { BookRequest, BookResponse } from '@/types';

export default function Home() {
    const [book, setBook] = useState<BookResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async (data: BookRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await processBook(data);
            setBook(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center mb-8">
                <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">
                    Spanish Translator
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                    Learn Spanish by reading books with synchronized audio and translation.
                </p>
            </div>

            {error && (
                <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {!book ? (
                <BookInput onSubmit={handleUpload} isLoading={isLoading} />
            ) : (
                <Player title={book.title} segments={book.segments} />
            )}
        </main>
    );
}
