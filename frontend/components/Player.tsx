import { useState, useRef, useEffect } from 'react';
import { SentenceSegment, WordToken } from '../types';

interface PlayerProps {
    title: string;
    segments: SentenceSegment[];
}

export default function Player({ title, segments }: PlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const currentSegment = segments[currentIndex];

    // Handle word-level highlighting based on audio time
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (audio.duration && currentSegment?.tokens.length > 0) {
                // Simple linear mapping for now, can be improved with actual word timings
                const progress = audio.currentTime / audio.duration;
                const tokenIndex = Math.min(Math.floor(progress * currentSegment.tokens.length), currentSegment.tokens.length - 1);
                setCurrentWordIndex(tokenIndex);
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
    }, [currentIndex, currentSegment]);

    // Reset word index when sentence changes
    useEffect(() => {
        setCurrentWordIndex(-1);
    }, [currentIndex]);

    // Auto-play when index changes
    useEffect(() => {
        const playAudio = async () => {
            if (audioRef.current && currentSegment?.audio_url) {
                audioRef.current.src = `http://localhost:8000${currentSegment.audio_url}`;
                if (isPlaying) {
                    try {
                        await audioRef.current.play();
                    } catch (e) {
                        console.error("Playback failed", e);
                    }
                }
            }
        };
        playAudio();
    }, [currentIndex, currentSegment, isPlaying]);

    const handleTogglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleNext = () => {
        if (currentIndex < segments.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsPlaying(false);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const scrollToSentence = (index: number) => {
        setCurrentIndex(index);
        setIsPlaying(true);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/30">
            {/* Header Mirroring Screenshot */}
            <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-sm">
                        <span>AI</span>
                    </div>
                </div>
                <div className="text-sm font-bold text-gray-700 uppercase tracking-widest">{title}</div>
                <div className="flex items-center space-x-4">
                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-12 py-16 overflow-y-auto pb-48">
                <div className="space-y-12">
                    {segments.map((segment, sIdx) => {
                        const isActive = currentIndex === sIdx;
                        return (
                            <div
                                key={segment.id}
                                onClick={() => scrollToSentence(sIdx)}
                                className={`relative rounded-3xl transition-all duration-500 cursor-pointer p-8 -mx-8 flex flex-col space-y-4 ${isActive
                                        ? 'bg-indigo-50/80 shadow-sm border border-indigo-100/50'
                                        : 'hover:bg-gray-50/50'
                                    }`}
                            >
                                {/* Interlinear Word Blocks */}
                                <div className="flex flex-wrap gap-x-6 gap-y-8">
                                    {segment.tokens.map((token, tIdx) => (
                                        <div
                                            key={token.id}
                                            className={`inline-flex flex-col items-center transition-all duration-300 rounded-xl px-2 py-1 ${isActive && currentWordIndex === tIdx
                                                    ? 'bg-indigo-200/50 ring-4 ring-indigo-200/20 transform scale-105'
                                                    : ''
                                                }`}
                                        >
                                            <span className={`text-3xl font-serif leading-tight tracking-wide transition-colors duration-300 ${isActive ? 'text-indigo-900 font-medium' : 'text-gray-900'
                                                }`}>
                                                {token.spanish}
                                            </span>
                                            <span className={`text-[10px] font-bold mt-2 uppercase tracking-[0.2em] min-h-[1.2rem] transition-colors duration-300 ${isActive ? 'text-indigo-400' : 'text-gray-300'
                                                }`}>
                                                {token.english || ""}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Full Sentence Translation - NEW */}
                                {isActive && (
                                    <div className="pt-4 border-t border-indigo-100 flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="p-1 px-2 bg-indigo-100 text-indigo-500 rounded text-[10px] font-bold uppercase tracking-tighter mt-1">EN</div>
                                        <p className="text-lg text-indigo-600/80 italic font-medium leading-relaxed">
                                            {segment.translation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Styled Floating Player */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-[650px] z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 p-8 flex flex-col space-y-6">
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                            style={{ width: `${((currentIndex + (audioRef.current?.currentTime || 0) / (audioRef.current?.duration || 1)) / segments.length) * 100}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200 shadow-inner">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Voice" className="w-full h-full object-cover p-1" />
                            </div>
                            <div>
                                <div className="text-xs text-indigo-600 font-black uppercase tracking-widest">AI Narrator</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Premium Spanish Voice</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-10">
                            <button onClick={handlePrev} className="text-gray-300 hover:text-indigo-600 transition-all transform hover:scale-110 active:scale-90">
                                <svg className="w-8 h-8 rotate-180" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                            </button>

                            <button
                                onClick={handleTogglePlay}
                                className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:shadow-[0_10px_25px_rgba(79,70,229,0.4)] transition-all transform active:scale-95 hover:-translate-y-0.5"
                            >
                                {isPlaying ? (
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                                ) : (
                                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4.354v11.292L16.208 10 6 4.354z" /></svg>
                                )}
                            </button>

                            <button onClick={handleNext} className="text-gray-300 hover:text-indigo-600 transition-all transform hover:scale-110 active:scale-90">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                            </button>
                        </div>

                        <button className="flex items-center space-x-2 text-indigo-600 font-black text-xs bg-indigo-50/50 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors border border-indigo-100">
                            <span>1.2x</span>
                        </button>
                    </div>
                </div>
            </div>

            <audio ref={audioRef} onEnded={handleNext} style={{ display: 'none' }} />
        </div>
    );
}
