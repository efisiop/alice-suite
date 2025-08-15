// Use the native WebSocket in the browser
let ws: WebSocket | null = null;
const WS_URL = 'ws://localhost:3001'; // URL of the consultant dashboard WebSocket server

export const initializeActivityLogger = () => {
  if (ws) return; // Already initialized

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('Connected to activity WebSocket server');
  };

  ws.onerror = (error) => {
    console.error('Activity WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('Disconnected from activity WebSocket server');
    ws = null;
    // Attempt to reconnect after a delay
    setTimeout(initializeActivityLogger, 5000);
  };
};

export const sendActivity = (activity: any) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(activity));
  } else {
    console.warn('WebSocket not open, activity not sent:', activity);
  }
};
