@echo off
REM HumXus Static Site Deployment Script for Windows
REM This script helps prepare and deploy the static site to Render.com

echo === HumXus Static Site Deployment Helper ===
echo.

REM Check if we're in the right directory
if not exist "render.yaml" (
    echo Error: render.yaml not found. Please run this script from the humxus_demo_static_site directory.
    exit /b 1
)

echo [OK] Found render.yaml
echo.

REM Check if public directory exists
if not exist "public" (
    echo Error: public directory not found.
    exit /b 1
)

echo [OK] Found public directory
echo.

REM Check if all HTML files exist
if exist "public\index.html" echo [OK] Found public\index.html
if exist "public\user.html" echo [OK] Found public\user.html
if exist "public\master.html" echo [OK] Found public\master.html
if exist "public\partner.html" echo [OK] Found public\partner.html
if exist "public\login.html" echo [OK] Found public\login.html
if exist "public\signup.html" echo [OK] Found public\signup.html

echo.
echo === Deployment Instructions ===
echo.
echo 1. Initialize git repository (if not already done):
echo    git init
echo    git add .
echo    git commit -m "Initial static site commit"
echo.
echo 2. Add remote repository:
echo    git remote add origin ^<your-repo-url^>
echo.
echo 3. Push to GitHub/GitLab/Bitbucket:
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Go to Render.com:
echo    - Click "New +" -^> "Static Site"
echo    - Connect your repository
echo    - Render will auto-detect render.yaml
echo    - Click "Create Static Site"
echo.
echo === Site will be live at: https://humxus-static.onrender.com ===
echo.
pause
