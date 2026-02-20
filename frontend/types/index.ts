export interface WordToken {
    id: number;
    spanish: string;
    english: string | null;
}

export interface SentenceSegment {
    id: number;
    original: string;
    translation: string;
    tokens: WordToken[];
    audio_url: string | null;
}

export interface BookResponse {
    id: string;
    title: string;
    segments: SentenceSegment[];
}

export interface BookRequest {
    title: string;
    text: string;
}
