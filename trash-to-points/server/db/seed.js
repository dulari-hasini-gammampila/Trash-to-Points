/**
 * Here's what this is for:
 * Inserts demo users, bins, rewards, submissions, etc., so local demos feel like a real deployment.
 *
 * How it fits in:
 * Developers run `npm run seed` after DB is up; pairs with ensureSchema and friendly error text.
 *
 * Why it matters:
 * Without seed data, every screen is empty — hard to test flows or show the product to stakeholders.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { pool } from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hash = (p) => bcrypt.hashSync(p, 10);

function isConnectionRefused(err) {
  if (!err) return false;
  if (err.code === "ECONNREFUSED") return true;
  if (Array.isArray(err.errors) && err.errors.some((e) => e?.code === "ECONNREFUSED")) return true;
  return false;
}

function printDbUnreachableHint() {
  console.error(`
Cannot reach PostgreSQL on DATABASE_URL (connection refused).

1) Open Docker Desktop and wait until it says it is running.
2) Double-click  server\\db-up.cmd  or  trash-to-points\\start-db.cmd
   Or from server:  npm run db:up
3) Wait ~10s, then run  npm run seed  again.

If the API is not up yet, start it once with  dev.cmd  so the schema is created (ensureSchema), then seed.
`);
}

/** Tiny PNG for demo submission thumbnails (1×1). */
const DEMO_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("Set DATABASE_URL");
    process.exit(1);
  }

  const uploadDir = path.join(__dirname, "../uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  const demoImageName = "seed-demo-proof.png";
  fs.writeFileSync(path.join(uploadDir, demoImageName), DEMO_PNG);
  const demoImageUrl = `/uploads/${demoImageName}`;

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    await client.query("TRUNCATE redemptions, submissions RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE rewards, events, bins RESTART IDENTITY CASCADE");
    await client.query("DELETE FROM users");

    // Admin must be id = 1 (explicit)
    await client.query(
      `INSERT INTO users (id, username, full_name, email, password_hash, role, total_points)
       VALUES (1, 'admin', 'Admin', 'admin@trashpoints.com', $1, 'admin', 0)`,
      [hash("admin123")]
    );
    await client.query(`SELECT setval(pg_get_serial_sequence('users','id'), (SELECT MAX(id) FROM users))`);

    await client.query(
      `INSERT INTO users (username, full_name, email, password_hash, role, total_points) VALUES
       ('alex', 'Alex Rivera', 'alex@example.com', $1, 'resident', 10),
       ('jordan', 'Jordan Lee', 'jordan@example.com', $2, 'resident', 0),
       ('sam', 'Sam Chen', 'sam@example.com', $3, 'resident', 12)`,
      [hash("resident123"), hash("resident123"), hash("resident123")]
    );

    const { rows: users } = await client.query(
      "SELECT id, email FROM users WHERE role = 'resident' ORDER BY email"
    );
    const alex = users.find((u) => u.email === "alex@example.com");
    const jordan = users.find((u) => u.email === "jordan@example.com");
    const sam = users.find((u) => u.email === "sam@example.com");

    await client.query(
      `INSERT INTO bins (bin_code, qr_value, location) VALUES
       ('TP-PARK-A', 'QR-TP-PARK-A', 'Riverside Park — main lawn'),
       ('TP-PARK-B', 'QR-TP-PARK-B', 'Riverside Park — jogging path'),
       ('TP-GATE-1', 'QR-TP-GATE-1', 'Community center gate')`
    );

    const rw = await client.query(
      `INSERT INTO rewards (reward_name, points_required, description, stock) VALUES
       ('Clean Warrior Sticker', 10, 'Limited community sticker.', 100),
       ('Free Breakfast', 20, 'Voucher at the community booth.', 50),
       ('Eco-Friendly Gift', 40, 'Reusable tote or bamboo utensils while supplies last.', 30)
       RETURNING id, reward_name`
    );
    const stickerId = rw.rows.find((r) => r.reward_name.includes("Sticker"))?.id;
    const breakfastId = rw.rows.find((r) => r.reward_name.includes("Breakfast"))?.id;

    await client.query(
      `INSERT INTO events (event_name, schedule, time, location, description, participants, activities) VALUES
       ($1, $2, $3, $4, $5, $6, $7)`,
      [
        "Trash-to-Points Day",
        "First Saturday of each month",
        "9:00 AM – 10:00 AM",
        "Riverside Park collection point",
        "Monthly community clean-up and points recording.",
        "Community residents; Student volunteers; Resident Committee (RC) members",
        "Collect litter; Sort recyclable waste; Record points; Distribute rewards",
      ]
    );

    if (alex) {
      // Pending — no points until admin approves
      await client.query(
        `INSERT INTO submissions (user_id, bin_code, image_url, user_reported_quantity, status, points_awarded)
         VALUES ($1, 'TP-PARK-A', $2, 3, 'Pending', 0)`,
        [alex.id, demoImageUrl]
      );
      // Approved — 40 pts earned; Alex later redeemed 10 + 20 → balance 10
      await client.query(
        `INSERT INTO submissions (user_id, bin_code, image_url, user_reported_quantity, admin_verified_quantity,
          points_awarded, status, reviewed_at, reviewed_by_admin_id)
         VALUES ($1, 'TP-PARK-B', $2, 42, 40, 40, 'Approved', now(), 1)`,
        [alex.id, demoImageUrl]
      );
      if (stickerId && breakfastId) {
        await client.query(
          `INSERT INTO redemptions (user_id, reward_id, redemption_code, points_used, status, claimed_at)
           VALUES ($1, $2, 'TTP-SEED-DEMO-STICKER', 10, 'Claimed', now())`,
          [alex.id, stickerId]
        );
        await client.query(
          `INSERT INTO redemptions (user_id, reward_id, redemption_code, points_used, status)
           VALUES ($1, $2, 'TTP-SEED-ACTIVE-BREAKFAST', 20, 'Active')`,
          [alex.id, breakfastId]
        );
        await client.query("UPDATE rewards SET stock = stock - 1 WHERE id = $1", [stickerId]);
        await client.query("UPDATE rewards SET stock = stock - 1 WHERE id = $1", [breakfastId]);
      }
    }

    if (jordan) {
      await client.query(
        `INSERT INTO submissions (user_id, bin_code, image_url, user_reported_quantity, admin_verified_quantity,
          points_awarded, status, admin_note, reviewed_at, reviewed_by_admin_id)
         VALUES ($1, 'TP-GATE-1', $2, 8, NULL, 0, 'Rejected', 'Image did not match reported count.', now(), 1)`,
        [jordan.id, demoImageUrl]
      );
    }

    if (sam) {
      await client.query(
        `INSERT INTO submissions (user_id, bin_code, image_url, user_reported_quantity, admin_verified_quantity,
          points_awarded, status, reviewed_at, reviewed_by_admin_id)
         VALUES ($1, 'TP-PARK-A', $2, 12, 12, 12, 'Approved', now(), 1)`,
        [sam.id, demoImageUrl]
      );
    }

    await client.query("COMMIT");
    console.log("Seed complete.");
    console.log("Admin: admin@trashpoints.com / admin123");
    console.log("Residents: alex@example.com, jordan@example.com, sam@example.com / resident123");
  } catch (e) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {
        /* ignore */
      }
    }
    if (isConnectionRefused(e)) printDbUnreachableHint();
    console.error(e);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

seed();
