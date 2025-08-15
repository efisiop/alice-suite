import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../types';
import { EventBroadcaster } from '../services/event-broadcaster';
import { EventQueueService } from '../services/event-queue.service';
import { SupabaseClient } from '../database/supabase-client';
export declare class SocketHandlers {
    private io;
    private broadcaster;
    private eventQueue;
    private supabase;
    constructor(io: Server, broadcaster: EventBroadcaster, eventQueue: EventQueueService, supabase: SupabaseClient);
    setupMiddleware(): void;
    setupEventQueueProcessor(): void;
    handleConnection(socket: AuthenticatedSocket): void;
    private setupEventListeners;
    private updateActiveSession;
    private handleDisconnection;
    private generateEventId;
    getStats(): Promise<any>;
}
//# sourceMappingURL=socket-handlers.d.ts.map