import { useState } from 'react';
import { BookRequest } from '../types';

interface BookInputProps {
    onSubmit: (data: BookRequest) => void;
    isLoading: boolean;
}

export default function BookInput({ onSubmit, isLoading }: BookInputProps) {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, text });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
            <div className="space-y-2">
                <label htmlFor="title" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Document Title</label>
                <input
                    type="text"
                    id="title"
                    placeholder="Enter book title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-lg font-medium focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white transition-all outline-none border-2"
                    required
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="text" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Spanish Text Content</label>
                <textarea
                    id="text"
                    placeholder="Paste your Spanish text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    className="block w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-lg font-medium focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white transition-all outline-none border-2 resize-none"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-6 rounded-2xl shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:bg-gray-300 transition-all transform active:scale-[0.98]"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Preparing Reader...
                    </>
                ) : 'Start Reading Experience'}
            </button>
        </form>
    );
}
