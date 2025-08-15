import { RealTimeEvent } from '../types';
export interface Metrics {
    activeConnections: number;
    totalEvents: number;
    eventsPerMinute: number;
    averageLatency: number;
    errorRate: number;
    queueSize: number;
    redisOperations: number;
    supabaseOperations: number;
}
export declare class MonitoringService {
    private metrics;
    private eventTimestamps;
    private errorCount;
    private totalRequests;
    private redisOps;
    private supabaseOps;
    private latencies;
    private startTime;
    constructor();
    private startMonitoring;
    recordConnection(socketId: string): void;
    recordDisconnection(socketId: string): void;
    recordEvent(event: RealTimeEvent): void;
    recordLatency(latency: number): void;
    recordError(error: Error, context?: string): void;
    recordRedisOperation(operation: string): void;
    recordSupabaseOperation(operation: string): void;
    recordRequest(): void;
    private calculateMetrics;
    private logMetrics;
    private checkHealth;
    getHealth(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        checks: Record<string, boolean>;
        metrics: Partial<Metrics>;
    };
    getMetrics(): Metrics;
    getStats(): {
        uptime: number;
        startTime: number;
        totalEvents: number;
        totalRequests: number;
        errorCount: number;
    };
    createAlert(message: string, severity?: 'info' | 'warning' | 'error'): void;
    createAlertIf(condition: boolean, message: string, severity?: 'info' | 'warning' | 'error'): Promise<void>;
    reset(): void;
}
export declare const monitoringService: MonitoringService;
//# sourceMappingURL=monitoring.d.ts.map