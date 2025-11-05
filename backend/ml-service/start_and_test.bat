@echo off
echo Starting ML Service...
cd /d "%~dp0"
call venv\Scripts\activate.bat
start "ML Service" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8001"
timeout /t 3 /nobreak >nul
echo.
echo Testing service...
python test_service.py
pause

