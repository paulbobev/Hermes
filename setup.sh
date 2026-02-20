#!/bin/bash
echo "==================================="
echo "Hermes Setup Script"
echo "==================================="

echo ""
echo "[1/2] Installing backend Python dependencies..."
cd backend || exit
pip install -r requirements.txt
cd ..

echo ""
echo "[2/2] Installing frontend Next.js dependencies..."
cd frontend || exit
npm install
cd ..

echo ""
echo "==================================="
echo "Setup complete! You can now run the app using ./run.sh"
echo "==================================="
