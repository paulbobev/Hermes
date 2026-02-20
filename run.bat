@echo off
echo ===================================
echo Starting Hermes Servers...
echo ===================================

cd backend
start "Hermes Backend" cmd /k "python main.py"
cd ..

cd frontend
start "Hermes Frontend" cmd /k "npm run dev"
cd ..

echo.
echo Servers are launching in separate windows!
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8000
echo.
echo Close the newly opened command windows to stop the servers.
pause
