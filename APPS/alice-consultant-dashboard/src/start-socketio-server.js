const { Server } = require('socket.io');
const http = require('http');

const PORT = process.env.SOCKETIO_PORT || 3001;

// Create HTTP server
const server = http.createServer();

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // In production, specify your actual origins
    methods: ["GET", "POST"]
  }
});

// Store online readers
const onlineReaders = new Map();

// Middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    // In a real app, you'd verify the token here
    console.log('Client authenticated with token');
    next();
  } else {
    console.log('Client connected without token');
    next(); // Allow connection for demo purposes
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Subscribe to consultant events
  socket.on('subscribe-consultant-events', () => {
    console.log('Client subscribed to consultant events');
    
    // Send initial online readers
    socket.emit('online-readers', {
      readers: Array.from(onlineReaders.values())
    });
  });

  // Get online readers
  socket.on('get-online-readers', () => {
    socket.emit('online-readers', {
      readers: Array.from(onlineReaders.values())
    });
  });

  // Simulate reader login events
  socket.on('simulate-reader-login', (data) => {
    const loginEvent = {
      type: 'LOGIN',
      userId: data.userId || `user_${Date.now()}`,
      userEmail: data.email || `user${Date.now()}@example.com`,
      userName: data.name || `User ${Date.now()}`,
      timestamp: new Date().toISOString(),
      metadata: {
        device: 'Chrome on Windows',
        browser: 'Chrome',
        ipAddress: '192.168.1.100'
      }
    };

    // Add to online readers
    onlineReaders.set(loginEvent.userId, {
      userId: loginEvent.userId,
      firstName: loginEvent.userName.split(' ')[0],
      lastName: loginEvent.userName.split(' ')[1] || '',
      email: loginEvent.userEmail,
      lastActivity: new Date(loginEvent.timestamp),
      isActive: true
    });

    // Broadcast to all clients
    io.emit('reader-activity', loginEvent);
    io.emit('online-readers', {
      readers: Array.from(onlineReaders.values())
    });
  });

  // Simulate reader logout events
  socket.on('simulate-reader-logout', (data) => {
    const userId = data.userId;
    const reader = onlineReaders.get(userId);
    
    if (reader) {
      const logoutEvent = {
        type: 'LOGOUT',
        userId: userId,
        userEmail: reader.email,
        userName: `${reader.firstName} ${reader.lastName}`,
        timestamp: new Date().toISOString(),
        metadata: {
          loginDuration: Math.floor(Math.random() * 3600) // Random duration
        }
      };

      // Remove from online readers
      onlineReaders.delete(userId);

      // Broadcast to all clients
      io.emit('reader-activity', logoutEvent);
      io.emit('online-readers', {
        readers: Array.from(onlineReaders.values())
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Add some demo data on startup
setTimeout(() => {
  const demoReaders = [
    {
      userId: 'demo_user_1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      lastActivity: new Date(),
      currentBook: 'The Great Gatsby',
      isActive: true
    },
    {
      userId: 'demo_user_2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
      lastActivity: new Date(Date.now() - 120000), // 2 minutes ago
      currentBook: '1984',
      isActive: true
    },
    {
      userId: 'demo_user_3',
      firstName: 'Carol',
      lastName: 'Williams',
      email: 'carol.williams@example.com',
      lastActivity: new Date(Date.now() - 300000), // 5 minutes ago
      currentBook: 'To Kill a Mockingbird',
      isActive: true
    }
  ];

  demoReaders.forEach(reader => {
    onlineReaders.set(reader.userId, reader);
  });

  console.log('Demo readers added:', demoReaders.length);
}, 1000);

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`📡 Clients can connect to: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down Socket.IO server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});