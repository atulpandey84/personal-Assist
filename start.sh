#!/bin/bash
# Multi-Agent Framework - Master Entry Point

# Ensure logs directory exists
mkdir -p logs

echo "Initializing Multi-Agent Framework..."

# 1. Start Background Service
bash scripts/background_service.sh > logs/background_service.log 2>&1 &
BG_PID=$!
echo "Background update service started (PID: $BG_PID)"

# 2. Start Backend Server
echo "Starting Backend Server on http://localhost:5000..."
python3 app.py > logs/app.log 2>&1 &
SERVER_PID=$!
echo "Backend server started (PID: $SERVER_PID)"

# Handle Shutdown
cleanup() {
    echo "Shutting down Multi-Agent Framework..."
    kill $BG_PID
    kill $SERVER_PID
    exit
}

trap cleanup SIGINT SIGTERM

echo "--------------------------------------------------"
echo "Standalone Multi-Agent Environment is now ONLINE."
echo "Access the UI: http://localhost:5000"
echo "Check logs/ directory for internal agent telemetry."
echo "Press Ctrl+C to stop all services."
echo "--------------------------------------------------"

# Keep script running
wait
