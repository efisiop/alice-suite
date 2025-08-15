class DatabaseClient {
    constructor(baseUrl = '') {
        this.token = null;
        this.baseUrl = baseUrl || process.env.REACT_APP_API_URL || 'http://localhost:3001';
    }
    async getToken() {
        if (this.token)
            return this.token;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }
    async makeRequest(endpoint, options = {}) {
        const token = await this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
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
    async getBooks(options) {
        try {
            const query = options ? new URLSearchParams({
                page: options.page?.toString() || '1',
                limit: options.limit?.toString() || '20',
                sortBy: options.sortBy || 'created_at',
                sortOrder: options.sortOrder || 'desc'
            }).toString() : '';
            const data = await this.makeRequest(`/api/books${query ? `?${query}` : ''}`);
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch books' };
        }
    }
    async getBook(id) {
        try {
            const data = await this.makeRequest(`/api/books/${id}`);
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch book' };
        }
    }
    async searchBooks(query, options) {
        try {
            const params = new URLSearchParams({ q: query });
            if (options) {
                params.append('page', (options.page || 1).toString());
                params.append('limit', (options.limit || 20).toString());
            }
            const data = await this.makeRequest(`/api/books/search?${params.toString()}`);
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to search books' };
        }
    }
    // Reading Sessions
    async getReadingSessions(userId, options) {
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
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch reading sessions' };
        }
    }
    async getReadingSession(id) {
        try {
            const data = await this.makeRequest(`/api/sessions/${id}`);
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch reading session' };
        }
    }
    async createReadingSession(session) {
        try {
            const data = await this.makeRequest('/api/sessions', {
                method: 'POST',
                body: JSON.stringify(session)
            });
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to create reading session' };
        }
    }
    async updateReadingSession(id, updates) {
        try {
            const data = await this.makeRequest(`/api/sessions/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to update reading session' };
        }
    }
    async deleteReadingSession(id) {
        try {
            await this.makeRequest(`/api/sessions/${id}`, {
                method: 'DELETE'
            });
            return { data: null };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to delete reading session' };
        }
    }
    // Help Requests
    async getHelpRequests(userId, options) {
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
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch help requests' };
        }
    }
    async createHelpRequest(request) {
        try {
            const data = await this.makeRequest('/api/help', {
                method: 'POST',
                body: JSON.stringify(request)
            });
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to create help request' };
        }
    }
    async updateHelpRequest(id, updates) {
        try {
            const data = await this.makeRequest(`/api/help/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to update help request' };
        }
    }
    // Feedback
    async getFeedback(userId, bookId, options) {
        try {
            const params = new URLSearchParams();
            if (userId)
                params.append('userId', userId);
            if (bookId)
                params.append('bookId', bookId);
            if (options) {
                params.append('page', (options.page || 1).toString());
                params.append('limit', (options.limit || 20).toString());
            }
            const data = await this.makeRequest(`/api/feedback${params.toString() ? `?${params.toString()}` : ''}`);
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch feedback' };
        }
    }
    async createFeedback(feedback) {
        try {
            const data = await this.makeRequest('/api/feedback', {
                method: 'POST',
                body: JSON.stringify(feedback)
            });
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to create feedback' };
        }
    }
    // Highlights
    async getHighlights(userId, bookId) {
        try {
            const params = new URLSearchParams();
            if (bookId)
                params.append('bookId', bookId);
            const endpoint = `/api/highlights/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
            const data = await this.makeRequest(endpoint);
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch highlights' };
        }
    }
    async createHighlight(highlight) {
        try {
            const data = await this.makeRequest('/api/highlights', {
                method: 'POST',
                body: JSON.stringify(highlight)
            });
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to create highlight' };
        }
    }
    async deleteHighlight(id) {
        try {
            await this.makeRequest(`/api/highlights/${id}`, {
                method: 'DELETE'
            });
            return { data: null };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to delete highlight' };
        }
    }
    // Analytics
    async getUserAnalytics(userId) {
        try {
            const data = await this.makeRequest(`/api/analytics/user/${userId}`);
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch user analytics' };
        }
    }
    async getBookAnalytics(bookId) {
        try {
            const data = await this.makeRequest(`/api/analytics/book/${bookId}`);
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch book analytics' };
        }
    }
}
// Create singleton instance
export const dbClient = new DatabaseClient();
// Consultant-specific database client
export class ConsultantDatabaseClient extends DatabaseClient {
    async getAssignedReaders(consultantId) {
        try {
            const data = await this.makeRequest(`/api/consultants/${consultantId}/readers`);
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch assigned readers' };
        }
    }
    async getReaderProgress(readerId) {
        try {
            const data = await this.makeRequest(`/api/consultants/readers/${readerId}/progress`);
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch reader progress' };
        }
    }
    async sendPrompt(readerId, prompt) {
        try {
            const data = await this.makeRequest('/api/consultants/prompts', {
                method: 'POST',
                body: JSON.stringify({ readerId, prompt })
            });
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to send prompt' };
        }
    }
    async getConsultantAnalytics(consultantId) {
        try {
            const data = await this.makeRequest(`/api/consultants/${consultantId}/analytics`);
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Failed to fetch consultant analytics' };
        }
    }
}
export const consultantDbClient = new ConsultantDatabaseClient();
