@echo off
REM WHAT THIS DOES: Finds Node, cds to server, runs `npm run dev` so the API listens locally.
REM IN THIS PROJECT: Easiest way on Windows to start Express without fixing PATH in every terminal.
REM WHY IT MATTERS: No server — no React data; use this after Postgres is up.
setlocal
set "NODE_DIR=%ProgramFiles%\nodejs"
if not exist "%NODE_DIR%\node.exe" set "NODE_DIR=%ProgramFiles(x86)%\nodejs"
if not exist "%NODE_DIR%\node.exe" (
  echo Node.js not found. Install from https://nodejs.org or add it to PATH.
  exit /b 1
)
set "PATH=%NODE_DIR%;%PATH%"
cd /d "%~dp0"
call "%NODE_DIR%\npm.cmd" run dev
