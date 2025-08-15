#!/bin/bash

# Start Real-time Server Only
echo "📡 Starting Socket.IO Real-time Server..."
echo "======================================="

# Kill any existing process on port 3001
PID=$(lsof -ti :3001 2>/dev/null)
if [ -n "$PID" ]; then
    echo "🔧 Killing existing process on port 3001 (PID: $PID)"
    kill -9 $PID
fi

cd APPS/alice-consultant-dashboard
npm run start-realtime