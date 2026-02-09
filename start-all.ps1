# Vault Gate - Start All Services
# Run this script to start ML Service, Backend, and Frontend

Write-Host "🚀 Starting Vault Gate Services..." -ForegroundColor Cyan
Write-Host ""

# Start ML Service
Write-Host "📊 Starting ML Anomaly Detection Service (Port 5001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Vault_Gate\ml-service; D:/Vault_Gate/.venv/Scripts/python.exe app.py"
Start-Sleep -Seconds 3

# Start Backend
Write-Host "⚙️  Starting Backend API Server (Port 5050)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Vault_Gate\backend; npm start"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "🎨 Starting Frontend Development Server (Port 5174)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Vault_Gate\frontend; npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ All services starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:5174" -ForegroundColor White
Write-Host "   Backend:   http://localhost:5050" -ForegroundColor White
Write-Host "   ML Service: http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Login as admin at http://localhost:5174/login" -ForegroundColor White
Write-Host "   2. Go to 'ML Anomaly Detection' in sidebar" -ForegroundColor White
Write-Host "   3. Click 'Train Model' button" -ForegroundColor White
Write-Host "   4. View real-time anomalies!" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
