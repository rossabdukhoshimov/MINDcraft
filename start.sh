#!/bin/bash

echo "🚀 Starting MindCraft Educational Game..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

print_success "Python and Node.js are installed"

# Function to cleanup existing processes
cleanup_existing_processes() {
    print_status "Cleaning up any existing MindCraft processes..."
    
    # Kill any existing Python Flask processes
    pkill -f "python.*app.py" 2>/dev/null || true
    pkill -f "python.*flask" 2>/dev/null || true
    pkill -f "python.*app" 2>/dev/null || true
    
    # Kill any existing React processes
    pkill -f "react-scripts" 2>/dev/null || true
    pkill -f "node.*start" 2>/dev/null || true
    
    # Force kill any processes on common ports
    for port in 5000 5001 3000 3001; do
        if lsof -i :$port > /dev/null 2>&1; then
            print_warning "Found processes on port $port, force killing..."
            lsof -ti :$port | xargs kill -9 2>/dev/null || true
        fi
    done
    
    sleep 2
}

# Clean up existing processes
cleanup_existing_processes

# Function to find an available port
find_available_port() {
    local port=$1
    local max_attempts=10
    local attempts=0
    
    while [ $attempts -lt $max_attempts ]; do
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo $port
            return 0
        fi
        print_warning "Port $port is in use, trying next port..."
        port=$((port + 1))
        attempts=$((attempts + 1))
    done
    
    print_error "Could not find an available port after $max_attempts attempts"
    exit 1
}

# Find available ports
BACKEND_PORT=$(find_available_port 5001)
FRONTEND_PORT=3000

print_status "Backend will run on port $BACKEND_PORT"
print_status "Frontend will run on port $FRONTEND_PORT"

# Update backend port in app.py
print_status "Updating backend port configuration..."
sed -i.bak "s/port=[0-9]*/port=$BACKEND_PORT/g" backend/app.py

# Update frontend configuration
print_status "Updating frontend configuration..."
sed -i.bak "s/localhost:[0-9]*/localhost:$BACKEND_PORT/g" frontend/src/App.js
sed -i.bak "s/localhost:[0-9]*/localhost:$BACKEND_PORT/g" frontend/package.json

# Setup Backend
print_status "Setting up Python backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating environment file..."
    cat > .env << 'EOF'
# Flask Configuration
SECRET_KEY=mindcraft-super-secret-key-change-this-in-production
JWT_SECRET_KEY=mindcraft-jwt-secret-key-change-this-in-production

# Database Configuration
DATABASE_URL=sqlite:///mindcraft.db

# Development Settings
FLASK_ENV=development
DEBUG=True
EOF
fi

# Initialize database
print_status "Initializing database..."
python init_db.py

print_success "Backend setup complete!"

# Kill any existing processes on the backend port
print_status "Ensuring port $BACKEND_PORT is free..."
pkill -f "python.*app.py" 2>/dev/null || true
pkill -f "python.*flask" 2>/dev/null || true
pkill -f "python.*app" 2>/dev/null || true

# Force kill any processes on the target port
if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
    print_warning "Found processes on port $BACKEND_PORT, force killing..."
    lsof -ti :$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    sleep 3
fi

# Double check port is free
if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
    print_error "Port $BACKEND_PORT is still in use after cleanup attempts"
    exit 1
fi

# Start backend server in background
print_status "Starting backend server on port $BACKEND_PORT..."
python app.py > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for the process to start
sleep 3

# Verify the process is actually running
if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
    print_error "Backend process failed to start. Check backend.log for details."
    cat ../backend.log
    exit 1
fi

# Wait for backend to start
print_status "Waiting for backend to start (up to 45 seconds)..."
for i in {1..45}; do
    # Try multiple health check approaches
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        print_success "Backend server is running on http://localhost:$BACKEND_PORT"
        break
    elif curl -s http://127.0.0.1:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        print_success "Backend server is running on http://127.0.0.1:$BACKEND_PORT"
        break
    elif netstat -an 2>/dev/null | grep ":$BACKEND_PORT.*LISTEN" > /dev/null 2>&1; then
        print_success "Backend server is running on port $BACKEND_PORT (detected via netstat)"
        break
    elif lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
        print_success "Backend server is running on port $BACKEND_PORT (detected via lsof)"
        break
    fi
    
    if [ $i -eq 45 ]; then
        print_error "Backend server failed to start after 45 seconds. Check backend.log for details."
        print_status "Backend log contents:"
        cat ../backend.log
        print_status "Testing backend manually:"
        curl -v http://localhost:$BACKEND_PORT/api/health || echo "curl failed"
        curl -v http://127.0.0.1:$BACKEND_PORT/api/health || echo "curl failed"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    # Show progress every 5 seconds
    if [ $((i % 5)) -eq 0 ]; then
        print_status "Still waiting for backend... ($i/45 seconds)"
    fi
    
    sleep 1
done

# Setup Frontend
print_status "Setting up React frontend..."
cd ../frontend

# Install Node.js dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing Node.js dependencies..."
    npm install > /dev/null 2>&1
fi

print_success "Frontend setup complete!"

# Kill any existing processes on the frontend port
print_status "Ensuring port $FRONTEND_PORT is free..."
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "node.*start" 2>/dev/null || true

# Force kill any processes on the target port
if lsof -i :$FRONTEND_PORT > /dev/null 2>&1; then
    print_warning "Found processes on port $FRONTEND_PORT, force killing..."
    lsof -ti :$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
    sleep 3
fi

# Double check port is free
if lsof -i :$FRONTEND_PORT > /dev/null 2>&1; then
    print_error "Port $FRONTEND_PORT is still in use after cleanup attempts"
    exit 1
fi

# Start frontend server in background
print_status "Starting frontend server on port $FRONTEND_PORT..."
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
print_status "Waiting for frontend to start..."
for i in {1..60}; do
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        print_success "Frontend server is running on http://localhost:$FRONTEND_PORT"
        break
    fi
    if [ $i -eq 60 ]; then
        print_warning "Frontend server might still be starting up..."
    fi
    sleep 1
done

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "python.*app.py" 2>/dev/null || true
    pkill -f "react-scripts" 2>/dev/null || true
    print_success "Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo ""
echo "🎉 MindCraft is now running!"
echo "============================"
echo "🌐 Frontend: http://localhost:$FRONTEND_PORT"
echo "🔧 Backend API: http://localhost:$BACKEND_PORT"
echo ""
echo "👤 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📝 Logs:"
echo "   Backend: backend.log"
echo "   Frontend: frontend.log"
echo ""
echo "🛑 Press Ctrl+C to stop both servers"
echo ""

# Keep script running
while true; do
    sleep 1
done
