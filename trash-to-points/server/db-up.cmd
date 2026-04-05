@echo off
REM WHAT THIS DOES: Ensures Docker is on PATH, runs `docker compose up` for the project DB.
REM IN THIS PROJECT: Matches DATABASE_URL in server/.env.example for local development.
REM WHY IT MATTERS: API and seed fail fast if Postgres isn’t reachable — start this first.
setlocal
REM Docker Desktop installs here; Cursor/PowerShell often omit it from PATH
set "DOCKER_BIN=%ProgramFiles%\Docker\Docker\resources\bin"
if exist "%DOCKER_BIN%\docker.exe" set "PATH=%DOCKER_BIN%;%PATH%"
where docker >nul 2>&1
if errorlevel 1 (
  echo Docker was not found. Install Docker Desktop and start it:
  echo   https://www.docker.com/products/docker-desktop/
  echo.
  echo If it IS installed, look for docker.exe under:
  echo   "%ProgramFiles%\Docker\Docker\resources\bin"
  echo Then add that folder to your user PATH ^(Environment Variables^).
  pause
  exit /b 1
)

cd /d "%~dp0\.."
echo Starting Postgres in Docker (port 5432)...
echo Working dir: %CD%
echo.
docker compose up -d
if errorlevel 1 (
  echo.
  echo FAILED. Open Docker Desktop and wait until it is fully running, then run this again.
  pause
  exit /b 1
)
echo.
docker compose ps
echo.
echo If db shows "running", start the API:  server\dev.cmd   then  seed.cmd
REM No pause here so  npm run db:up  can finish without a keypress
