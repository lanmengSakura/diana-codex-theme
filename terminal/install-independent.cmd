@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-diana-terminal.ps1"
if errorlevel 1 (
  echo.
  echo Diana Terminal installation failed.
  pause
  exit /b 1
)
echo.
echo Diana Terminal was installed as independent profiles.
pause
