@echo off
REM Deployment script for IEH Dashboard (Windows)

echo 🚀 Deploying IEH - Planetary Dashboard...

REM Add all changes
git add .

REM Commit with timestamp
for /f "tokens=1-4 delims=/ " %%i in ('date /t') do set mydate=%%k-%%j-%%i
for /f "tokens=1-2 delims=/: " %%h in ('time /t') do set mytime=%%h:%%i
git commit -m "Update: %mydate% %mytime%"

REM Push to GitHub
git push origin main

echo ✅ Deployment complete!
echo 🌐 Your website will be available at: https://forgecitizens.github.io/IEH/
echo ⏱️  GitHub Pages usually takes 1-5 minutes to update
pause