/**
 * Here's what this is for:
 * Starts the backend web server: listens for requests, talks to the database, sends back JSON,
 * and serves uploaded photos. When it starts, it also makes sure the database tables exist.
 *
 * How it fits in:
 * The website and mobile clients all talk to this program. Accounts, points, rewards, and admin
 * actions go through here—not through the HTML files in the parent folder.
 *
 * Why it matters:
 * If this isn’t running, the real app can’t log anyone in or save anything. It’s the heart of the project.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { ensureSchema } from "./db/ensureSchema.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import submissionRoutes from "./routes/submissions.js";
import rewardRoutes from "./routes/rewards.js";
import redemptionRoutes from "./routes/redemptions.js";
import eventRoutes from "./routes/events.js";
import statsRoutes from "./routes/stats.js";
import adminRoutes from "./routes/admin.js";
import binRoutes from "./routes/bins.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

function corsOrigin() {
  const raw = process.env.FRONTEND_URL || "";
  if (!raw.trim()) return true;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

app.use(cors({ origin: corsOrigin(), credentials: true }));
app.use(express.json());

/** Uploaded submission images */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
  })
);

app.get("/api/health", (req, res) => res.json({ ok: true, db: !!process.env.DATABASE_URL }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/redemptions", redemptionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bins", binRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

function isConnectionRefused(err) {
  if (!err) return false;
  if (err.code === "ECONNREFUSED") return true;
  if (Array.isArray(err.errors) && err.errors.some((e) => e?.code === "ECONNREFUSED")) return true;
  return false;
}

function printDatabaseUnreachableHelp() {
  console.error(`
PostgreSQL refused the connection (nothing listening on the host/port in DATABASE_URL).

Fix — pick one:
  1) Docker: run  server\\db-up.cmd  or  npm run db:up  (Docker Desktop must be running; scripts add Docker to PATH if needed)
  2) Or install PostgreSQL locally and point DATABASE_URL in server/.env at it
  3) Or use a cloud URI (e.g. Supabase) in DATABASE_URL

Then save .env or restart the dev server.
`);
}

async function boot() {
  if (!process.env.DATABASE_URL) {
    console.error("FATAL: Set DATABASE_URL to your Postgres connection string.");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error("FATAL: Set JWT_SECRET (long random string).");
    process.exit(1);
  }
  await ensureSchema();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Trash-to-Points API listening on port ${PORT}`);
  });
}

boot().catch((e) => {
  if (isConnectionRefused(e)) printDatabaseUnreachableHelp();
  console.error(e);
  process.exit(1);
});
