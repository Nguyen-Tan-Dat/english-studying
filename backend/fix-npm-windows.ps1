$ErrorActionPreference = "Stop"

Write-Host "Stopping Node processes..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Removing node_modules..."
if (Test-Path "node_modules") {
    cmd /c "rmdir /s /q node_modules"
}

Write-Host "Using official npm registry..."
npm config set registry https://registry.npmjs.org/ --location=project
npm config delete proxy --location=project 2>$null
npm config delete https-proxy --location=project 2>$null

Write-Host "Verifying npm cache..."
npm cache verify

Write-Host "Installing dependencies from package-lock.json..."
npm ci --no-audit --no-fund
