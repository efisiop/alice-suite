import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket, RealTimeEvent } from '../types';
import { EventBroadcaster } from '../services/event-broadcaster';
import { EventQueueService } from '../services/event-queue.service';
import { SupabaseClient } from '../database/supabase-client';
import { authenticateToken, authorizeRole, rateLimit } from '../middleware/auth.middleware';

export class SocketHandlers {
  private io: Server;
  private broadcaster: EventBroadcaster;
  private eventQueue: EventQueueService;
  private supabase: SupabaseClient;

  constructor(
    io: Server,
    broadcaster: EventBroadcaster,
    eventQueue: EventQueueService,
    supabase: SupabaseClient
  ) {
    this.io = io;
    this.broadcaster = broadcaster;
    this.eventQueue = eventQueue;
    this.supabase = supabase;

    this.setupEventQueueProcessor();
  }

  setupMiddleware(): void {
    this.io.use(authenticateToken);
    this.io.use(authorizeRole(['reader', 'consultant', 'admin']));
    this.io.use(rateLimit({
      windowMs: 60000, // 1 minute
      maxRequests: 100
    }));
  }

  setupEventQueueProcessor(): void {
    this.eventQueue.startPeriodicProcessing(async (event) => {
      try {
        // Store in Supabase
        await this.supabase.storeEvent(event);

        // Broadcast to connected clients
        await this.broadcaster.broadcastEvent(event);
      } catch (error) {
        console.error('❌ Error processing queued event:', error);
        throw error;
      }
    });
  }

  handleConnection(socket: AuthenticatedSocket): void {
    console.log(`🟢 Socket connected: ${socket.id} - User: ${socket.user?.email}`);

    // Handle user connection
    this.broadcaster.handleUserConnection(socket);

    // Set up event listeners
    this.setupEventListeners(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
      socket.emit('event-error', { message: 'Internal server error' });
    });
  }

  private setupEventListeners(socket: AuthenticatedSocket): void {
    // Subscribe to consultant events
    socket.on('subscribe-consultant', async (data) => {
      try {
        if (socket.user?.role !== 'consultant') {
          socket.emit('event-error', { message: 'Only consultants can subscribe' });
          return;
        }

        await this.broadcaster.joinRoom(socket, 'consultants');
        
        if (data.eventTypes && Array.isArray(data.eventTypes)) {
          for (const eventType of data.eventTypes) {
            await this.broadcaster.joinRoom(socket, `event:${eventType}`);
          }
        }

        socket.emit('subscribe-consultant-success', {
          message: 'Successfully subscribed to consultant events',
          eventTypes: data.eventTypes || []
        });

      } catch (error) {
        console.error('❌ Error subscribing consultant:', error);
        socket.emit('event-error', { message: 'Failed to subscribe to events' });
      }
    });

    // Unsubscribe from consultant events
    socket.on('unsubscribe-consultant', async (data) => {
      try {
        if (socket.user?.role !== 'consultant') {
          socket.emit('event-error', { message: 'Only consultants can unsubscribe' });
          return;
        }

        await this.broadcaster.leaveRoom(socket, 'consultants');
        
        socket.emit('unsubscribe-consultant-success', {
          message: 'Successfully unsubscribed from consultant events'
        });

      } catch (error) {
        console.error('❌ Error unsubscribing consultant:', error);
        socket.emit('event-error', { message: 'Failed to unsubscribe from events' });
      }
    });

    // Handle reader events
    socket.on('reader-event', async (data) => {
      try {
        if (socket.user?.role !== 'reader') {
          socket.emit('event-error', { message: 'Only readers can send reader events' });
          return;
        }

        const event: RealTimeEvent = {
          id: this.generateEventId(),
          userId: socket.user.id,
          eventType: data.eventType,
          eventData: data.data,
          timestamp: new Date(),
          sessionId: socket.sessionId || socket.id
        };

        // Queue the event for processing
        await this.eventQueue.enqueue(event);

        // Update active session
        await this.updateActiveSession(socket);

        socket.emit('reader-event-received', {
          message: 'Event received and queued',
          eventId: event.id
        });

      } catch (error) {
        console.error('❌ Error processing reader event:', error);
        socket.emit('event-error', { message: 'Failed to process event' });
      }
    });

    // Join specific room
    socket.on('join-room', async (room) => {
      try {
        await this.broadcaster.joinRoom(socket, room);
        socket.emit('room-joined', { room });
      } catch (error) {
        console.error('❌ Error joining room:', error);
        socket.emit('event-error', { message: 'Failed to join room' });
      }
    });

    // Leave specific room
    socket.on('leave-room', async (room) => {
      try {
        await this.broadcaster.leaveRoom(socket, room);
        socket.emit('room-left', { room });
      } catch (error) {
        console.error('❌ Error leaving room:', error);
        socket.emit('event-error', { message: 'Failed to leave room' });
      }
    });

    // Get online readers
    socket.on('get-online-readers', async () => {
      try {
        if (socket.user?.role !== 'consultant') {
          socket.emit('event-error', { message: 'Only consultants can view online readers' });
          return;
        }

        const onlineUsers = await this.supabase.getOnlineUsers();
        socket.emit('online-readers', {
          count: onlineUsers.length,
          readers: onlineUsers
        });
      } catch (error) {
        console.error('❌ Error getting online readers:', error);
        socket.emit('event-error', { message: 'Failed to get online readers' });
      }
    });

    // Get recent events
    socket.on('get-recent-events', async (data) => {
      try {
        const limit = data.limit || 50;
        const userId = data.userId;

        if (socket.user?.role !== 'consultant' && userId && userId !== socket.user?.id) {
          socket.emit('event-error', { message: 'Unauthorized access to events' });
          return;
        }

        const events = await this.supabase.getRecentEvents(limit, userId || socket.user?.id);
        socket.emit('recent-events', { events });
      } catch (error) {
        console.error('❌ Error getting recent events:', error);
        socket.emit('event-error', { message: 'Failed to get recent events' });
      }
    });
  }

  private async updateActiveSession(socket: AuthenticatedSocket): Promise<void> {
    try {
      const activeSession = {
        id: crypto.randomUUID(),
        userId: socket.user!.id,
        sessionId: socket.sessionId || socket.id,
        deviceInfo: {
          userAgent: socket.handshake.headers['user-agent'],
          platform: 'web'
        },
        lastActivity: new Date(),
        ipAddress: socket.handshake.address,
        isActive: true
      };

      await this.supabase.updateActiveSession(activeSession);
    } catch (error) {
      console.error('❌ Error updating active session:', error);
    }
  }

  private handleDisconnection(socket: AuthenticatedSocket): void {
    console.log(`🔴 Socket disconnected: ${socket.id} - User: ${socket.user?.email}`);
    
    // Handle user disconnection
    this.broadcaster.handleUserDisconnection(socket);
  }

  private generateEventId(): string {
    return crypto.randomUUID();
  }

  async getStats(): Promise<any> {
    try {
      const [queueStats, onlineUsers, dashboardStats] = await Promise.all([
        this.eventQueue.getQueueStats(),
        this.supabase.getOnlineUsers(),
        this.supabase.getDashboardStats()
      ]);

      return {
        queueStats,
        onlineUsersCount: onlineUsers.length,
        dashboardStats
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return null;
    }
  }
}