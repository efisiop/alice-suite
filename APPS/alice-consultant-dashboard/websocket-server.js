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
