@echo off
cd /d "%~dp0"
echo Starting FastAPI Floorplan Preprocessing Service...
echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.
echo Starting uvicorn server on http://127.0.0.1:8000
echo.
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause

