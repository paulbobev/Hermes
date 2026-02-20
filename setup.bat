@echo off
echo ===================================
echo Hermes Setup Script
echo ===================================

echo.
echo [1/2] Installing backend Python dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo [2/2] Installing frontend Next.js dependencies...
cd frontend
call npm install
cd ..

echo.
echo ===================================
echo Setup complete! You can now run the app using run.bat
echo ===================================
pause
