import { AuthUser, ApiResponse } from './types';
declare class AuthClient {
    protected baseUrl: string;
    private token;
    constructor(baseUrl?: string);
    getCurrentUser(): Promise<ApiResponse<AuthUser>>;
    signIn(email: string, password: string): Promise<ApiResponse<AuthUser>>;
    signOut(): Promise<ApiResponse<null>>;
    signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<ApiResponse<AuthUser>>;
    setToken(token: string): void;
    getToken(): string | null;
    clearToken(): void;
    isAuthenticated(): boolean;
    getSession(): Promise<ApiResponse<AuthUser>>;
    refreshToken(): Promise<ApiResponse<string>>;
}
export declare const authClient: AuthClient;
export declare class ConsultantAuthClient extends AuthClient {
    signInConsultant(email: string, password: string): Promise<ApiResponse<AuthUser>>;
    getConsultantProfile(): Promise<ApiResponse<AuthUser>>;
}
export declare const consultantAuthClient: ConsultantAuthClient;
export {};
