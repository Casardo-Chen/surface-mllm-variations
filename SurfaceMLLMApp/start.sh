#!/bin/bash

# Surface MLLM React Native App Startup Script

echo "🚀 Starting Surface MLLM React Native App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Install React Native dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing React Native dependencies..."
    npm install
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if Python dependencies are installed
echo "🐍 Checking Python dependencies..."
cd backend
python3 -c "import requests, openai, anthropic, google" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install requests openai anthropic google-generativeai python-dotenv
fi
cd ..

# Create uploads directory if it doesn't exist
mkdir -p backend/uploads

# Start backend server in background
echo "🔧 Starting backend server..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend server is running on http://localhost:8000"
else
    echo "❌ Backend server failed to start. Please check the logs."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now:"
echo "   • Run 'npm run android' to start Android app"
echo "   • Run 'npm run ios' to start iOS app"
echo "   • Backend API is available at http://localhost:8000"
echo ""
echo "📱 To start the React Native app, run one of these commands:"
echo "   npm run android  # For Android"
echo "   npm run ios      # For iOS"
echo ""
echo "🛑 To stop the backend server, run: kill $BACKEND_PID"
echo ""

# Keep script running to maintain backend process
wait $BACKEND_PID
