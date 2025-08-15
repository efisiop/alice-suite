import {
  Book,
  ReadingSession,
  HelpRequest,
  Feedback,
  Highlight,
  ApiResponse,
  PaginationOptions,
  PaginatedResponse
} from './types';

class DatabaseClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }

  private async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  protected async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Books
  async getBooks(options?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<Book>>> {
    try {
      const query = options ? new URLSearchParams({
        page: options.page?.toString() || '1',
        limit: options.limit?.toString() || '20',
        sortBy: options.sortBy || 'created_at',
        sortOrder: options.sortOrder || 'desc'
      }).toString() : '';

      const data = await this.makeRequest(`/api/books${query ? `?${query}` : ''}`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch books' };
    }
  }

  async getBook(id: string): Promise<ApiResponse<Book>> {
    try {
      const data = await this.makeRequest(`/api/books/${id}`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch book' };
    }
  }

  async searchBooks(query: string, options?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<Book>>> {
    try {
      const params = new URLSearchParams({ q: query });
      if (options) {
        params.append('page', (options.page || 1).toString());
        params.append('limit', (options.limit || 20).toString());
      }

      const data = await this.makeRequest(`/api/books/search?${params.toString()}`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to search books' };
    }
  }

  // Reading Sessions
  async getReadingSessions(userId?: string, options?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<ReadingSession>>> {
    try {
      const query = options ? new URLSearchParams({
        page: options.page?.toString() || '1',
        limit: options.limit?.toString() || '20',
        sortBy: options.sortBy || 'last_activity',
        sortOrder: options.sortOrder || 'desc'
      }).toString() : '';

      const endpoint = userId ? `/api/sessions/user/${userId}` : '/api/sessions';
      const data = await this.makeRequest(`${endpoint}${query ? `?${query}` : ''}`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch reading sessions' };
    }
  }

  async getReadingSession(id: string): Promise<ApiResponse<ReadingSession>> {
    try {
      const data = await this.makeRequest(`/api/sessions/${id}`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch reading session' };
    }
  }

  async createReadingSession(session: Omit<ReadingSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ReadingSession>> {
    try {
      const data = await this.makeRequest('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(session)
      });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create reading session' };
    }
  }

  async updateReadingSession(id: string, updates: Partial<ReadingSession>): Promise<ApiResponse<ReadingSession>> {
    try {
      const data = await this.makeRequest(`/api/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update reading session' };
    }
  }

  async deleteReadingSession(id: string): Promise<ApiResponse<null>> {
    try {
      await this.makeRequest(`/api/sessions/${id}`, {
        method: 'DELETE'
      });
      return { data: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete reading session' };
    }
  }

  // Help Requests
  async getHelpRequests(userId?: string, options?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<HelpRequest>>> {
    try {
      const query = options ? new URLSearchParams({
        page: options.page?.toString() || '1',
        limit: options.limit?.toString() || '20',
        sortBy: options.sortBy || 'created_at',
        sortOrder: options.sortOrder || 'desc'
      }).toString() : '';

      const endpoint = userId ? `/api/help/user/${userId}` : '/api/help';
      const data = await this.makeRequest(`${endpoint}${query ? `?${query}` : ''}`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch help requests' };
    }
  }

  async createHelpRequest(request: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<HelpRequest>> {
    try {
      const data = await this.makeRequest('/api/help', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create help request' };
    }
  }

  async updateHelpRequest(id: string, updates: Partial<HelpRequest>): Promise<ApiResponse<HelpRequest>> {
    try {
      const data = await this.makeRequest(`/api/help/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update help request' };
    }
  }

  // Feedback
  async getFeedback(userId?: string, bookId?: string, options?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<Feedback>>> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (bookId) params.append('bookId', bookId);
      if (options) {
        params.append('page', (options.page || 1).toString());
        params.append('limit', (options.limit || 20).toString());
      }

      const data = await this.makeRequest(`/api/feedback${params.toString() ? `?${params.toString()}` : ''}`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch feedback' };
    }
  }

  async createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Feedback>> {
    try {
      const data = await this.makeRequest('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(feedback)
      });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create feedback' };
    }
  }

  // Highlights
  async getHighlights(userId: string, bookId?: string): Promise<ApiResponse<Highlight[]>> {
    try {
      const params = new URLSearchParams();
      if (bookId) params.append('bookId', bookId);

      const endpoint = `/api/highlights/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await this.makeRequest(endpoint);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch highlights' };
    }
  }

  async createHighlight(highlight: Omit<Highlight, 'id' | 'createdAt'>): Promise<ApiResponse<Highlight>> {
    try {
      const data = await this.makeRequest('/api/highlights', {
        method: 'POST',
        body: JSON.stringify(highlight)
      });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create highlight' };
    }
  }

  async deleteHighlight(id: string): Promise<ApiResponse<null>> {
    try {
      await this.makeRequest(`/api/highlights/${id}`, {
        method: 'DELETE'
      });
      return { data: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete highlight' };
    }
  }

  // Analytics
  async getUserAnalytics(userId: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.makeRequest(`/api/analytics/user/${userId}`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch user analytics' };
    }
  }

  async getBookAnalytics(bookId: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.makeRequest(`/api/analytics/book/${bookId}`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch book analytics' };
    }
  }
}

// Create singleton instance
export const dbClient = new DatabaseClient();

// Consultant-specific database client
export class ConsultantDatabaseClient extends DatabaseClient {
  async getAssignedReaders(consultantId: string): Promise<ApiResponse<any[]>> {
    try {
      const data = await this.makeRequest(`/api/consultants/${consultantId}/readers`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch assigned readers' };
    }
  }

  async getReaderProgress(readerId: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.makeRequest(`/api/consultants/readers/${readerId}/progress`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch reader progress' };
    }
  }

  async sendPrompt(readerId: string, prompt: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.makeRequest('/api/consultants/prompts', {
        method: 'POST',
        body: JSON.stringify({ readerId, prompt })
      });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to send prompt' };
    }
  }

  async getConsultantAnalytics(consultantId: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.makeRequest(`/api/consultants/${consultantId}/analytics`);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch consultant analytics' };
    }
  }
}

export const consultantDbClient = new ConsultantDatabaseClient();