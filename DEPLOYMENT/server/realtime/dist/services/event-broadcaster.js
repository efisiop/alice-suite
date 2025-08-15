"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBroadcaster = void 0;
class EventBroadcaster {
    constructor(io, redis) {
        this.activeRooms = new Map();
        this.io = io;
        this.redis = redis;
    }
    async broadcastEvent(event) {
        try {
            // Store event in Redis for persistence
            await this.redis.storeEvent(event);
            // Determine which rooms/clients should receive this event
            const targetRooms = this.determineTargetRooms(event);
            // Broadcast to appropriate rooms
            for (const room of targetRooms) {
                this.io.to(room).emit('reader-activity', {
                    userId: event.userId,
                    eventType: event.eventType,
                    data: event.eventData,
                    timestamp: event.timestamp,
                });
            }
            // Special handling for consultant dashboard updates
            if (event.eventType === 'LOGIN' || event.eventType === 'LOGOUT') {
                await this.updateOnlineReaders();
            }
            console.log(`📡 Broadcasted event: ${event.eventType} for user ${event.userId}`);
        }
        catch (error) {
            console.error('❌ Error broadcasting event:', error);
            throw error;
        }
    }
    determineTargetRooms(event) {
        const rooms = [];
        // Always broadcast to consultant rooms
        rooms.push('consultants');
        // Broadcast to user-specific room
        rooms.push(`user:${event.userId}`);
        // Broadcast to event-type specific room
        rooms.push(`event:${event.eventType}`);
        // Special handling for consultant-specific events
        if (event.eventType.includes('HELP_REQUEST') || event.eventType.includes('FEEDBACK')) {
            rooms.push('support');
        }
        return rooms;
    }
    async joinRoom(socket, room) {
        try {
            await socket.join(room);
            if (!this.activeRooms.has(room)) {
                this.activeRooms.set(room, new Set());
            }
            this.activeRooms.get(room).add(socket.id);
            console.log(`👥 User ${socket.user?.id} joined room: ${room}`);
            // Send initial data for specific rooms
            if (room === 'consultants') {
                await this.sendInitialConsultantData(socket);
            }
        }
        catch (error) {
            console.error('❌ Error joining room:', error);
            throw error;
        }
    }
    async leaveRoom(socket, room) {
        try {
            await socket.leave(room);
            const roomSet = this.activeRooms.get(room);
            if (roomSet) {
                roomSet.delete(socket.id);
                if (roomSet.size === 0) {
                    this.activeRooms.delete(room);
                }
            }
            console.log(`👋 User ${socket.user?.id} left room: ${room}`);
        }
        catch (error) {
            console.error('❌ Error leaving room:', error);
            throw error;
        }
    }
    async sendInitialConsultantData(socket) {
        try {
            const onlineUsers = await this.redis.getOnlineUsers();
            const onlineReaders = [];
            for (const userId of onlineUsers) {
                const lastSeen = await this.redis.getUserLastSeen(userId);
                onlineReaders.push({
                    userId,
                    lastActivity: lastSeen || new Date(),
                });
            }
            socket.emit('online-readers', {
                count: onlineReaders.length,
                readers: onlineReaders,
            });
        }
        catch (error) {
            console.error('❌ Error sending initial consultant data:', error);
        }
    }
    async updateOnlineReaders() {
        try {
            const onlineUsers = await this.redis.getOnlineUsers();
            const onlineReaders = [];
            for (const userId of onlineUsers) {
                const lastSeen = await this.redis.getUserLastSeen(userId);
                onlineReaders.push({
                    userId,
                    lastActivity: lastSeen || new Date(),
                });
            }
            this.io.to('consultants').emit('online-readers', {
                count: onlineReaders.length,
                readers: onlineReaders,
            });
        }
        catch (error) {
            console.error('❌ Error updating online readers:', error);
        }
    }
    async handleUserConnection(socket) {
        try {
            const userId = socket.user?.id;
            if (!userId)
                return;
            await this.redis.setUserOnline(userId, true);
            // Join user to appropriate rooms based on role
            if (socket.user?.role === 'consultant') {
                await this.joinRoom(socket, 'consultants');
                await this.joinRoom(socket, 'support');
            }
            else if (socket.user?.role === 'reader') {
                await this.joinRoom(socket, `user:${userId}`);
            }
            console.log(`🟢 User ${userId} (${socket.user?.role}) connected`);
            await this.updateOnlineReaders();
        }
        catch (error) {
            console.error('❌ Error handling user connection:', error);
        }
    }
    async handleUserDisconnection(socket) {
        try {
            const userId = socket.user?.id;
            if (!userId)
                return;
            await this.redis.setUserOnline(userId, false);
            // Remove from all rooms
            const rooms = Array.from(socket.rooms);
            for (const room of rooms) {
                if (room !== socket.id) {
                    await this.leaveRoom(socket, room);
                }
            }
            console.log(`🔴 User ${userId} disconnected`);
            await this.updateOnlineReaders();
        }
        catch (error) {
            console.error('❌ Error handling user disconnection:', error);
        }
    }
    getRoomOccupants(room) {
        return this.activeRooms.get(room)?.size || 0;
    }
    getAllRooms() {
        return Array.from(this.activeRooms.keys());
    }
    async broadcastToUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }
    async broadcastToConsultants(event, data) {
        this.io.to('consultants').emit(event, data);
    }
    async broadcastToSupport(event, data) {
        this.io.to('support').emit(event, data);
    }
}
exports.EventBroadcaster = EventBroadcaster;
//# sourceMappingURL=event-broadcaster.js.map