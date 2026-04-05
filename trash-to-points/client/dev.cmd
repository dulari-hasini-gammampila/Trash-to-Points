@echo off
setlocal
set "NODE_DIR=%ProgramFiles%\nodejs"
if not exist "%NODE_DIR%\node.exe" set "NODE_DIR=%ProgramFiles(x86)%\nodejs"
if not exist "%NODE_DIR%\node.exe" (
  echo Node.js not found. Install from https://nodejs.org or add it to PATH.
  exit /b 1
)
set "PATH=%NODE_DIR%;%PATH%"
cd /d "%~dp0"
if not exist "node_modules\vite\bin\vite.js" (
  echo First run: installing dependencies...
  call "%NODE_DIR%\npm.cmd" install
  if errorlevel 1 (
    echo npm install failed. Close other apps using this folder, then try again.
    pause
    exit /b 1
  )
)
call "%NODE_DIR%\npm.cmd" run dev
