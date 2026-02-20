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

    if (book) {
        return <Player title={book.title} segments={book.segments} />;
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full text-center mb-12">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-sm mb-6">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                    <span>Speechify Style Experience</span>
                </div>
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    Hermes <span className="text-indigo-600">Translator</span>
                </h1>
                <p className="mt-4 text-xl text-gray-500 font-medium">
                    Immersive bilingual reading with interlinear translations.
                </p>
            </div>

            {error && (
                <div className="max-w-2xl w-full mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="w-full max-w-2xl">
                <BookInput onSubmit={handleUpload} isLoading={isLoading} />
            </div>

            <footer className="mt-12 text-gray-400 text-sm font-medium uppercase tracking-widest">
                Built for Immersive Learning
            </footer>
        </main>
    );
}
