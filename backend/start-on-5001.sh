#!/bin/bash

echo "🚀 Starting Backend on Port 5001"
echo "================================="
echo ""

# Kill any process on port 5001
if lsof -ti:5001 > /dev/null 2>&1; then
    echo "⚠️  Port 5001 is in use, freeing it..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null
    sleep 2
    echo "✅ Port 5001 is now free"
fi

echo ""
echo "📦 Starting backend server on port 5001..."
echo ""

# Explicitly set PORT=5001 and start
PORT=5001 npm start
