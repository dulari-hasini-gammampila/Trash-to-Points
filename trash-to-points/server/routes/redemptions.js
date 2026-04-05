/**
 * Here's what this is for:
 * Residents redeem rewards (deduct points, issue pickup codes); admins list/update fulfillment status.
 *
 * How it fits in:
 * Connects points balance to real-world pickup — used by My redemptions and Manage redemptions.
 *
 * Why it matters:
 * This is where points become obligations; bugs here mean wrong balances or unrewarded residents.
 */
import { Router } from "express";
import crypto from "crypto";
import { pool } from "../db/pool.js";
import { authRequired, residentOnly, adminOnly } from "../middleware/auth.js";

const router = Router();

function makeRedemptionCode() {
  return `TTP-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

/** Resident redeems a reward — points deducted immediately, unique code issued */
router.post("/", authRequired, residentOnly, async (req, res) => {
  try {
    const { reward_id } = req.body;
    const rid = parseInt(reward_id, 10);
    if (!rid) return res.status(400).json({ error: "reward_id required" });

    const rw = await pool.query("SELECT * FROM rewards WHERE id = $1", [rid]);
    const reward = rw.rows[0];
    if (!reward) return res.status(404).json({ error: "Reward not found" });
    if (reward.stock <= 0) return res.status(400).json({ error: "Reward out of stock" });

    const uq = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    const user = uq.rows[0];
    if (user.total_points < reward.points_required) {
      return res.status(400).json({ error: "Not enough points" });
    }

    const client = await pool.connect();
    let redemptionRow;
    try {
      await client.query("BEGIN");
      const deducted = await client.query(
        `UPDATE users SET total_points = total_points - $1 WHERE id = $2 AND total_points >= $1 RETURNING id`,
        [reward.points_required, req.user.id]
      );
      if (!deducted.rows[0]) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Not enough points" });
      }
      const stockUp = await client.query(
        "UPDATE rewards SET stock = stock - 1 WHERE id = $1 AND stock > 0 RETURNING id",
        [rid]
      );
      if (!stockUp.rows[0]) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Reward out of stock" });
      }

      let code = makeRedemptionCode();
      for (let attempt = 0; attempt < 10; attempt++) {
        try {
          const ins = await client.query(
            `INSERT INTO redemptions (user_id, reward_id, redemption_code, points_used, status)
             VALUES ($1, $2, $3, $4, 'Active') RETURNING *`,
            [req.user.id, rid, code, reward.points_required]
          );
          redemptionRow = ins.rows[0];
          break;
        } catch (err) {
          if (err.code === "23505") code = makeRedemptionCode();
          else throw err;
        }
      }
      if (!redemptionRow) throw new Error("code");
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      console.error(e);
      return res.status(400).json({ error: "Could not complete redemption. Try again." });
    } finally {
      client.release();
    }

    const row = await pool.query(
      `SELECT r.*, rw.reward_name, rw.points_required FROM redemptions r
       JOIN rewards rw ON rw.id = r.reward_id WHERE r.id = $1`,
      [redemptionRow.id]
    );
    res.status(201).json(row.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Redemption failed" });
  }
});

/** Resident: my redemptions */
router.get("/my", authRequired, residentOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, rw.reward_name, rw.points_required, rw.description
       FROM redemptions r JOIN rewards rw ON rw.id = r.reward_id
       WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load redemptions" });
  }
});

/** Admin: cancel an active redemption and refund points */
router.put("/:id/cancel", authRequired, adminOnly, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const r = await client.query(`SELECT * FROM redemptions WHERE id = $1 FOR UPDATE`, [id]);
    const row = r.rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Not found" });
    }
    if (row.status !== "Active") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Only active redemptions can be cancelled" });
    }
    await client.query(`UPDATE redemptions SET status = 'Cancelled' WHERE id = $1`, [id]);
    await client.query(`UPDATE users SET total_points = total_points + $1 WHERE id = $2`, [
      row.points_used,
      row.user_id,
    ]);
    await client.query(`UPDATE rewards SET stock = stock + 1 WHERE id = $1`, [row.reward_id]);
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "Cancel failed" });
  } finally {
    client.release();
  }
});

export default router;
