export interface RealtimeClientConfig {
    url: string;
    token?: string;
    autoConnect?: boolean;
    reconnectAttempts?: number;
    reconnectDelay?: number;
}
export declare class RealtimeClient {
    private socket;
    private config;
    private eventHandlers;
    private connectionStatus;
    constructor(config: RealtimeClientConfig);
    connect(): void;
    disconnect(): void;
    private setupEventListeners;
    on(event: string, handler: Function): void;
    off(event: string, handler?: Function): void;
    private emit;
    emitEvent(eventType: string, data: any): void;
    subscribeToConsultantEvents(eventTypes?: string[]): void;
    unsubscribeFromConsultantEvents(): void;
    getOnlineReaders(): void;
    getRecentEvents(limit?: number, userId?: string): void;
    joinRoom(room: string): void;
    leaveRoom(room: string): void;
    isConnected(): boolean;
    getConnectionStatus(): string;
    updateToken(token: string): void;
}
export declare class ReaderRealtimeClient extends RealtimeClient {
    constructor(config: RealtimeClientConfig);
    trackLogin(): void;
    trackLogout(): void;
    trackPageSync(bookId: string, pageNumber: number, section?: string): void;
    trackSectionSync(bookId: string, section: string): void;
    trackDefinitionLookup(word: string, definition: string, context?: string): void;
    trackAIQuery(query: string, response: string): void;
    trackHelpRequest(type: string, description: string, context?: any): void;
    trackFeedback(type: string, content: string, rating?: number): void;
    trackNoteCreation(bookId: string, pageNumber: number, content: string): void;
    trackQuizAttempt(bookId: string, quizId: string, score: number, total: number): void;
}
export declare class ConsultantRealtimeClient extends RealtimeClient {
    constructor(config: RealtimeClientConfig);
    subscribeToAllEvents(): void;
    subscribeToHelpEvents(): void;
    subscribeToProgressEvents(): void;
    onReaderActivity(handler: (data: any) => void): void;
    onOnlineReaders(handler: (data: any) => void): void;
    onRecentEvents(handler: (data: any) => void): void;
}
export declare const createRealtimeClient: (config: RealtimeClientConfig) => RealtimeClient;
export declare const createReaderClient: (config: RealtimeClientConfig) => ReaderRealtimeClient;
export declare const createConsultantClient: (config: RealtimeClientConfig) => ConsultantRealtimeClient;
