@echo off
setlocal
set "DOCKER_BIN=%ProgramFiles%\Docker\Docker\resources\bin"
if exist "%DOCKER_BIN%\docker.exe" set "PATH=%DOCKER_BIN%;%PATH%"
where docker >nul 2>&1
if errorlevel 1 (
  echo Docker not found. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
  pause
  exit /b 1
)
cd /d "%~dp0"
echo Starting Postgres (Docker) on port 5432...
docker compose up -d
if errorlevel 1 (
  echo.
  echo If this failed: start Docker Desktop, wait until it is running, then run this file again.
  pause
  exit /b 1
)
echo.
docker compose ps
echo.
echo Database URL (put in server/.env if needed):
echo   postgresql://postgres:postgres@127.0.0.1:5432/trash_points
echo.
echo Next: server\dev.cmd
pause
