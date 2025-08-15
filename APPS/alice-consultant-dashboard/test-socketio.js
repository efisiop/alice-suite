#!/usr/bin/env node

// Test script to verify Socket.IO server is running
const io = require('socket.io-client');

const socketUrl = process.env.VITE_REALTIME_URL || 'http://localhost:3001';

console.log(`Testing Socket.IO server at: ${socketUrl}`);

const socket = io(socketUrl, {
  auth: {
    token: 'test-token'
  },
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ Successfully connected to Socket.IO server');
  
  // Subscribe to consultant events
  socket.emit('subscribe-consultant-events');
  
  // Get online readers
  socket.emit('get-online-readers');
});

socket.on('online-readers', (data) => {
  console.log('📋 Online readers:', data.readers);
  console.log(`Found ${data.readers.length} readers online`);
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('💡 Make sure the Socket.IO server is running: node src/start-socketio-server.js');
  process.exit(1);
});

socket.on('connect_timeout', () => {
  console.error('❌ Connection timeout');
  console.log('💡 Make sure the Socket.IO server is running: node src/start-socketio-server.js');
  process.exit(1);
});

// Wait for 3 seconds max
setTimeout(() => {
  console.error('❌ Connection took too long');
  socket.disconnect();
  process.exit(1);
}, 3000);