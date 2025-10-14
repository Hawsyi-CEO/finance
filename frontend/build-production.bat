@echo off
cls
echo.
echo 🚀 Building Vertinova Finance App for Production...
echo ==================================================
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo [ERROR] package.json not found. Please run this script from the frontend directory.
    pause
    exit /b 1
)

REM Step 1: Clean previous builds
echo [INFO] Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo [SUCCESS] Build directory cleaned
echo.

REM Step 2: Install dependencies
echo [INFO] Installing dependencies...
call npm ci --silent
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed
echo.

REM Step 3: Build for production
echo [INFO] Building for production...
set NODE_ENV=production
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Production build failed
    pause
    exit /b 1
)

echo [SUCCESS] Production build completed
echo.

REM Step 4: Analyze bundle size
echo [INFO] Analyzing bundle size...
dir dist /s
echo.

REM Step 5: Run build verification
echo [INFO] Verifying build...
if exist dist\index.html (
    if exist dist\assets (
        echo [SUCCESS] Build verification passed
    ) else (
        echo [ERROR] Assets directory not found
        pause
        exit /b 1
    )
) else (
    echo [ERROR] index.html not found
    pause
    exit /b 1
)
echo.

REM Step 6: Performance recommendations
echo [INFO] Performance Recommendations:
echo   ✅ Enable gzip compression on your server
echo   ✅ Set proper cache headers for static assets
echo   ✅ Use a CDN for faster asset delivery
echo   ✅ Monitor Core Web Vitals
echo.

echo [SUCCESS] 🎉 Production build ready!
echo [INFO] Deploy the 'dist' folder to your web server
echo ==================================================
echo.
pause