#!/bin/bash
echo "==================================="
echo "Starting Hermes Servers..."
echo "==================================="

# Start backend in the background
cd backend || exit
python main.py &
BACKEND_PID=$!
cd ..

# Start frontend in the background
cd frontend || exit
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Servers are launching!"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait and trap termination signals
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
