# Alice Suite Realtime Server

A high-performance WebSocket server for real-time communication between Alice Reader and Consultant Dashboard applications.

## 🚀 Features

- **Real-time WebSocket connections** with Socket.IO
- **Redis Pub/Sub** for scalable event broadcasting
- **Event queuing** with retry mechanisms
- **JWT authentication** and role-based access control
- **Rate limiting** and security middleware
- **Comprehensive monitoring** and logging
- **Supabase integration** for persistent storage
- **Docker support** for easy deployment

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit environment variables
nano .env
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REALTIME_PORT` | Server port | `3001` |
| `REDIS_HOST` | Redis server host | `localhost` |
| `REDIS_PORT` | Redis server port | `6379` |
| `REDIS_PASSWORD` | Redis password | - |
| `SUPABASE_URL` | Supabase project URL | - |
| `SUPABASE_ANON_KEY` | Supabase anon key | - |
| `SUPABASE_SERVICE_KEY` | Supabase service key | - |
| `JWT_SECRET` | JWT signing secret | - |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000,http://localhost:5173,http://localhost:5174` |
| `LOG_LEVEL` | Logging level | `info` |

## 🏃‍♂️ Running the Server

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### With Docker

```bash
# Build image
docker build -t alice-realtime .

# Run container
docker run -p 3001:3001 --env-file .env alice-realtime
```

## 📡 API Endpoints

### REST Endpoints

- `GET /health` - Health check
- `GET /stats` - Server statistics

### WebSocket Events

#### Client → Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `subscribe-consultant` | Subscribe to consultant events | `{ consultantId: string, eventTypes: string[] }` |
| `unsubscribe-consultant` | Unsubscribe from consultant events | `{ consultantId: string }` |
| `reader-event` | Send reader event | `{ eventType: string, data: any }` |
| `join-room` | Join a room | `string` |
| `leave-room` | Leave a room | `string` |
| `get-online-readers` | Get current online readers | - |
| `get-recent-events` | Get recent events | `{ limit?: number, userId?: string }` |

#### Server → Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `reader-activity` | New reader activity | `{ userId: string, eventType: string, data: any, timestamp: Date }` |
| `online-readers` | Online readers update | `{ count: number, readers: OnlineReader[] }` |
| `recent-events` | Recent events list | `{ events: RealTimeEvent[] }` |
| `event-error` | Error notification | `{ message: string, code?: string }` |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring

The server includes comprehensive monitoring:

- **Health checks** via `/health` endpoint
- **Performance metrics** via `/stats` endpoint
- **Structured logging** with Winston
- **Error tracking** and alerting
- **Connection monitoring**
- **Event processing metrics**

### Monitoring Endpoints

- `GET /health` - Basic health check
- `GET /stats` - Detailed system statistics
- WebSocket events for real-time monitoring

## 🔐 Security

- JWT token authentication
- Role-based access control (reader/consultant/admin)
- Rate limiting per user
- CORS configuration
- Input validation
- Error handling without information leakage

## 🚀 Deployment

### Environment Setup

1. **Redis**: Ensure Redis is running and accessible
2. **Supabase**: Set up Supabase project with required tables
3. **Environment**: Configure all required environment variables

### Production Checklist

- [ ] Set secure JWT secret
- [ ] Configure production Redis with password
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting appropriately
- [ ] Set up log rotation
- [ ] Configure health checks
- [ ] Set up monitoring alerts

## 📁 Project Structure

```
server/realtime/
├── src/
│   ├── index.ts                 # Server entry point
│   ├── types/                   # TypeScript type definitions
│   ├── services/                # Core services
│   │   ├── redis.service.ts     # Redis operations
│   │   ├── event-broadcaster.ts # Event broadcasting
│   │   └── event-queue.service.ts # Event queuing
│   ├── handlers/                # Socket.IO handlers
│   │   └── socket-handlers.ts   # Connection handling
│   ├── middleware/              # Express/Socket.IO middleware
│   │   └── auth.middleware.ts   # Authentication
│   ├── database/                # Database operations
│   │   └── supabase-client.ts   # Supabase client
│   └── utils/                   # Utilities
│       ├── logger.ts            # Logging configuration
│       └── monitoring.ts        # Monitoring service
├── __tests__/                   # Test files
├── Dockerfile                   # Docker configuration
└── README.md                    # This file
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection refused**: Check Redis and network connectivity
2. **Authentication errors**: Verify JWT tokens and Supabase credentials
3. **High latency**: Check Redis performance and network conditions
4. **Memory usage**: Monitor event queue size and adjust limits

### Debug Mode

Enable debug mode by setting environment variable:

```bash
DEBUG=socket.io* npm run dev
```

### Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details