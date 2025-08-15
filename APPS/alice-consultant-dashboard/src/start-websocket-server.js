import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const PORT = process.env.WS_PORT || 3001; // Use port 3001 instead of 8080

function startWebSocketServer(port) {
  try {
    const wss = new WebSocketServer({ port });

    console.log(`WebSocket server started on port ${port}`);

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', message => {
    console.log('received: %s', message);
    // Broadcast the message to all clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

    wss.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying port ${port + 1}...`);
        startWebSocketServer(port + 1);
      } else {
        console.error('WebSocket server error:', error);
      }
    });

    return wss;
  } catch (error) {
    console.error('Failed to start WebSocket server:', error);
    return null;
  }
}

startWebSocketServer(PORT);