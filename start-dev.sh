#!/bin/bash

echo "🚀 Starting Noēsis Development Environment"
echo "=========================================="
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env not found. Please run setup.sh first."
    exit 1
fi

if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found. Please run setup.sh first."
    exit 1
fi

# Start databases with docker-compose
echo "📊 Starting databases (PostgreSQL, Neo4j, Redis)..."
cd backend
docker-compose up -d postgres neo4j redis

if [ $? -ne 0 ]; then
    echo "❌ Failed to start databases. Make sure Docker is running."
    exit 1
fi

echo "⏳ Waiting for databases to be ready (30 seconds)..."
sleep 30

# Start backend in background
echo "🐍 Starting FastAPI backend..."
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# Wait a bit for backend to start
sleep 5

# Start frontend
echo "⚛️ Starting Next.js frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment started!"
echo ""
echo "📍 Services:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo "   - Neo4j Browser: http://localhost:7474"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    cd backend
    docker-compose stop
    echo "✅ All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
