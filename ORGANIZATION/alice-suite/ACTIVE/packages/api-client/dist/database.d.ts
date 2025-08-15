import { Book, ReadingSession, HelpRequest, Feedback, Highlight, ApiResponse, PaginationOptions, PaginatedResponse } from './types';
declare class DatabaseClient {
    private baseUrl;
    private token;
    constructor(baseUrl?: string);
    private getToken;
    protected makeRequest(endpoint: string, options?: RequestInit): Promise<any>;
    getBooks(options?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<Book>>>;
    getBook(id: string): Promise<ApiResponse<Book>>;
    searchBooks(query: string, options?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<Book>>>;
    getReadingSessions(userId?: string, options?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<ReadingSession>>>;
    getReadingSession(id: string): Promise<ApiResponse<ReadingSession>>;
    createReadingSession(session: Omit<ReadingSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ReadingSession>>;
    updateReadingSession(id: string, updates: Partial<ReadingSession>): Promise<ApiResponse<ReadingSession>>;
    deleteReadingSession(id: string): Promise<ApiResponse<null>>;
    getHelpRequests(userId?: string, options?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<HelpRequest>>>;
    createHelpRequest(request: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<HelpRequest>>;
    updateHelpRequest(id: string, updates: Partial<HelpRequest>): Promise<ApiResponse<HelpRequest>>;
    getFeedback(userId?: string, bookId?: string, options?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<Feedback>>>;
    createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Feedback>>;
    getHighlights(userId: string, bookId?: string): Promise<ApiResponse<Highlight[]>>;
    createHighlight(highlight: Omit<Highlight, 'id' | 'createdAt'>): Promise<ApiResponse<Highlight>>;
    deleteHighlight(id: string): Promise<ApiResponse<null>>;
    getUserAnalytics(userId: string): Promise<ApiResponse<any>>;
    getBookAnalytics(bookId: string): Promise<ApiResponse<any>>;
}
export declare const dbClient: DatabaseClient;
export declare class ConsultantDatabaseClient extends DatabaseClient {
    getAssignedReaders(consultantId: string): Promise<ApiResponse<any[]>>;
    getReaderProgress(readerId: string): Promise<ApiResponse<any>>;
    sendPrompt(readerId: string, prompt: string): Promise<ApiResponse<any>>;
    getConsultantAnalytics(consultantId: string): Promise<ApiResponse<any>>;
}
export declare const consultantDbClient: ConsultantDatabaseClient;
export {};
