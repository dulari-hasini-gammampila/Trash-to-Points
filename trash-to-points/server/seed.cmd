@echo off
REM WHAT THIS DOES: Runs `npm run seed` with Node on PATH, pauses so you see errors.
REM IN THIS PROJECT: Fills demo users and sample rows after schema exists.
REM WHY IT MATTERS: Empty DB makes the UI impossible to demo or test end-to-end.
setlocal
set "NODE_DIR=%ProgramFiles%\nodejs"
if not exist "%NODE_DIR%\node.exe" set "NODE_DIR=%ProgramFiles(x86)%\nodejs"
if not exist "%NODE_DIR%\node.exe" (
  echo Node.js not found. Install from https://nodejs.org or add it to PATH.
  exit /b 1
)
set "PATH=%NODE_DIR%;%PATH%"
cd /d "%~dp0"
echo Filling the database with demo users (admin, alex, etc.)...
call "%NODE_DIR%\npm.cmd" run seed
pause
