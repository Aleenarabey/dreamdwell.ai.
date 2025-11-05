@echo off
cd /d "%~dp0"
call venv\Scripts\activate.bat
echo Starting ML Service on port 8001...
python -m uvicorn server:app --host 0.0.0.0 --port 8001
pause

