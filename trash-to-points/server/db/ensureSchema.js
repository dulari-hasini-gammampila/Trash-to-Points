/**
 * Here's what this is for:
 * On startup, ensures a version table exists, applies SCHEMA_V2_FULL once if needed, and runs small upgrades.
 *
 * How it fits in:
 * Imported by server.js (and migrate.js) so production and dev always converge on the same table shape.
 *
 * Why it matters:
 * Prevents “works on my machine” schema drift — new deploys self-heal to the expected Postgres layout.
 */
import { pool } from "./pool.js";
import { SCHEMA_V2_FULL } from "./ddl.js";

/**
 * The actual “migration” step: if we haven’t applied v2 yet, we run the big SQL block once.
 */
export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _ttp_schema_version (
      version INT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  const done = await pool.query("SELECT 1 FROM _ttp_schema_version WHERE version = 2");
  if (done.rows.length === 0) {
    const client = await pool.connect();
    try {
      await client.query(SCHEMA_V2_FULL);
      await client.query("INSERT INTO _ttp_schema_version (version) VALUES (2)");
      console.log("Database schema v2 applied.");
    } finally {
      client.release();
    }
  }
  await ensureUserLoginName();
}

/** Username = unique login name; email optional. Idempotent — safe every boot. */
async function ensureUserLoginName() {
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`);
  try {
    await pool.query(`ALTER TABLE users ALTER COLUMN email DROP NOT NULL`);
  } catch {
    /* already nullable */
  }

  await pool.query(`UPDATE users SET username = 'admin' WHERE id = 1`);
  await pool.query(`UPDATE users SET username = 'alex' WHERE email = 'alex@example.com'`);
  await pool.query(`UPDATE users SET username = 'jordan' WHERE email = 'jordan@example.com'`);
  await pool.query(`UPDATE users SET username = 'sam' WHERE email = 'sam@example.com'`);
  await pool.query(`
    UPDATE users SET username = 'user_' || id::text
    WHERE username IS NULL OR btrim(username) = ''
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower ON users (lower(btrim(username)))
  `);

  try {
    await pool.query(`ALTER TABLE users ALTER COLUMN username SET NOT NULL`);
  } catch (e) {
    console.warn("Could not set username NOT NULL:", e.message);
  }
}
