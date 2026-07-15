@echo off
setlocal
cd /d "%~dp0"

if not exist ".env" (
  copy /Y ".env.example" ".env" >nul
  echo [LexiGo] Created .env from .env.example
)

if not exist "node_modules" (
  echo [LexiGo] Installing backend dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)

echo [LexiGo] Starting backend development server...
call npm run dev
