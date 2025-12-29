#!/bin/bash

echo "🚀 Starting E-commerce Website..."
echo ""

# Check if MongoDB is running (optional check)
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  Warning: MongoDB might not be running"
    echo "   Make sure MongoDB is started or using MongoDB Atlas"
fi

# Start backend in background
echo "📦 Starting backend server on port 5002..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "⚛️  Starting frontend on port 3000..."
cd frontend
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers starting..."
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🌐 Opening browser in 5 seconds..."
sleep 5
open http://localhost:3000

echo ""
echo "✨ Website should open in your browser!"
echo "   To stop servers: kill $BACKEND_PID $FRONTEND_PID"

