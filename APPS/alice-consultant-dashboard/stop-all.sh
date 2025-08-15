#!/bin/bash

# Alice Consultant Dashboard - Stop All Services
# This script stops both the WebSocket server and the React dashboard

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🛑 Stopping Alice Consultant Dashboard Services${NC}"
echo "=============================================="

# Function to kill process by PID file
kill_by_pid_file() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}Stopping $service_name (PID: $pid)...${NC}"
            kill "$pid" 2>/dev/null || true
            
            # Wait for process to die
            local counter=0
            while kill -0 "$pid" 2>/dev/null && [ $counter -lt 10 ]; do
                sleep 0.5
                ((counter++))
            done
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${RED}Force killing $service_name...${NC}"
                kill -9 "$pid" 2>/dev/null || true
            fi
            
            rm -f "$pid_file"
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name process not found (PID: $pid)${NC}"
            rm -f "$pid_file"
        fi
    else
        echo -e "${YELLOW}ℹ️  $service_name PID file not found${NC}"
    fi
}

# Function to kill process by port
kill_by_port() {
    local port=$1
    local service_name=$2
    
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Stopping $service_name on port $port...${NC}"
        kill $pids 2>/dev/null || true
        
        # Wait for processes to die
        local counter=0
        for pid in $pids; do
            while kill -0 "$pid" 2>/dev/null && [ $counter -lt 10 ]; do
                sleep 0.5
                ((counter++))
            done
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${RED}Force killing $service_name (PID: $pid)...${NC}"
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
        
        echo -e "${GREEN}✅ $service_name stopped${NC}"
    else
        echo -e "${YELLOW}ℹ️  No $service_name process found on port $port${NC}"
    fi
}

# Stop WebSocket server
kill_by_pid_file "logs/websocket.pid" "WebSocket Server"
kill_by_port 3001 "WebSocket Server"

# Stop React dashboard
kill_by_pid_file "logs/dashboard.pid" "React Dashboard"
kill_by_port 5173 "React Dashboard (Vite)"
kill_by_port 3000 "React Dashboard (CRA)"

# Kill any Node.js processes that might be running our services
pids=$(ps aux | grep -E "(node.*server|npm.*dev|npm.*start|vite)" | grep -v grep | awk '{print $2}')
if [ -n "$pids" ]; then
    echo -e "${YELLOW}🔍 Found additional Node.js processes...${NC}"
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}Stopping Node.js process (PID: $pid)...${NC}"
            kill "$pid" 2>/dev/null || true
        fi
    done
fi

# Clean up PID files
echo -e "${YELLOW}🧹 Cleaning up PID files...${NC}"
rm -f logs/*.pid

# Check if services are actually stopped
echo ""
echo -e "${GREEN}🔍 Verifying services are stopped...${NC}"
echo "================================="

webSocketRunning=false
dashboardRunning=false

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}❌ WebSocket server still running on port 3001${NC}"
    webSocketRunning=true
else
    echo -e "${GREEN}✅ WebSocket server is stopped${NC}"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}❌ React dashboard still running on port 5173${NC}"
    dashboardRunning=true
elif lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}❌ React dashboard still running on port 3000${NC}"
    dashboardRunning=true
else
    echo -e "${GREEN}✅ React dashboard is stopped${NC}"
fi

if [ "$webSocketRunning" = false ] && [ "$dashboardRunning" = false ]; then
    echo ""
    echo -e "${GREEN}🎉 All services stopped successfully!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Some services may still be running.${NC}"
    echo -e "${YELLOW}You can manually check with: lsof -i :3000,3001,5173${NC}"
fi

# Show final process list
echo ""
echo -e "${GREEN}📊 Current Node.js processes:${NC}"
ps aux | grep -E "(node|npm)" | grep -v grep || echo "No Node.js processes found"