#!/bin/bash

# Alice Suite - Check Status
# This script checks if both Alice apps are running

echo "🔍 Checking Alice Suite Status..."
echo "================================"

# Check Alice Reader (port 5173)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Alice Reader: RUNNING on http://localhost:5173"
else
    echo "❌ Alice Reader: NOT RUNNING"
fi

# Check Alice Consultant Dashboard (port 5174)
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Alice Consultant Dashboard: RUNNING on http://localhost:5174"
else
    echo "❌ Alice Consultant Dashboard: NOT RUNNING"
fi

echo ""
echo "💡 To start both apps: ./start-both-apps.sh"
echo "💡 To kill all apps: ./kill-all.sh" 