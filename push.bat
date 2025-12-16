@echo off
:: ===============================
:: Git Push Script for Savings Project
:: ===============================

:: Ask for commit message
set /p message="Enter commit message: "

:: Push backend
echo.
echo Pushing Backend...
cd "C:\Users\EMMANUEL MUSAU\2028 savings\server"
git add .
git commit -m "%message%"
git push origin main

:: Push frontend
echo.
echo Pushing Frontend...
cd "C:\Users\EMMANUEL MUSAU\2028 savings\savings-tracker"
git add .
git commit -m "%message%"
git push origin main

echo.
echo All done!
pause
