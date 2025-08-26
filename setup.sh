#!/bin/bash

echo "🚀 Setting up MindCraft Web Game Application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Python and Node.js are installed"

# Setup Backend
echo "📦 Setting up Python backend..."
cd backend

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Initialize database
echo "Initializing database..."
python init_db.py

echo "✅ Backend setup complete!"

# Setup Frontend
echo "📦 Setting up React frontend..."
cd ../frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete!"

# Create .env file for backend
echo "🔧 Creating environment file..."
cd ../backend
if [ ! -f .env ]; then
    cat > .env << EOF
# Flask Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production

# Database Configuration
DATABASE_URL=sqlite:///mindcraft.db

# Development Settings
FLASK_ENV=development
DEBUG=True
EOF
    echo "✅ Environment file created"
else
    echo "ℹ️  Environment file already exists"
fi

cd ..

echo ""
echo "🎉 Setup complete! Here's how to run the application:"
echo ""
echo "📋 To start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   python app.py"
echo ""
echo "📋 To start the frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5001"
echo ""
echo "👤 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "Happy coding! 🎮"
