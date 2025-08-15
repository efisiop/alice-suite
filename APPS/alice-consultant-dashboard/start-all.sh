#!/bin/bash

# Alice Consultant Dashboard - Start All Services
# This script starts both the WebSocket server and the React dashboard

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Alice Consultant Dashboard Services${NC}"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if WebSocket server exists
if [ ! -f "server.js" ] && [ ! -f "src/server.js" ] && [ ! -f "websocket-server.js" ]; then
    echo -e "${YELLOW}⚠️  WebSocket server file not found. Creating a basic one...${NC}"
    cat > websocket-server.js << 'EOF'
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins in development
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true
  }
});

// Store online readers
let onlineReaders = new Map();

// Handle socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe-consultant-events', () => {
    console.log('Consultant subscribed to events');
    
    // Send initial online readers
    socket.emit('online-readers', {
      readers: Array.from(onlineReaders.values())
    });
  });
  
  socket.on('get-online-readers', () => {
    socket.emit('online-readers', {
      readers: Array.from(onlineReaders.values())
    });
  });
  
  socket.on('reader-login', (data) => {
    console.log('Reader logged in:', data);
    onlineReaders.set(data.userId, {
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      lastActivity: new Date(),
      isActive: true
    });
    
    // Broadcast to all consultants
    io.emit('reader-activity', {
      eventType: 'LOGIN',
      ...data,
      timestamp: new Date().toISOString()
    });
    
    io.emit('online-readers', {
      readers: Array.from(onlineReaders.values())
    });
  });
  
  socket.on('reader-logout', (data) => {
    console.log('Reader logged out:', data);
    onlineReaders.delete(data.userId);
    
    io.emit('reader-activity', {
      eventType: 'LOGOUT',
      ...data,
      timestamp: new Date().toISOString()
    });
    
    io.emit('online-readers', {
      readers: Array.from(onlineReaders.values())
    });
  });
  
  socket.on('reader-activity', (data) => {
    console.log('Reader activity:', data);
    if (onlineReaders.has(data.userId)) {
      const reader = onlineReaders.get(data.userId);
      reader.lastActivity = new Date();
      onlineReaders.set(data.userId, reader);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`📡 Real-time features available at ws://localhost:${PORT}`);
});
EOF
    
    # Install required dependencies for WebSocket server
    npm install express socket.io cors --save
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}🔒 Killing process on port $port...${NC}"
        kill -9 $pids 2>/dev/null || true
        sleep 2
    fi
}

# Start WebSocket server
echo -e "${YELLOW}🌐 Starting WebSocket server...${NC}"
if check_port 3001; then
    echo -e "${YELLOW}Port 3001 is already in use. Killing existing process...${NC}"
    kill_port 3001
fi

# Find and start WebSocket server
WS_SERVER_FILE=""
if [ -f "websocket-server.js" ]; then
    WS_SERVER_FILE="websocket-server.js"
elif [ -f "server.js" ]; then
    WS_SERVER_FILE="server.js"
elif [ -f "src/server.js" ]; then
    WS_SERVER_FILE="src/server.js"
else
    WS_SERVER_FILE="websocket-server.js"
fi

nohup node $WS_SERVER_FILE > logs/websocket.log 2>&1 &
WS_PID=$!
echo $WS_PID > logs/websocket.pid

echo -e "${GREEN}✅ WebSocket server started (PID: $WS_PID)${NC}"
echo -e "${GREEN}📋 WebSocket logs: logs/websocket.log${NC}"

# Wait for WebSocket server to start
sleep 3

# Start React dashboard
echo -e "${YELLOW}🎨 Starting React dashboard...${NC}"
if check_port 5173; then
    echo -e "${YELLOW}Port 5173 is already in use. Killing existing process...${NC}"
    kill_port 5173
fi

# Check if Vite is available
if npm list vite >/dev/null 2>&1; then
    # Using Vite (development)
    nohup npm run dev > logs/dashboard.log 2>&1 &
    DASH_PID=$!
    echo $DASH_PID > logs/dashboard.pid
    echo -e "${GREEN}✅ React dashboard started (PID: $DASH_PID)${NC}"
    echo -e "${GREEN}📋 Dashboard logs: logs/dashboard.log${NC}"
    echo -e "${GREEN}🌐 Dashboard URL: http://localhost:5173${NC}"
else
    # Using Create React App
    nohup npm start > logs/dashboard.log 2>&1 &
    DASH_PID=$!
    echo $DASH_PID > logs/dashboard.pid
    echo -e "${GREEN}✅ React dashboard started (PID: $DASH_PID)${NC}"
    echo -e "${GREEN}📋 Dashboard logs: logs/dashboard.log${NC}"
    echo -e "${GREEN}🌐 Dashboard URL: http://localhost:3000${NC}"
fi

# Wait for services to fully start
sleep 5

echo ""
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo "================================"
echo -e "WebSocket Server: ${GREEN}http://localhost:3001${NC}"
if npm list vite >/dev/null 2>&1; then
    echo -e "React Dashboard: ${GREEN}http://localhost:5173${NC}"
else
    echo -e "React Dashboard: ${GREEN}http://localhost:3000${NC}"
fi
echo ""
echo -e "${YELLOW}To stop all services, run:${NC} ./stop-all.sh"
echo -e "${YELLOW}To view logs:${NC}"
echo "  WebSocket: tail -f logs/websocket.log"
echo "  Dashboard: tail -f logs/dashboard.log"
echo ""
echo -e "${YELLOW}Service PIDs:${NC}"
echo "  WebSocket: $(cat logs/websocket.pid)"
echo "  Dashboard: $(cat logs/dashboard.pid)"