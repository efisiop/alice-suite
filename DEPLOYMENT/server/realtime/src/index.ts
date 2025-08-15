import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { RedisService } from './services/redis.service';
import { EventBroadcaster } from './services/event-broadcaster';
import { EventQueueService } from './services/event-queue.service';
import { SupabaseClient } from './database/supabase-client';
import { SocketHandlers } from './handlers/socket-handlers';
import { RealTimeConfig } from './types';

dotenv.config();

const config: RealTimeConfig = {
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
  private app: express.Application;
  private server: any;
  private io!: Server;
  private redis!: RedisService;
  private broadcaster!: EventBroadcaster;
  private eventQueue!: EventQueueService;
  private supabase!: SupabaseClient;
  private handlers!: SocketHandlers;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.setupExpress();
    this.setupSocketIO();
    this.setupServices();
  }

  private setupExpress(): void {
    this.app.use(helmet());
    this.app.use(cors(config.cors));
    this.app.use(express.json());

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
      } catch (error) {
        res.status(500).json({ error: 'Failed to get stats' });
      }
    });
  }

  private setupSocketIO(): void {
    this.io = new Server(this.server, {
      cors: config.cors,
      transports: ['websocket', 'polling']
    });
  }

  private async setupServices(): Promise<void> {
    try {
      // Initialize Redis
      this.redis = new RedisService(config.redis);
      await this.redis.connect();

      // Initialize Supabase
      this.supabase = new SupabaseClient();

      // Initialize Event Broadcaster
      this.broadcaster = new EventBroadcaster(this.io, this.redis);

      // Initialize Event Queue
      this.eventQueue = new EventQueueService(this.redis);

      // Initialize Socket Handlers
      this.handlers = new SocketHandlers(
        this.io,
        this.broadcaster,
        this.eventQueue,
        this.supabase
      );

      // Setup middleware and handlers
      this.handlers.setupMiddleware();

      // Setup Socket.IO connection handler
      this.io.on('connection', (socket) => {
        console.log(`🔗 New connection: ${socket.id}`);
        this.handlers.handleConnection(socket);
      });

    } catch (error) {
      console.error('❌ Error setting up services:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
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

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  async shutdown(): Promise<void> {
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

    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the server
if (require.main === module) {
  const server = new RealtimeServer();
  server.start().catch(console.error);
}

export { RealtimeServer };