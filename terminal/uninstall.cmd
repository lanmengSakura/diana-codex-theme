@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall-diana-terminal.ps1"
if errorlevel 1 (
  echo.
  echo Diana Terminal removal failed.
  pause
  exit /b 1
)
echo.
echo Diana Terminal was removed and its saved default was restored.
pause
