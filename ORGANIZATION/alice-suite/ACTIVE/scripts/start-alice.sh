#!/bin/bash

# Alice Suite Startup Script
# This script starts both Alice Reader and Alice Consultant Dashboard

echo "🚀 Starting Alice Suite..."
echo "=========================="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Function to start an app
start_app() {
    local app_name=$1
    local app_dir=$2
    local port=$3
    
    echo "📱 Starting $app_name on port $port..."
    
    if check_port $port; then
        cd "$app_dir"
        echo "   📂 Working directory: $(pwd)"
        echo "   🔧 Running: npm run dev"
        npm run dev &
        echo "   ✅ $app_name started in background"
        sleep 2
    else
        echo "   ❌ Skipping $app_name (port $port busy)"
    fi
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📍 Script location: $SCRIPT_DIR"
echo ""

# Start Alice Reader (port 5173)
start_app "Alice Reader" "alice-reader" 5173

# Start Alice Consultant Dashboard (port 5174)
start_app "Alice Consultant Dashboard" "alice-consultant-dashboard" 5174

echo ""
echo "🎉 Alice Suite startup complete!"
echo "================================"
echo "📖 Alice Reader: http://localhost:5173"
echo "👨‍💼 Alice Consultant Dashboard: http://localhost:5174"
echo ""
echo "💡 To stop the apps, use: pkill -f 'npm run dev'"
echo "💡 To check if they're running: lsof -i :5173 && lsof -i :5174" 