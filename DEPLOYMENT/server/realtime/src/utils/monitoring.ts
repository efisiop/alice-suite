import { logger, performanceLogger, errorLogger } from './logger';
import { RealTimeEvent } from '../types';
import { auditLogger } from './logger';

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

export class MonitoringService {
  private metrics: Metrics = {
    activeConnections: 0,
    totalEvents: 0,
    eventsPerMinute: 0,
    averageLatency: 0,
    errorRate: 0,
    queueSize: 0,
    redisOperations: 0,
    supabaseOperations: 0,
  };

  private eventTimestamps: number[] = [];
  private errorCount = 0;
  private totalRequests = 0;
  private redisOps = 0;
  private supabaseOps = 0;
  private latencies: number[] = [];

  private startTime = Date.now();

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Log metrics every 30 seconds
    setInterval(() => {
      this.calculateMetrics();
      this.logMetrics();
    }, 30000);

    // Check health every 5 seconds
    setInterval(() => {
      this.checkHealth();
    }, 5000);
  }

  recordConnection(socketId: string): void {
    this.metrics.activeConnections++;
    logger.info('Socket connected', { socketId, activeConnections: this.metrics.activeConnections });
  }

  recordDisconnection(socketId: string): void {
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
    logger.info('Socket disconnected', { socketId, activeConnections: this.metrics.activeConnections });
  }

  recordEvent(event: RealTimeEvent): void {
    this.metrics.totalEvents++;
    this.eventTimestamps.push(Date.now());
    
    // Keep only timestamps from the last minute
    const oneMinuteAgo = Date.now() - 60000;
    this.eventTimestamps = this.eventTimestamps.filter(ts => ts > oneMinuteAgo);
    
    logger.info('Event recorded', { 
      eventType: event.eventType, 
      userId: event.userId,
      timestamp: event.timestamp 
    });
  }

  recordLatency(latency: number): void {
    this.latencies.push(latency);
    
    // Keep only last 100 latencies
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }
  }

  recordError(error: Error, context?: string): void {
    this.errorCount++;
    this.totalRequests++;
    
    errorLogger.error('Error recorded', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  recordRedisOperation(operation: string): void {
    this.redisOps++;
  }

  recordSupabaseOperation(operation: string): void {
    this.supabaseOps++;
  }

  recordRequest(): void {
    this.totalRequests++;
  }

  private calculateMetrics(): void {
    // Calculate events per minute
    this.metrics.eventsPerMinute = this.eventTimestamps.length;

    // Calculate average latency
    this.metrics.averageLatency = this.latencies.length > 0 
      ? this.latencies.reduce((sum, lat) => sum + lat, 0) / this.latencies.length 
      : 0;

    // Calculate error rate
    this.metrics.errorRate = this.totalRequests > 0 
      ? (this.errorCount / this.totalRequests) * 100 
      : 0;

    // Update operation counts
    this.metrics.redisOperations = this.redisOps;
    this.metrics.supabaseOperations = this.supabaseOps;
  }

  private logMetrics(): void {
    performanceLogger.info('System metrics', {
      uptime: Date.now() - this.startTime,
      ...this.metrics,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    });
  }

  private checkHealth(): void {
    const health = this.getHealth();
    
    if (health.status === 'unhealthy') {
      errorLogger.error('System health check failed', { health });
    }
  }

  getHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    metrics: Partial<Metrics>;
  } {
    const checks = {
      activeConnections: this.metrics.activeConnections < 1000,
      errorRate: this.metrics.errorRate < 5,
      averageLatency: this.metrics.averageLatency < 1000,
      eventsPerMinute: this.metrics.eventsPerMinute < 1000,
      memoryUsage: process.memoryUsage().heapUsed < 512 * 1024 * 1024, // 512MB
    };

    const failedChecks = Object.values(checks).filter(check => !check).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (failedChecks === 0) status = 'healthy';
    else if (failedChecks <= 2) status = 'degraded';
    else status = 'unhealthy';

    return {
      status,
      checks,
      metrics: {
        activeConnections: this.metrics.activeConnections,
        errorRate: this.metrics.errorRate,
        averageLatency: this.metrics.averageLatency,
        eventsPerMinute: this.metrics.eventsPerMinute,
        queueSize: this.metrics.queueSize,
        redisOperations: this.metrics.redisOperations,
        supabaseOperations: this.metrics.supabaseOperations,
      }
    };
  }

  getMetrics(): Metrics {
    return { ...this.metrics };
  }

  getStats(): {
    uptime: number;
    startTime: number;
    totalEvents: number;
    totalRequests: number;
    errorCount: number;
  } {
    return {
      uptime: Date.now() - this.startTime,
      startTime: this.startTime,
      totalEvents: this.metrics.totalEvents,
      totalRequests: this.totalRequests,
      errorCount: this.errorCount,
    };
  }

  createAlert(message: string, severity: 'info' | 'warning' | 'error' = 'info'): void {
    auditLogger.log({
      level: severity,
      message,
      timestamp: new Date().toISOString()
    });
  }

  async createAlertIf(condition: boolean, message: string, severity: 'info' | 'warning' | 'error' = 'warning'): Promise<void> {
    if (condition) {
      this.createAlert(message, severity);
    }
  }

  reset(): void {
    this.metrics = {
      activeConnections: 0,
      totalEvents: 0,
      eventsPerMinute: 0,
      averageLatency: 0,
      errorRate: 0,
      queueSize: 0,
      redisOperations: 0,
      supabaseOperations: 0,
    };
    this.eventTimestamps = [];
    this.errorCount = 0;
    this.totalRequests = 0;
    this.redisOps = 0;
    this.supabaseOps = 0;
    this.latencies = [];
    this.startTime = Date.now();
  }
}

export const monitoringService = new MonitoringService();