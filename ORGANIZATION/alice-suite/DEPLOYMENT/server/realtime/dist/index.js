"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeServer = void 0;
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const redis_service_1 = require("./services/redis.service");
const event_broadcaster_1 = require("./services/event-broadcaster");
const event_queue_service_1 = require("./services/event-queue.service");
const supabase_client_1 = require("./database/supabase-client");
const socket_handlers_1 = require("./handlers/socket-handlers");
dotenv_1.default.config();
const config = {
    port: parseInt(process.env.REALTIME_PORT || '3001', 10),
    cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174'
        ],
        credentials: true
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key'
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
        skipSuccessfulRequests: false
    }
};
class RealtimeServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.setupExpress();
        this.setupSocketIO();
        this.setupServices();
    }
    setupExpress() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)(config.cors));
        this.app.use(express_1.default.json());
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
        // Stats endpoint
        this.app.get('/stats', async (req, res) => {
            try {
                const stats = await this.handlers.getStats();
                res.json(stats);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to get stats' });
            }
        });
    }
    setupSocketIO() {
        this.io = new socket_io_1.Server(this.server, {
            cors: config.cors,
            transports: ['websocket', 'polling']
        });
    }
    async setupServices() {
        try {
            // Initialize Redis
            this.redis = new redis_service_1.RedisService(config.redis);
            await this.redis.connect();
            // Initialize Supabase
            this.supabase = new supabase_client_1.SupabaseClient();
            // Initialize Event Broadcaster
            this.broadcaster = new event_broadcaster_1.EventBroadcaster(this.io, this.redis);
            // Initialize Event Queue
            this.eventQueue = new event_queue_service_1.EventQueueService(this.redis);
            // Initialize Socket Handlers
            this.handlers = new socket_handlers_1.SocketHandlers(this.io, this.broadcaster, this.eventQueue, this.supabase);
            // Setup middleware and handlers
            this.handlers.setupMiddleware();
            // Setup Socket.IO connection handler
            this.io.on('connection', (socket) => {
                console.log(`🔗 New connection: ${socket.id}`);
                this.handlers.handleConnection(socket);
            });
        }
        catch (error) {
            console.error('❌ Error setting up services:', error);
            throw error;
        }
    }
    async start() {
        try {
            await this.setupServices();
            this.server.listen(config.port, () => {
                console.log(`🚀 Realtime server running on port ${config.port}`);
                console.log(`📊 Health check: http://localhost:${config.port}/health`);
                console.log(`📈 Stats: http://localhost:${config.port}/stats`);
            });
            // Graceful shutdown
            process.on('SIGTERM', this.shutdown.bind(this));
            process.on('SIGINT', this.shutdown.bind(this));
        }
        catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
    async shutdown() {
        console.log('🛑 Shutting down realtime server...');
        try {
            // Close event queue
            await this.eventQueue.shutdown();
            // Close Redis connection
            await this.redis.disconnect();
            // Close server
            this.server.close(() => {
                console.log('✅ Server closed successfully');
                process.exit(0);
            });
        }
        catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    }
}
exports.RealtimeServer = RealtimeServer;
// Start the server
if (require.main === module) {
    const server = new RealtimeServer();
    server.start().catch(console.error);
}
//# sourceMappingURL=index.js.map