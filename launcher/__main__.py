"""
Run:  python -m launcher

Starts the Express API (port 3001) and Vite client (port 8000) under trash-to-points/.
This is the app where Supabase / deployment changes live — not the static HTML in the repo root.

Requires Node.js + npm. Configure server/.env (DATABASE_URL, JWT_SECRET, FRONTEND_URL).
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

# Repo root = parent of the launcher package
ROOT = Path(__file__).resolve().parent.parent
SERVER_DIR = ROOT / "trash-to-points" / "server"
CLIENT_DIR = ROOT / "trash-to-points" / "client"


def main() -> None:
    if not SERVER_DIR.is_dir() or not CLIENT_DIR.is_dir():
        print(
            "Could not find trash-to-points/server and trash-to-points/client.\n"
            f"Expected under: {ROOT}\n"
            "Run this command from your Trash-to-Points project folder (same level as trash-to-points/).",
            file=sys.stderr,
        )
        sys.exit(1)

    npm = shutil.which("npm")
    if not npm:
        print(
            "npm was not found. Install Node.js (https://nodejs.org/) and ensure npm is on your PATH.\n"
            "The React + API app does not run with `python -m http.server` alone.",
            file=sys.stderr,
        )
        sys.exit(1)

    env = os.environ.copy()
    # Helpful default for local API + Vite together
    env.setdefault(
        "FRONTEND_URL",
        "http://127.0.0.1:8000,http://localhost:8000,http://[::1]:8000",
    )

    procs: list[subprocess.Popen] = []
    try:
        print("Starting API (trash-to-points/server) …")
        procs.append(
            subprocess.Popen(
                [npm, "run", "dev"],
                cwd=str(SERVER_DIR),
                env=env,
            )
        )
        time.sleep(1.5)
        print("Starting website (trash-to-points/client) …")
        procs.append(
            subprocess.Popen(
                [npm, "run", "dev"],
                cwd=str(CLIENT_DIR),
                env=env,
            )
        )

        print()
        print("  Trash-to-Points (full stack)")
        print("  -----------------------------")
        print("  Open in your browser:  http://localhost:8000  (or http://[::1]:8000)")
        print("  API health:            http://localhost:3001/api/health")
        print()
        print("  Static pages in this folder (index.html, login.html) are separate;")
        print("  they are not the React app. Use the :8000 link above.")
        print()
        print("  Press Ctrl+C to stop both servers.")
        print()

        while True:
            time.sleep(0.5)
            for i, p in enumerate(procs):
                code = p.poll()
                if code is not None:
                    label = "API" if i == 0 else "Vite client"
                    print(f"\n{label} exited (code {code}). Stopping the other process.\n", file=sys.stderr)
                    raise SystemExit(code if code else 1)
    except KeyboardInterrupt:
        print("\nStopping servers…")
    finally:
        for p in procs:
            if p.poll() is None:
                p.terminate()
                try:
                    p.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    p.kill()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ("-h", "--help"):
        print(__doc__.strip())
        raise SystemExit(0)
    main()
