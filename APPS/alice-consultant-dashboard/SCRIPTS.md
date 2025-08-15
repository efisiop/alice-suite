# 🚀 Startup and Shutdown Scripts

This document explains how to use the unified startup and shutdown scripts for the Alice Consultant Dashboard.

## Quick Start

### Using npm scripts (Recommended)
```bash
# Start all services
npm run start-all

# Stop all services
npm run stop-all

# View real-time logs
npm run logs

# Clean logs and cache
npm run clean
```

### Using shell scripts directly
```bash
# Start all services
./start-all.sh

# Stop all services
./stop-all.sh
```

## Services Started

When you run `npm run start-all` or `./start-all.sh`, the following services are started:

1. **WebSocket Server** (Port 3001)
   - Handles real-time communication
   - Manages online readers and consultant notifications
   - Logs: `logs/websocket.log`

2. **React Dashboard** (Port 5173)
   - Consultant dashboard interface
   - Built with Vite for development
   - Logs: `logs/dashboard.log`

## Features

### Automatic Port Management
- Checks if ports are already in use
- Kills existing processes on startup
- Provides clear error messages

### Logging
- All services log to the `logs/` directory
- Separate log files for each service
- Easy log viewing with `npm run logs`

### Error Handling
- Validates Node.js and npm are installed
- Handles missing dependencies gracefully
- Provides fallback WebSocket server if none exists

### Process Management
- Creates PID files for easy process tracking
- Graceful shutdown with timeout handling
- Force kill option for stubborn processes

## Troubleshooting

### Check if services are running
```bash
# List running Node.js processes
ps aux | grep node

# Check specific ports
lsof -i :3001  # WebSocket server
lsof -i :5173  # React dashboard
```

### View logs
```bash
# Real-time logs for both services
npm run logs

# Individual log files
tail -f logs/websocket.log
tail -f logs/dashboard.log
```

### Manual restart
```bash
npm run stop-all
sleep 2
npm run start-all
```

### Reset everything
```bash
npm run stop-all
npm run clean
npm install
npm run start-all
```

## Environment Variables

You can customize the behavior with these environment variables:

```bash
# WebSocket server port
export PORT=3001

# React dashboard port (Vite)
export VITE_PORT=5173

# Disable real-time features
export VITE_ENABLE_REALTIME=false
```

## File Structure

```
alice-consultant-dashboard/
├── start-all.sh          # Start all services
├── stop-all.sh           # Stop all services
├── logs/                 # Log directory
│   ├── websocket.log     # WebSocket server logs
│   ├── dashboard.log     # React dashboard logs
│   ├── websocket.pid     # WebSocket server PID
│   └── dashboard.pid     # React dashboard PID
└── package.json          # npm scripts
```

## System Requirements

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Unix-like environment** (Linux, macOS, WSL on Windows)
- **Port availability**: 3001, 5173

## Windows Users

For Windows users, you can use:
- **WSL (Windows Subsystem for Linux)** - recommended
- **Git Bash** or **PowerShell** with minor modifications
- **Docker** with a Node.js container

## Docker Alternative

If you prefer Docker, you can use:

```bash
# Build and run with Docker
docker-compose up --build

# Or use the provided scripts with Docker
docker run -p 3001:3001 -p 5173:5173 node:18-alpine sh -c "npm install && npm run start-all"
```