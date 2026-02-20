"use client";

import { useState, useEffect } from 'react';
import BookInput from '@/components/BookInput';
import Player from '@/components/Player';
import { processBook, processBookStream, getBook, getBooks } from '@/lib/api';
import { BookRequest, BookResponse } from '@/types';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
    const [book, setBook] = useState<BookResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [translationProgress, setTranslationProgress] = useState<{ current: number, total: number, message: string } | undefined>();
    const [audioProgress, setAudioProgress] = useState<{ current: number, total: number, message: string } | undefined>();

    // Library State
    const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
    const [savedBooks, setSavedBooks] = useState<{ id: string, title: string }[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    useEffect(() => {
        if (activeTab === 'library') {
            loadLibrary();
        }
    }, [activeTab]);

    const loadLibrary = async () => {
        setIsLoadingLibrary(true);
        try {
            const books = await getBooks();
            setSavedBooks(books);
        } catch (err) {
            setError('Failed to load library');
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    const handleLoadArchivedBook = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const finalBook = await getBook(id);
            setBook(finalBook);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong loading the book');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (data: BookRequest) => {
        setIsLoading(true);
        setError(null);
        setTranslationProgress({
            current: 0,
            total: 100,
            message: 'Initializing translation models...'
        });
        setAudioProgress({
            current: 0,
            total: 100,
            message: 'Initializing TTS models...'
        });

        try {
            // 1. Start the job
            const { job_id } = await processBook(data);

            // 2. Listen to progress stream
            const bookId = await processBookStream(job_id, (event) => {
                console.log("SSE Event Received:", event);

                if (event.type === 'progress') {
                    setTranslationProgress({
                        current: event.translation,
                        total: event.total,
                        message: event.message
                    });
                    setAudioProgress({
                        current: event.audio,
                        total: event.total,
                        message: event.message.includes('audio') ? event.message : 'Waiting for translation...'
                    });
                }
            });

            // 3. Fetch final book data
            const finalBook = await getBook(bookId);
            setBook(finalBook);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClosePlayer = () => {
        setBook(null);
    };

    if (book) {
        return <Player title={book.title} segments={book.segments} onClose={handleClosePlayer} />;
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 transition-colors duration-300 relative">
            {/* Dark Mode Toggle */}
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>

            <div className="max-w-2xl w-full text-center mb-10 mt-8">
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                    Hermes <span className="text-indigo-600 dark:text-indigo-400">Translator</span>
                </h1>
            </div>

            {error && (
                <div className="max-w-2xl w-full mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800/30 flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="max-w-md w-full mb-8 bg-gray-200/50 dark:bg-gray-800/50 p-1.5 rounded-2xl flex items-center space-x-2 border border-gray-100/10 dark:border-gray-700/50 shadow-inner">
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-gray-700/40'}`}
                >
                    New Translation
                </button>
                <button
                    onClick={() => setActiveTab('library')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'library' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-gray-700/40'}`}
                >
                    My Library
                </button>
            </div>

            <div className="w-full max-w-2xl relative">
                {activeTab === 'create' ? (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <BookInput
                            onSubmit={handleUpload}
                            isLoading={isLoading}
                            translationProgress={translationProgress}
                            audioProgress={audioProgress}
                        />
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-300 min-h-[400px]">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Translations</h2>
                        {isLoadingLibrary ? (
                            <div className="flex justify-center items-center h-48">
                                <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : savedBooks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 space-y-4">
                                <svg className="w-12 h-12 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                <p className="font-medium">Library is empty. Create a new translation first!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {savedBooks.map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => handleLoadArchivedBook(b.id)}
                                        className="w-full text-left p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group flex items-center justify-between pointer-events-auto"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-gray-800 group-hover:shadow-sm transition-all border border-gray-100 dark:border-gray-800">
                                                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                            </div>
                                            <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors uppercase tracking-widest text-sm">{b.title}</span>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <footer className="mt-12 text-gray-400 text-sm font-medium uppercase tracking-widest">
                Built for Immersive Learning
            </footer>
        </main>
    );
}
