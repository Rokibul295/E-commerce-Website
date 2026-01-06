#!/bin/bash

echo "🚀 Starting Backend Server"
echo "=========================="
echo ""

# Kill any process on port 5000
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "⚠️  Port 5000 is in use, killing existing process..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null
    sleep 2
    echo "✅ Port 5000 is now free"
fi

echo ""
echo "📦 Starting backend server..."
echo "   MongoDB URI: mongodb://localhost:27017/ecommerce"
echo "   Server will run on: http://localhost:5000"
echo ""

cd backend
npm start
