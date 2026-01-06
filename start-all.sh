#!/bin/bash

echo "🚀 Starting E-commerce Application..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null && ! pgrep -x "mongodb" > /dev/null; then
    echo "⚠️  MongoDB doesn't appear to be running"
    echo "💡 Start it with: brew services start mongodb-community"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MongoDB is running"
fi

echo ""
echo "📦 Starting Backend Server (Port 5001)..."
cd backend
PORT=5001 npm start &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   API: http://localhost:5001/api"
echo "   Health: http://localhost:5001/api/health"
echo ""

# Wait a bit for backend to start
sleep 3

echo "🌐 Starting Frontend Server (Port 5173)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   URL: http://localhost:5173"
echo ""

echo "=========================================="
echo "✅ All services started!"
echo "=========================================="
echo ""
echo "📋 Access Points:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5001/api"
echo ""
echo "👤 Test Accounts:"
echo "   User:   user@test.com / user123456"
echo "   Admin:  admin@test.com / admin123456"
echo "   Seller: seller@test.com / seller123456"
echo ""
echo "💡 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
wait
