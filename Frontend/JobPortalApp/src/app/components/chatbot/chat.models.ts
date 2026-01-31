export interface ChatRequest {
    question: string;
    collection_name?: string;
    k?: number;
    threshold?: number;
    model?: string;
}

export interface Source {
    source: string;
    content_preview: string;
    relevance_score: number;
}

export interface ChatResponse {
    answer: string;
    sources: Source[];
    documents_retrieved: number;
    documents_used: number;
    error: boolean;
    error_message: string | null;
}

export interface ChatMessage {
    type: 'user' | 'bot';
    content: string;
    sources?: Source[];
    timestamp: Date;
    isError?: boolean;
}
