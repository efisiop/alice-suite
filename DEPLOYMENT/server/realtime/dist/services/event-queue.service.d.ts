import { RealTimeEvent } from '../types';
import { RedisService } from './redis.service';
export interface EventQueueConfig {
    maxQueueSize: number;
    maxRetries: number;
    retryDelay: number;
    batchSize: number;
}
export declare class EventQueueService {
    private redis;
    private config;
    private processing;
    constructor(redis: RedisService, config?: EventQueueConfig);
    enqueue(event: RealTimeEvent): Promise<void>;
    dequeue(): Promise<RealTimeEvent | null>;
    processEvents(processCallback: (event: RealTimeEvent) => Promise<void>): Promise<void>;
    private handleFailedEvent;
    private moveToDeadLetterQueue;
    getQueueSize(): Promise<number>;
    getDeadLetterQueueSize(): Promise<number>;
    clearQueue(): Promise<void>;
    getQueueStats(): Promise<{
        queueSize: number;
        dlqSize: number;
        isProcessing: boolean;
    }>;
    startPeriodicProcessing(processCallback: (event: RealTimeEvent) => Promise<void>): Promise<void>;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=event-queue.service.d.ts.map