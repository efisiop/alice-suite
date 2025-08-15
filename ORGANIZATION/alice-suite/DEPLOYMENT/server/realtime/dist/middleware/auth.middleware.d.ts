import { AuthenticatedSocket } from '../types';
import { Socket } from 'socket.io';
export interface JWTPayload {
    sub: string;
    email: string;
    role: 'reader' | 'consultant' | 'admin';
    firstName?: string;
    lastName?: string;
    iat: number;
    exp: number;
}
export declare const authenticateToken: (socket: Socket, next: (err?: Error) => void) => Promise<void>;
export declare const authorizeRole: (roles: string[]) => (socket: AuthenticatedSocket, next: (err?: Error) => void) => void;
export declare const rateLimit: (config: {
    windowMs: number;
    maxRequests: number;
}) => (socket: AuthenticatedSocket, next: (err?: Error) => void) => void;
//# sourceMappingURL=auth.middleware.d.ts.map