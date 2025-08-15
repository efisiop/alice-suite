// Auth client for handling authentication
class AuthClient {
    constructor(baseUrl = '') {
        this.token = null;
        this.baseUrl = baseUrl || process.env.REACT_APP_API_URL || 'http://localhost:3001';
    }
    async getCurrentUser() {
        try {
            const token = this.getToken();
            if (!token) {
                return { error: 'No token found' };
            }
            const response = await fetch(`${this.baseUrl}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                return { error: 'Failed to fetch user' };
            }
            const data = await response.json();
            return { data };
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async signIn(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok && data.token) {
                this.setToken(data.token);
                return { data: data.user };
            }
            else {
                return { error: data.error || 'Authentication failed' };
            }
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Network error' };
        }
    }
    async signOut() {
        try {
            const token = this.getToken();
            if (token) {
                await fetch(`${this.baseUrl}/api/auth/signout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
            this.clearToken();
            return { data: null };
        }
        catch (error) {
            this.clearToken();
            return { error: error instanceof Error ? error.message : 'Error during signout' };
        }
    }
    async signUp(email, password, firstName, lastName) {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, firstName, lastName })
            });
            const data = await response.json();
            if (response.ok && data.token) {
                this.setToken(data.token);
                return { data: data.user };
            }
            else {
                return { error: data.error || 'Signup failed' };
            }
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Network error' };
        }
    }
    setToken(token) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }
    getToken() {
        if (this.token)
            return this.token;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }
    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }
    isAuthenticated() {
        return this.getToken() !== null;
    }
    async getSession() {
        return this.getCurrentUser();
    }
    async refreshToken() {
        try {
            const currentToken = this.getToken();
            if (!currentToken) {
                return { error: 'No token to refresh' };
            }
            const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok && data.token) {
                this.setToken(data.token);
                return { data: data.token };
            }
            else {
                this.clearToken();
                return { error: data.error || 'Token refresh failed' };
            }
        }
        catch (error) {
            this.clearToken();
            return { error: error instanceof Error ? error.message : 'Network error' };
        }
    }
}
// Create singleton instances
export const authClient = new AuthClient();
// Consultant-specific auth client (extends base functionality)
export class ConsultantAuthClient extends AuthClient {
    async signInConsultant(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/consultant/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok && data.token) {
                this.setToken(data.token);
                return { data: data.user };
            }
            else {
                return { error: data.error || 'Consultant authentication failed' };
            }
        }
        catch (error) {
            return { error: error instanceof Error ? error.message : 'Network error' };
        }
    }
    async getConsultantProfile() {
        return this.getCurrentUser(); // Same endpoint for now
    }
}
export const consultantAuthClient = new ConsultantAuthClient();
