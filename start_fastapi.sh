#!/bin/bash

# Startup script for FastAPI backend
# This script starts the FastAPI backend on port 8001

cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Install dependencies if needed
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
fi

# Start FastAPI backend on port 8001
echo "Starting FastAPI backend on port 8001..."
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
