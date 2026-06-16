#!/bin/bash

# Startup script for Node.js backend
# This script starts the Node.js backend on port 8000
# NOTE: The frontend now uses FastAPI on port 8001 for travel planning
# This Node.js backend is kept for other endpoints (auth, trips, chat, etc.)

cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Start Node.js backend on port 8000
echo "Starting Node.js backend on port 8000..."
npm start
