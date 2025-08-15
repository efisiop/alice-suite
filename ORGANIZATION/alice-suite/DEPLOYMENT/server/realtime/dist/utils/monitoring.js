"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringService = exports.MonitoringService = void 0;
const logger_1 = require("./logger");
const logger_2 = require("./logger");
class MonitoringService {
    constructor() {
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
        this.startMonitoring();
    }
    startMonitoring() {
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
    recordConnection(socketId) {
        this.metrics.activeConnections++;
        logger_1.logger.info('Socket connected', { socketId, activeConnections: this.metrics.activeConnections });
    }
    recordDisconnection(socketId) {
        this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
        logger_1.logger.info('Socket disconnected', { socketId, activeConnections: this.metrics.activeConnections });
    }
    recordEvent(event) {
        this.metrics.totalEvents++;
        this.eventTimestamps.push(Date.now());
        // Keep only timestamps from the last minute
        const oneMinuteAgo = Date.now() - 60000;
        this.eventTimestamps = this.eventTimestamps.filter(ts => ts > oneMinuteAgo);
        logger_1.logger.info('Event recorded', {
            eventType: event.eventType,
            userId: event.userId,
            timestamp: event.timestamp
        });
    }
    recordLatency(latency) {
        this.latencies.push(latency);
        // Keep only last 100 latencies
        if (this.latencies.length > 100) {
            this.latencies.shift();
        }
    }
    recordError(error, context) {
        this.errorCount++;
        this.totalRequests++;
        logger_1.errorLogger.error('Error recorded', {
            error: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        });
    }
    recordRedisOperation(operation) {
        this.redisOps++;
    }
    recordSupabaseOperation(operation) {
        this.supabaseOps++;
    }
    recordRequest() {
        this.totalRequests++;
    }
    calculateMetrics() {
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
    logMetrics() {
        logger_1.performanceLogger.info('System metrics', {
            uptime: Date.now() - this.startTime,
            ...this.metrics,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
        });
    }
    checkHealth() {
        const health = this.getHealth();
        if (health.status === 'unhealthy') {
            logger_1.errorLogger.error('System health check failed', { health });
        }
    }
    getHealth() {
        const checks = {
            activeConnections: this.metrics.activeConnections < 1000,
            errorRate: this.metrics.errorRate < 5,
            averageLatency: this.metrics.averageLatency < 1000,
            eventsPerMinute: this.metrics.eventsPerMinute < 1000,
            memoryUsage: process.memoryUsage().heapUsed < 512 * 1024 * 1024, // 512MB
        };
        const failedChecks = Object.values(checks).filter(check => !check).length;
        let status;
        if (failedChecks === 0)
            status = 'healthy';
        else if (failedChecks <= 2)
            status = 'degraded';
        else
            status = 'unhealthy';
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
    getMetrics() {
        return { ...this.metrics };
    }
    getStats() {
        return {
            uptime: Date.now() - this.startTime,
            startTime: this.startTime,
            totalEvents: this.metrics.totalEvents,
            totalRequests: this.totalRequests,
            errorCount: this.errorCount,
        };
    }
    createAlert(message, severity = 'info') {
        logger_2.auditLogger.log({
            level: severity,
            message,
            timestamp: new Date().toISOString()
        });
    }
    async createAlertIf(condition, message, severity = 'warning') {
        if (condition) {
            this.createAlert(message, severity);
        }
    }
    reset() {
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
exports.MonitoringService = MonitoringService;
exports.monitoringService = new MonitoringService();
//# sourceMappingURL=monitoring.js.map