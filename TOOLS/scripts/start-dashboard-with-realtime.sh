#!/bin/bash

# Alice Consultant Dashboard with Real-time Server
# This script starts both the Socket.IO server and the Consultant Dashboard

echo "🚀 Starting Consultant Dashboard with Real-time Server"
echo "=================================================="
echo "💡 Quick commands:"
echo "   - Stop all: Ctrl+C"
echo "   - Check status: ./check-status.sh"
echo "   - Kill all: ./kill-all.sh"
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all background processes..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Function to check if port is in use
is_port_in_use() {
    lsof -i :$1 > /dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti :$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "🔧 Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory (Project_1/alice-suite)
if [ ! -d "APPS/alice-consultant-dashboard" ]; then
    echo "❌ Error: Please run this script from the Project_1/alice-suite root directory"
    echo "   Expected directory: APPS/alice-consultant-dashboard"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

# Check if lsof is available (for port checking)
if ! command -v lsof &> /dev/null; then
    echo "⚠️  Warning: lsof not found, skipping port cleanup"
else
    # Clean up ports if they're in use
    kill_port 3001
    kill_port 5174
fi

echo "✅ Environment check passed"
echo ""

# Start Socket.IO server (port 3001)
echo "📡 Starting Socket.IO server on port 3001..."
cd APPS/alice-consultant-dashboard
npm run start-realtime &
REALTIME_PID=$!
cd ../..

# Wait for the server to start
sleep 3

# Start Consultant Dashboard (port 5174)
echo "📊 Starting Consultant Dashboard on port 5174..."
cd APPS/alice-consultant-dashboard
PORT=5174 npm run dev -- --port 5174 --strictPort &
DASHBOARD_PID=$!
cd ../..

echo ""
echo "🎉 Consultant Dashboard with Real-time features is starting up!"
echo ""
echo "📡 Socket.IO Server: http://localhost:3001"
echo "📊 Consultant Dashboard: http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for both processes
wait $REALTIME_PID $DASHBOARD_PID