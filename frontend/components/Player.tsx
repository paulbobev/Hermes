import { useState, useRef, useEffect } from 'react';
import { SentenceSegment } from '../types';

interface PlayerProps {
    title: string;
    segments: SentenceSegment[];
}

export default function Player({ title, segments }: PlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentSegment = segments[currentIndex];

    // Auto-play when index changes
    useEffect(() => {
        let isCancelled = false;

        const playAudio = async () => {
            if (audioRef.current && currentSegment?.audio_url) {
                audioRef.current.src = `http://localhost:8000${currentSegment.audio_url}`;
                try {
                    await audioRef.current.play();
                } catch (e: any) {
                    if (!isCancelled && e.name !== 'AbortError') {
                        console.error("Playback failed", e);
                    }
                }
            }
        };

        playAudio();

        return () => {
            isCancelled = true;
        };
    }, [currentIndex, currentSegment]);

    const handleNext = () => {
        if (currentIndex < segments.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-8 p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

            <div className="w-full bg-white rounded-xl shadow-lg p-8 min-h-[300px] flex flex-col justify-center items-center text-center space-y-6">
                <div className="space-y-4">
                    <p className="text-2xl font-medium text-gray-900 leading-relaxed">
                        {currentSegment?.original}
                    </p>
                    <p className="text-lg text-gray-500 italic">
                        {currentSegment?.translation}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                    Previous
                </button>

                <audio
                    ref={audioRef}
                    controls
                    className="w-64"
                    onEnded={handleNext}
                />

                <button
                    onClick={handleNext}
                    disabled={currentIndex === segments.length - 1}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            <div className="text-sm text-gray-400">
                Wait a few seconds for next sentence if using mock audio...
            </div>
        </div>
    );
}
