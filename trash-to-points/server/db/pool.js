/**
 * Here's what this is for:
 * Creates a single pg.Pool so routes reuse connections instead of opening new ones per request.
 *
 * How it fits in:
 * Every route that touches Postgres imports this pool; SSL hints cover Supabase and similar hosts.
 *
 * Why it matters:
 * Wrong DATABASE_URL or pool settings mean the entire API fails — nothing persists without this.
 */
import pg from "pg";

const { Pool } = pg;

function sslOption() {
  const url = process.env.DATABASE_URL || "";
  if (url.includes("supabase.co")) {
    return { rejectUnauthorized: false };
  }
  if (process.env.DATABASE_SSL === "true") {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslOption(),
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error", err);
});
