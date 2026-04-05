@echo off
REM WHAT THIS DOES: Runs `docker compose down` from trash-to-points to stop the local Postgres container.
REM IN THIS PROJECT: Frees ports and resources when you’re done developing.
REM WHY IT MATTERS: Leaves a clean state; use when switching projects or troubleshooting Docker.
setlocal
set "DOCKER_BIN=%ProgramFiles%\Docker\Docker\resources\bin"
if exist "%DOCKER_BIN%\docker.exe" set "PATH=%DOCKER_BIN%;%PATH%"
cd /d "%~dp0\.."
docker compose down
