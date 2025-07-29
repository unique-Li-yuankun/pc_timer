@echo off
echo Starting PC Timer...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Build the project first
echo Building project...
npm run build
echo.

REM Start the application
echo Starting PC Timer application...
npm run start:built

pause