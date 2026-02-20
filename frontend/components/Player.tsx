import { useState, useRef, useEffect } from 'react';
import { SentenceSegment, WordToken } from '../types';
import { ThemeToggle } from '@/components/ThemeToggle';

interface PlayerProps {
    title: string;
    segments: SentenceSegment[];
    onClose: () => void;
}

export default function Player({ title, segments, onClose }: PlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);

    const availableSpeeds = [0.75, 1.0, 1.25, 1.5, 2.0];

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
                audioRef.current.playbackRate = playbackRate;
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

    // Apply playback rate when state changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

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

    const handleSpeedChange = () => {
        const currentIndexInArray = availableSpeeds.indexOf(playbackRate);
        const nextIndex = (currentIndexInArray + 1) % availableSpeeds.length;
        setPlaybackRate(availableSpeeds[nextIndex]);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-gray-900/90 transition-colors duration-300">
            {/* Top Bar with Back Button - RESTORED and styled for dark mode */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100/50 dark:border-gray-800/50 flex items-center justify-between px-6 z-40">
                <button
                    onClick={onClose}
                    className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-sm group"
                >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    <span>Back to Library</span>
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-12 pt-24 pb-48 overflow-y-auto mt-16">
                <div className="space-y-12">
                    {segments.map((segment, sIdx) => {
                        const isActive = currentIndex === sIdx;
                        return (
                            <div
                                key={segment.id}
                                onClick={() => scrollToSentence(sIdx)}
                                className={`relative rounded-3xl transition-all duration-500 cursor-pointer p-8 -mx-8 flex flex-col space-y-4 ${isActive
                                    ? 'bg-indigo-50/80 dark:bg-indigo-900/20 shadow-sm border border-indigo-100/50 dark:border-indigo-800/30'
                                    : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border border-transparent'
                                    }`}
                            >
                                {/* Interlinear Word Blocks */}
                                <div className="flex flex-wrap gap-x-6 gap-y-8">
                                    {segment.tokens.map((token, tIdx) => (
                                        <div
                                            key={token.id}
                                            className={`inline-flex flex-col items-center transition-all duration-300 rounded-xl px-2 py-1 ${isActive && currentWordIndex === tIdx
                                                ? 'bg-indigo-200/50 dark:bg-indigo-500/30 ring-4 ring-indigo-200/20 dark:ring-indigo-500/20 transform scale-105'
                                                : ''
                                                }`}
                                        >
                                            <span className={`text-3xl font-serif leading-tight tracking-wide transition-colors duration-300 ${isActive ? 'text-indigo-900 dark:text-indigo-200 font-medium' : 'text-gray-900 dark:text-gray-300'
                                                }`}>
                                                {token.spanish}
                                            </span>
                                            <span className={`text-[10px] font-bold mt-2 uppercase tracking-[0.2em] min-h-[1.2rem] transition-colors duration-300 ${isActive ? 'text-indigo-400 dark:text-indigo-300' : 'text-gray-300 dark:text-gray-600'
                                                }`}>
                                                {token.english || ""}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Full Sentence Translation - NEW */}
                                {isActive && (
                                    <div className="pt-4 border-t border-indigo-100 dark:border-indigo-900/50 flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="p-1 px-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-400 rounded text-[10px] font-bold uppercase tracking-tighter mt-1">EN</div>
                                        <p className="text-lg text-indigo-600/80 dark:text-indigo-300/80 italic font-medium leading-relaxed">
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
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 p-8 flex flex-col space-y-6 transition-colors duration-300">
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                            style={{ width: `${((currentIndex + (audioRef.current?.currentTime || 0) / (audioRef.current?.duration || 1)) / segments.length) * 100}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                        </div>
                        <div className="flex items-center space-x-10">
                            <button onClick={handlePrev} className="text-gray-400 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all transform hover:scale-110 active:scale-90">
                                <svg className="w-8 h-8 rotate-180" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                            </button>

                            <button
                                onClick={handleTogglePlay}
                                className="w-16 h-16 bg-indigo-600 dark:bg-indigo-500 text-white rounded-3xl flex items-center justify-center shadow-[0_10px_20px_rgba(79,70,229,0.3)] dark:shadow-[0_10px_20px_rgba(99,102,241,0.2)] hover:bg-indigo-700 dark:hover:bg-indigo-400 hover:shadow-[0_10px_25px_rgba(79,70,229,0.4)] transition-all transform active:scale-95 hover:-translate-y-0.5"
                            >
                                {isPlaying ? (
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                                ) : (
                                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4.354v11.292L16.208 10 6 4.354z" /></svg>
                                )}
                            </button>

                            <button onClick={handleNext} className="text-gray-400 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all transform hover:scale-110 active:scale-90">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                            </button>
                        </div>

                        <button
                            onClick={handleSpeedChange}
                            className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-black text-xs bg-indigo-50/50 dark:bg-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-xl transition-colors border border-indigo-100 dark:border-indigo-800/50 min-w-[64px] justify-center"
                        >
                            <span>{playbackRate}x</span>
                        </button>
                    </div>
                </div>
            </div>

            <audio ref={audioRef} onEnded={handleNext} style={{ display: 'none' }} />
        </div>
    );
}
