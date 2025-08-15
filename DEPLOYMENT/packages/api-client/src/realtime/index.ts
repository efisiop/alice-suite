import { io, Socket } from 'socket.io-client';
import { RealTimeEvent, AuthenticatedSocket } from '../types';

export interface RealtimeClientConfig {
  url: string;
  token?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export class RealtimeClient {
  private socket: Socket | null = null;
  private config: Required<RealtimeClientConfig>;
  private eventHandlers: Map<string, Function[]> = new Map();
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  constructor(config: RealtimeClientConfig) {
    this.config = {
      url: config.url,
      token: config.token || '',
      autoConnect: config.autoConnect ?? true,
      reconnectAttempts: config.reconnectAttempts ?? 5,
      reconnectDelay: config.reconnectDelay ?? 1000
    };

    if (this.config.autoConnect) {
      this.connect();
    }
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.connectionStatus = 'connecting';

    this.socket = io(this.config.url, {
      auth: {
        token: this.config.token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.config.reconnectAttempts,
      reconnectionDelay: this.config.reconnectDelay,
      timeout: 10000
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = 'disconnected';
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connectionStatus = 'connected';
      console.log('🟢 Connected to realtime server');
      this.emit('connection-status', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason: string) => {
      this.connectionStatus = 'disconnected';
      console.log('🔴 Disconnected from realtime server:', reason);
      this.emit('connection-status', { status: 'disconnected', reason });
    });

    this.socket.on('connect_error', (error: Error) => {
      this.connectionStatus = 'disconnected';
      console.error('❌ Connection error:', error);
      this.emit('connection-error', error);
    });

    this.socket.on('reader-activity', (data: any) => {
      this.emit('reader-activity', data);
    });

    this.socket.on('online-readers', (data: any) => {
      this.emit('online-readers', data);
    });

    this.socket.on('event-error', (error: any) => {
      console.error('❌ Event error:', error);
      this.emit('event-error', error);
    });
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler?: Function): void {
    if (!this.eventHandlers.has(event)) return;
    
    if (handler) {
      const handlers = this.eventHandlers.get(event)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  emitEvent(eventType: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot emit event: not connected');
      return;
    }

    this.socket.emit('reader-event', {
      eventType,
      data
    });
  }

  subscribeToConsultantEvents(eventTypes?: string[]): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot subscribe: not connected');
      return;
    }

    this.socket.emit('subscribe-consultant', {
      consultantId: 'current-user', // Will be replaced with actual user ID
      eventTypes: eventTypes || []
    });
  }

  unsubscribeFromConsultantEvents(): void {
    if (!this.socket?.connected) return;

    this.socket.emit('unsubscribe-consultant', {
      consultantId: 'current-user'
    });
  }

  getOnlineReaders(): void {
    if (!this.socket?.connected) return;

    this.socket.emit('get-online-readers');
  }

  getRecentEvents(limit?: number, userId?: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('get-recent-events', {
      limit: limit || 50,
      userId
    });
  }

  joinRoom(room: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('join-room', room);
  }

  leaveRoom(room: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('leave-room', room);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  updateToken(token: string): void {
    this.config.token = token;
    if (this.socket) {
      if (this.socket.auth && typeof this.socket.auth === 'object') {
      (this.socket.auth as any).token = token;
    }
    }
  }
}

// Reader-specific realtime client
export class ReaderRealtimeClient extends RealtimeClient {
  constructor(config: RealtimeClientConfig) {
    super(config);
  }

  trackLogin(): void {
    this.emitEvent('LOGIN', {
      timestamp: new Date().toISOString(),
      device: navigator.userAgent
    });
  }

  trackLogout(): void {
    this.emitEvent('LOGOUT', {
      timestamp: new Date().toISOString()
    });
  }

  trackPageSync(bookId: string, pageNumber: number, section?: string): void {
    this.emitEvent('PAGE_SYNC', {
      bookId,
      pageNumber,
      section,
      timestamp: new Date().toISOString()
    });
  }

  trackSectionSync(bookId: string, section: string): void {
    this.emitEvent('SECTION_SYNC', {
      bookId,
      section,
      timestamp: new Date().toISOString()
    });
  }

  trackDefinitionLookup(word: string, definition: string, context?: string): void {
    this.emitEvent('DEFINITION_LOOKUP', {
      word,
      definition,
      context,
      timestamp: new Date().toISOString()
    });
  }

  trackAIQuery(query: string, response: string): void {
    this.emitEvent('AI_QUERY', {
      query,
      response,
      timestamp: new Date().toISOString()
    });
  }

  trackHelpRequest(type: string, description: string, context?: any): void {
    this.emitEvent('HELP_REQUEST', {
      type,
      description,
      context,
      timestamp: new Date().toISOString()
    });
  }

  trackFeedback(type: string, content: string, rating?: number): void {
    this.emitEvent('FEEDBACK_SUBMISSION', {
      type,
      content,
      rating,
      timestamp: new Date().toISOString()
    });
  }

  trackNoteCreation(bookId: string, pageNumber: number, content: string): void {
    this.emitEvent('NOTE_CREATED', {
      bookId,
      pageNumber,
      content,
      timestamp: new Date().toISOString()
    });
  }

  trackQuizAttempt(bookId: string, quizId: string, score: number, total: number): void {
    this.emitEvent('QUIZ_ATTEMPT', {
      bookId,
      quizId,
      score,
      total,
      percentage: (score / total) * 100,
      timestamp: new Date().toISOString()
    });
  }
}

// Consultant-specific realtime client
export class ConsultantRealtimeClient extends RealtimeClient {
  constructor(config: RealtimeClientConfig) {
    super(config);
  }

  subscribeToAllEvents(): void {
    this.subscribeToConsultantEvents([
      'LOGIN',
      'LOGOUT',
      'PAGE_SYNC',
      'SECTION_SYNC',
      'DEFINITION_LOOKUP',
      'AI_QUERY',
      'HELP_REQUEST',
      'FEEDBACK_SUBMISSION',
      'NOTE_CREATED',
      'QUIZ_ATTEMPT'
    ]);
  }

  subscribeToHelpEvents(): void {
    this.subscribeToConsultantEvents(['HELP_REQUEST', 'FEEDBACK_SUBMISSION']);
  }

  subscribeToProgressEvents(): void {
    this.subscribeToConsultantEvents(['PAGE_SYNC', 'SECTION_SYNC', 'QUIZ_ATTEMPT']);
  }

  onReaderActivity(handler: (data: any) => void): void {
    this.on('reader-activity', handler);
  }

  onOnlineReaders(handler: (data: any) => void): void {
    this.on('online-readers', handler);
  }

  onRecentEvents(handler: (data: any) => void): void {
    this.on('recent-events', handler);
  }
}

export const createRealtimeClient = (config: RealtimeClientConfig): RealtimeClient => {
  return new RealtimeClient(config);
};

export const createReaderClient = (config: RealtimeClientConfig): ReaderRealtimeClient => {
  return new ReaderRealtimeClient(config);
};

export const createConsultantClient = (config: RealtimeClientConfig): ConsultantRealtimeClient => {
  return new ConsultantRealtimeClient(config);
};