export interface SentenceSegment {
    id: number;
    original: string;
    translation: string;
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
