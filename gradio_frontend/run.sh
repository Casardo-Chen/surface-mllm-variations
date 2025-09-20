#!/bin/bash

# Vision-Language Model Variation Analysis - Gradio Frontend Launcher

echo "Starting Vision-Language Model Variation Analysis Frontend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Check if backend is running
echo "Checking backend connection..."
if curl -s http://127.0.0.1:8000 > /dev/null; then
    echo "Backend is running ✓"
else
    echo "Warning: Backend not detected at http://127.0.0.1:8000"
    echo "Please start the backend server before using the frontend"
fi

# Start the Gradio app
echo "Starting Gradio interface..."
python app.py

