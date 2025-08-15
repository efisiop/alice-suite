import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedSocket, User } from '../types';
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

export const authenticateToken = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as JWTPayload;

    const user: User = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    (socket as AuthenticatedSocket).user = user;
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
};

export const authorizeRole = (roles: string[]) => {
  return (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    if (!socket.user) {
      return next(new Error('Authentication required'));
    }

    if (!roles.includes(socket.user.role)) {
      return next(new Error('Insufficient permissions'));
    }

    next();
  };
};

export const rateLimit = (config: { windowMs: number; maxRequests: number }) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    const userId = socket.user?.id;
    if (!userId) return next();

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