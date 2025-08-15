#!/bin/bash

# Alice Suite - Start Both Apps
# This script starts both Alice Reader and Alice Consultant Dashboard

echo "🚀 Starting Alice Suite - Both Apps"
echo "=================================="
echo "💡 Quick commands:"
echo "   - Stop apps: Ctrl+C"
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

# Check if we're in the right directory
if [ ! -d "alice-reader" ] || [ ! -d "alice-consultant-dashboard" ]; then
    echo "❌ Error: Please run this script from the alice-suite root directory"
    echo "   Expected directories: alice-reader, alice-consultant-dashboard"
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
    kill_port 5173
    kill_port 5174
fi

echo "✅ Environment check passed"
echo ""

# Start Alice Reader (port 5173)
echo "📖 Starting Alice Reader on port 5173..."
cd alice-reader
PORT=5173 npm run dev -- --port 5173 --strictPort &
READER_PID=$!
cd ..

# Wait a moment for the first app to start
sleep 3

# Start Alice Consultant Dashboard (port 5174)
echo "📊 Starting Alice Consultant Dashboard on port 5174..."
cd alice-consultant-dashboard
PORT=5174 npm run dev -- --port 5174 --strictPort &
DASHBOARD_PID=$!
cd ..

echo ""
echo "🎉 Both apps are starting up!"
echo ""
echo "📖 Alice Reader: http://localhost:5173"
echo "📊 Consultant Dashboard: http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop both apps"
echo ""

# Wait for both processes
wait $READER_PID $DASHBOARD_PID