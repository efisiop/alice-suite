import { RealTimeEvent } from '../types';
export declare class RedisService {
    private config;
    private publisher;
    private subscriber;
    private isConnected;
    constructor(config: {
        host: string;
        port: number;
        password?: string;
    });
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publishEvent(channel: string, event: RealTimeEvent): Promise<void>;
    subscribeToChannel(channel: string, callback: (event: RealTimeEvent) => void): Promise<void>;
    unsubscribeFromChannel(channel: string): Promise<void>;
    storeEvent(event: RealTimeEvent): Promise<void>;
    getRecentEvents(userId: string, limit?: number): Promise<RealTimeEvent[]>;
    setUserOnline(userId: string, isOnline: boolean): Promise<void>;
    getOnlineUsers(): Promise<string[]>;
    getUserLastSeen(userId: string): Promise<Date | null>;
}
//# sourceMappingURL=redis.service.d.ts.map