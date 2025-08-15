import { io } from 'socket.io-client';
export class RealtimeClient {
    constructor(config) {
        this.socket = null;
        this.eventHandlers = new Map();
        this.connectionStatus = 'disconnected';
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
    connect() {
        if (this.socket?.connected)
            return;
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
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connectionStatus = 'disconnected';
        }
    }
    setupEventListeners() {
        if (!this.socket)
            return;
        this.socket.on('connect', () => {
            this.connectionStatus = 'connected';
            console.log('🟢 Connected to realtime server');
            this.emit('connection-status', { status: 'connected' });
        });
        this.socket.on('disconnect', (reason) => {
            this.connectionStatus = 'disconnected';
            console.log('🔴 Disconnected from realtime server:', reason);
            this.emit('connection-status', { status: 'disconnected', reason });
        });
        this.socket.on('connect_error', (error) => {
            this.connectionStatus = 'disconnected';
            console.error('❌ Connection error:', error);
            this.emit('connection-error', error);
        });
        this.socket.on('reader-activity', (data) => {
            this.emit('reader-activity', data);
        });
        this.socket.on('online-readers', (data) => {
            this.emit('online-readers', data);
        });
        this.socket.on('event-error', (error) => {
            console.error('❌ Event error:', error);
            this.emit('event-error', error);
        });
    }
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }
    off(event, handler) {
        if (!this.eventHandlers.has(event))
            return;
        if (handler) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
        else {
            this.eventHandlers.delete(event);
        }
    }
    emit(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
    emitEvent(eventType, data) {
        if (!this.socket?.connected) {
            console.warn('⚠️ Cannot emit event: not connected');
            return;
        }
        this.socket.emit('reader-event', {
            eventType,
            data
        });
    }
    subscribeToConsultantEvents(eventTypes) {
        if (!this.socket?.connected) {
            console.warn('⚠️ Cannot subscribe: not connected');
            return;
        }
        this.socket.emit('subscribe-consultant', {
            consultantId: 'current-user', // Will be replaced with actual user ID
            eventTypes: eventTypes || []
        });
    }
    unsubscribeFromConsultantEvents() {
        if (!this.socket?.connected)
            return;
        this.socket.emit('unsubscribe-consultant', {
            consultantId: 'current-user'
        });
    }
    getOnlineReaders() {
        if (!this.socket?.connected)
            return;
        this.socket.emit('get-online-readers');
    }
    getRecentEvents(limit, userId) {
        if (!this.socket?.connected)
            return;
        this.socket.emit('get-recent-events', {
            limit: limit || 50,
            userId
        });
    }
    joinRoom(room) {
        if (!this.socket?.connected)
            return;
        this.socket.emit('join-room', room);
    }
    leaveRoom(room) {
        if (!this.socket?.connected)
            return;
        this.socket.emit('leave-room', room);
    }
    isConnected() {
        return this.socket?.connected ?? false;
    }
    getConnectionStatus() {
        return this.connectionStatus;
    }
    updateToken(token) {
        this.config.token = token;
        if (this.socket) {
            if (this.socket.auth && typeof this.socket.auth === 'object') {
                this.socket.auth.token = token;
            }
        }
    }
}
// Reader-specific realtime client
export class ReaderRealtimeClient extends RealtimeClient {
    constructor(config) {
        super(config);
    }
    trackLogin() {
        this.emitEvent('LOGIN', {
            timestamp: new Date().toISOString(),
            device: navigator.userAgent
        });
    }
    trackLogout() {
        this.emitEvent('LOGOUT', {
            timestamp: new Date().toISOString()
        });
    }
    trackPageSync(bookId, pageNumber, section) {
        this.emitEvent('PAGE_SYNC', {
            bookId,
            pageNumber,
            section,
            timestamp: new Date().toISOString()
        });
    }
    trackSectionSync(bookId, section) {
        this.emitEvent('SECTION_SYNC', {
            bookId,
            section,
            timestamp: new Date().toISOString()
        });
    }
    trackDefinitionLookup(word, definition, context) {
        this.emitEvent('DEFINITION_LOOKUP', {
            word,
            definition,
            context,
            timestamp: new Date().toISOString()
        });
    }
    trackAIQuery(query, response) {
        this.emitEvent('AI_QUERY', {
            query,
            response,
            timestamp: new Date().toISOString()
        });
    }
    trackHelpRequest(type, description, context) {
        this.emitEvent('HELP_REQUEST', {
            type,
            description,
            context,
            timestamp: new Date().toISOString()
        });
    }
    trackFeedback(type, content, rating) {
        this.emitEvent('FEEDBACK_SUBMISSION', {
            type,
            content,
            rating,
            timestamp: new Date().toISOString()
        });
    }
    trackNoteCreation(bookId, pageNumber, content) {
        this.emitEvent('NOTE_CREATED', {
            bookId,
            pageNumber,
            content,
            timestamp: new Date().toISOString()
        });
    }
    trackQuizAttempt(bookId, quizId, score, total) {
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
    constructor(config) {
        super(config);
    }
    subscribeToAllEvents() {
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
    subscribeToHelpEvents() {
        this.subscribeToConsultantEvents(['HELP_REQUEST', 'FEEDBACK_SUBMISSION']);
    }
    subscribeToProgressEvents() {
        this.subscribeToConsultantEvents(['PAGE_SYNC', 'SECTION_SYNC', 'QUIZ_ATTEMPT']);
    }
    onReaderActivity(handler) {
        this.on('reader-activity', handler);
    }
    onOnlineReaders(handler) {
        this.on('online-readers', handler);
    }
    onRecentEvents(handler) {
        this.on('recent-events', handler);
    }
}
export const createRealtimeClient = (config) => {
    return new RealtimeClient(config);
};
export const createReaderClient = (config) => {
    return new ReaderRealtimeClient(config);
};
export const createConsultantClient = (config) => {
    return new ConsultantRealtimeClient(config);
};
