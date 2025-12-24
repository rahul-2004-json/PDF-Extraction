@echo off
echo Starting Order Form Extraction API Server...
pause
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

