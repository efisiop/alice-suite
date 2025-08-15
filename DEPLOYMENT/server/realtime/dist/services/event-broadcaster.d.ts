import { Server } from 'socket.io';
import { RealTimeEvent, AuthenticatedSocket } from '../types';
import { RedisService } from './redis.service';
export declare class EventBroadcaster {
    private io;
    private redis;
    private activeRooms;
    constructor(io: Server, redis: RedisService);
    broadcastEvent(event: RealTimeEvent): Promise<void>;
    private determineTargetRooms;
    joinRoom(socket: AuthenticatedSocket, room: string): Promise<void>;
    leaveRoom(socket: AuthenticatedSocket, room: string): Promise<void>;
    private sendInitialConsultantData;
    updateOnlineReaders(): Promise<void>;
    handleUserConnection(socket: AuthenticatedSocket): Promise<void>;
    handleUserDisconnection(socket: AuthenticatedSocket): Promise<void>;
    getRoomOccupants(room: string): number;
    getAllRooms(): string[];
    broadcastToUser(userId: string, event: string, data: any): Promise<void>;
    broadcastToConsultants(event: string, data: any): Promise<void>;
    broadcastToSupport(event: string, data: any): Promise<void>;
}
//# sourceMappingURL=event-broadcaster.d.ts.map