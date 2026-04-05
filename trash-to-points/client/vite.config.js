/**
 * Here's what this is for:
 * Settings for the tool that builds and runs the React app on your computer—port number, and
 * forwarding “/api” to the backend so the front end and server can talk while you develop.
 *
 * How it fits in:
 * Used when you run the client in dev mode from the client folder.
 *
 * Why it matters:
 * If this forwarding is wrong, login and saving data fail on your machine even when the server is fine.
 */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  /** Use 127.0.0.1 so the proxy matches the API on Windows (localhost → ::1 can ECONNREFUSE with some setups). */
  const apiTarget = env.VITE_DEV_API_PROXY || "http://127.0.0.1:3001";
  /** Default 8000 — matches common `python -m http.server` style ports; override with VITE_DEV_PORT */
  const devPort = Number(env.VITE_DEV_PORT) || 8000;

  /**
   * Proxy must run whenever the Vite *dev server* is active.
   * Using `mode === "development"` alone can miss some cases; `command === "serve"` is reliable.
   * Without this, /api and /uploads calls fail (broken login, images, etc.).
   */
  return {
    plugins: [react()],
    server:
      command === "serve"
        ? {
            port: devPort,
            strictPort: false,
            /** Listen on IPv4 + IPv6 so http://localhost:8000 and http://[::1]:8000 both work */
            host: true,
            proxy: {
              "/api": { target: apiTarget, changeOrigin: true },
              "/uploads": { target: apiTarget, changeOrigin: true },
            },
          }
        : undefined,
  };
});
