#!/bin/bash

echo "Starting Order Form Extraction API Server..."
echo ""
echo "Make sure you have:"
echo "1. Created and activated a virtual environment"
echo "2. Installed requirements: pip install -r requirements.txt"
echo "3. Created .env file with GOOGLE_API_KEY"
echo ""
read -p "Press enter to continue..."

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

