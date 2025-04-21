# Run the backend and frontend in separate processes

Write-Host "Starting Data Insights Hub..." -ForegroundColor Green

# Start the backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot\backend; .\venv\Scripts\Activate.ps1; python -m uvicorn main:app --reload --port 8000"

# Start the frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot\frontend; npm run dev"

Write-Host "Services started!" -ForegroundColor Green
Write-Host "Backend running at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend running at: http://localhost:3000" -ForegroundColor Cyan