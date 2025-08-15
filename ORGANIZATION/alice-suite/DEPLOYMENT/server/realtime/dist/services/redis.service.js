"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
class RedisService {
    constructor(config) {
        this.config = config;
        this.isConnected = false;
        this.publisher = (0, redis_1.createClient)({
            socket: {
                host: config.host,
                port: config.port,
            },
            password: config.password,
        });
        this.subscriber = this.publisher.duplicate();
    }
    async connect() {
        if (this.isConnected)
            return;
        try {
            await this.publisher.connect();
            await this.subscriber.connect();
            this.isConnected = true;
            console.log('✅ Redis connected successfully');
        }
        catch (error) {
            console.error('❌ Redis connection failed:', error);
            throw error;
        }
    }
    async disconnect() {
        if (!this.isConnected)
            return;
        try {
            await this.publisher.disconnect();
            await this.subscriber.disconnect();
            this.isConnected = false;
            console.log('🔌 Redis disconnected');
        }
        catch (error) {
            console.error('❌ Redis disconnection error:', error);
        }
    }
    async publishEvent(channel, event) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        try {
            await this.publisher.publish(channel, JSON.stringify(event));
        }
        catch (error) {
            console.error('❌ Redis publish error:', error);
            throw error;
        }
    }
    async subscribeToChannel(channel, callback) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        try {
            await this.subscriber.subscribe(channel, (message) => {
                try {
                    const event = JSON.parse(message);
                    callback(event);
                }
                catch (error) {
                    console.error('❌ Redis message parse error:', error);
                }
            });
        }
        catch (error) {
            console.error('❌ Redis subscribe error:', error);
            throw error;
        }
    }
    async unsubscribeFromChannel(channel) {
        if (!this.isConnected)
            return;
        try {
            await this.subscriber.unsubscribe(channel);
        }
        catch (error) {
            console.error('❌ Redis unsubscribe error:', error);
        }
    }
    async storeEvent(event) {
        if (!this.isConnected)
            return;
        const key = `events:${event.userId}:${event.sessionId}`;
        const eventData = JSON.stringify(event);
        try {
            await this.publisher.lPush(key, eventData);
            await this.publisher.expire(key, 86400); // 24 hours
        }
        catch (error) {
            console.error('❌ Redis store event error:', error);
        }
    }
    async getRecentEvents(userId, limit = 50) {
        if (!this.isConnected)
            return [];
        const key = `events:${userId}:*`;
        try {
            const keys = await this.publisher.keys(key);
            const events = [];
            for (const key of keys) {
                const eventStrings = await this.publisher.lRange(key, 0, limit - 1);
                for (const eventStr of eventStrings) {
                    try {
                        const event = JSON.parse(eventStr);
                        events.push(event);
                    }
                    catch (error) {
                        console.error('❌ Redis parse event error:', error);
                    }
                }
            }
            return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
        }
        catch (error) {
            console.error('❌ Redis get events error:', error);
            return [];
        }
    }
    async setUserOnline(userId, isOnline) {
        if (!this.isConnected)
            return;
        try {
            if (isOnline) {
                await this.publisher.sAdd('online_users', userId);
                await this.publisher.set(`user_last_seen:${userId}`, new Date().toISOString());
            }
            else {
                await this.publisher.sRem('online_users', userId);
            }
        }
        catch (error) {
            console.error('❌ Redis set user online error:', error);
        }
    }
    async getOnlineUsers() {
        if (!this.isConnected)
            return [];
        try {
            return await this.publisher.sMembers('online_users');
        }
        catch (error) {
            console.error('❌ Redis get online users error:', error);
            return [];
        }
    }
    async getUserLastSeen(userId) {
        if (!this.isConnected)
            return null;
        try {
            const lastSeen = await this.publisher.get(`user_last_seen:${userId}`);
            return lastSeen ? new Date(lastSeen) : null;
        }
        catch (error) {
            console.error('❌ Redis get last seen error:', error);
            return null;
        }
    }
}
exports.RedisService = RedisService;
//# sourceMappingURL=redis.service.js.map