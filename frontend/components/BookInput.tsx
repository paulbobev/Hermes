import { useState } from 'react';
import { BookRequest } from '../types';

interface BookInputProps {
    onSubmit: (data: BookRequest) => void;
    isLoading: boolean;
    translationProgress?: { current: number; total: number; message: string };
    audioProgress?: { current: number; total: number; message: string };
}

export default function BookInput({ onSubmit, isLoading, translationProgress, audioProgress }: BookInputProps) {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, text });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="space-y-2">
                <label htmlFor="title" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Document Title</label>
                <input
                    type="text"
                    id="title"
                    placeholder="Enter book title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full rounded-2xl border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none border-2"
                    required
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="text" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Spanish Text Content</label>
                <textarea
                    id="text"
                    placeholder="Paste your Spanish text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    className="block w-full rounded-2xl border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none border-2 resize-none"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-4 px-6 rounded-2xl shadow-lg text-lg font-bold text-white bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:bg-gray-300 transition-all transform ${!isLoading && 'hover:bg-indigo-700 active:scale-[0.98]'}`}
            >
                {isLoading ? 'Processing Document...' : 'Start Reading Experience'}
            </button>

            {/* Progress Visualizer */}
            {isLoading && (
                <div className="space-y-6 pt-6 border-t border-gray-100 animate-in fade-in duration-500 mt-6">
                    {/* Translator Progress */}
                    {translationProgress && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-bold text-gray-500 uppercase tracking-wide">
                                <span className="flex items-center space-x-2">
                                    <svg className={`w-4 h-4 ${translationProgress.current < translationProgress.total ? 'animate-spin text-indigo-500' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24">
                                        {translationProgress.current < translationProgress.total ? (
                                            <>
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </>
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" d="M5 13l4 4L19 7" />
                                        )}
                                    </svg>
                                    <span>Translator Model</span>
                                </span>
                                <span className="text-gray-400 font-medium">
                                    {translationProgress.current} / {translationProgress.total}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                                    style={{ width: `${translationProgress.total > 0 ? (translationProgress.current / translationProgress.total) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 italic text-right">{translationProgress.message}</p>
                        </div>
                    )}

                    {/* Audio TTS Progress */}
                    {audioProgress && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-bold text-gray-500 uppercase tracking-wide">
                                <span className="flex items-center space-x-2">
                                    <svg className={`w-4 h-4 ${audioProgress.current < audioProgress.total ? 'animate-spin text-purple-500' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24">
                                        {audioProgress.current < audioProgress.total ? (
                                            <>
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </>
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" d="M5 13l4 4L19 7" />
                                        )}
                                    </svg>
                                    <span>Voice Model (Qwen-TTS)</span>
                                </span>
                                <span className="text-gray-400 font-medium">
                                    {audioProgress.current} / {audioProgress.total}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 transition-all duration-300 ease-out"
                                    style={{ width: `${audioProgress.total > 0 ? (audioProgress.current / audioProgress.total) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 italic text-right">{audioProgress.message}</p>
                        </div>
                    )}
                </div>
            )}
        </form>
    );
}
