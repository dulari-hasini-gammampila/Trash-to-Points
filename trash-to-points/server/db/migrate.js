/**
 * Here's what this is for:
 * CLI entry: loads env, calls ensureSchema(), prints OK — for applying DB structure without the HTTP server.
 *
 * How it fits in:
 * Run when you want tables ready before `npm run dev`, or in CI/deploy scripts that need schema only.
 *
 * Why it matters:
 * Lets operators fix “no tables” without booting Express; same logic as server startup’s ensureSchema.
 */
import "dotenv/config";
import { pool } from "./pool.js";
import { ensureSchema } from "./ensureSchema.js";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("Set DATABASE_URL (Supabase or local Postgres connection string)");
    process.exit(1);
  }
  await ensureSchema();
  console.log("Migration OK.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
