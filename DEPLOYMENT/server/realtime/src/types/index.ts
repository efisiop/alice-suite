import { Socket } from 'socket.io';

export interface User {
  id: string;
  email: string;
  role: 'reader' | 'consultant' | 'admin';
  firstName?: string;
  lastName?: string;
}

export interface RealTimeEvent {
  id: string;
  userId: string;
  eventType: string;
  eventData: any;
  timestamp: Date;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface ActiveSession {
  id: string;
  userId: string;
  sessionId: string;
  deviceInfo?: DeviceInfo;
  lastActivity: Date;
  ipAddress?: string;
  isActive: boolean;
}

export interface DeviceInfo {
  userAgent?: string;
  platform?: string;
  browser?: string;
  version?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
}

export interface ConsultantSubscription {
  consultantId: string;
  eventTypes: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface SocketEvents {
  // Server events
  'reader-activity': (data: {
    userId: string;
    eventType: string;
    data: any;
    timestamp: Date;
  }) => void;
  
  'online-readers': (data: {
    count: number;
    readers: Array<{
      userId: string;
      firstName?: string;
      lastName?: string;
      lastActivity: Date;
      currentBook?: string;
      currentPage?: number;
    }>;
  }) => void;

  'event-error': (error: { message: string; code?: string }) => void;

  // Client events
  'subscribe-consultant': (data: {
    consultantId: string;
    eventTypes: string[];
  }) => void;

  'unsubscribe-consultant': (data: {
    consultantId: string;
  }) => void;

  'reader-event': (data: {
    eventType: string;
    data: any;
  }) => void;

  'join-room': (room: string) => void;
  'leave-room': (room: string) => void;
}

export interface AuthenticatedSocket extends Socket {
  user?: User;
  sessionId?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
}

export interface RealTimeConfig {
  port: number;
  cors: {
    origin: string[];
    credentials: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
  };
  rateLimit: RateLimitConfig;
}