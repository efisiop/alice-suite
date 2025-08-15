"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = exports.authorizeRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        if (!token) {
            return next(new Error('Authentication token required'));
        }
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
        };
        socket.user = user;
        next();
    }
    catch (error) {
        next(new Error('Invalid authentication token'));
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRole = (roles) => {
    return (socket, next) => {
        if (!socket.user) {
            return next(new Error('Authentication required'));
        }
        if (!roles.includes(socket.user.role)) {
            return next(new Error('Insufficient permissions'));
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
const rateLimit = (config) => {
    const requests = new Map();
    return (socket, next) => {
        const userId = socket.user?.id;
        if (!userId)
            return next();
        const now = Date.now();
        const userRequests = requests.get(userId);
        if (!userRequests || now > userRequests.resetTime) {
            requests.set(userId, { count: 1, resetTime: now + config.windowMs });
            return next();
        }
        if (userRequests.count >= config.maxRequests) {
            return next(new Error('Rate limit exceeded'));
        }
        userRequests.count++;
        next();
    };
};
exports.rateLimit = rateLimit;
//# sourceMappingURL=auth.middleware.js.map