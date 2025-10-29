@echo off
echo 🚀 Starting DreamDwell Services
echo.

echo 📦 Starting Node.js Backend (Port 5000)...
start "Node.js Backend" cmd /k "cd backend && npm start"

echo.
echo 🐍 Starting FastAPI Service (Port 8000)...
start "FastAPI Service" cmd /k "cd py-processing && python main.py"

echo.
echo ⚛️ Starting React Frontend (Port 3000)...
start "React Frontend" cmd /k "npm start"

echo.
echo ✅ All services starting...
echo 📍 Backend: http://localhost:5000
echo 📍 FastAPI: http://127.0.0.1:8000  
echo 📍 Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
