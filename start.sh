#!/bin/bash

echo "🚀 Starting Campus Hub Development Servers..."

# Pre-kill lingering dev servers for clean start
pkill -f "python manage.py runserver" >/dev/null 2>&1 || true
pkill -f "next dev" >/dev/null 2>&1 || true

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    pkill -f "python manage.py runserver"
    pkill -f "next dev"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start Backend (Django)
echo "📡 Starting Django Backend..."
cd backend
source venv/bin/activate
python manage.py runserver 8000 --skip-checks &
BACKEND_PID=$!
cd ..

# Start Frontend (Next.js)
echo "🎨 Starting Next.js Frontend..."
cd frontend
export NEXT_TELEMETRY_DISABLED=1
npm run dev --silent &
FRONTEND_PID=$!
cd ..

echo "✅ Both servers are starting..."
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/swagger/"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID



