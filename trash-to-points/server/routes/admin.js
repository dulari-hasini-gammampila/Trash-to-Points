/**
 * Here's what this is for:
 * Staff-only bulk operations: review submissions, set statuses/points, user tweaks, admin stats, etc.
 *
 * How it fits in:
 * Backs the React admin area — most “moderation” and operational work goes through these routes.
 *
 * Why it matters:
 * This is operational control of the program; mistakes here directly change resident points and trust.
 */
import { Router } from "express";
import { pool } from "../db/pool.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = Router();

router.use(authRequired, adminOnly);

/** All submissions for review */
router.get("/submissions", async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const params = [];
    let n = 1;
    let sql = `
      SELECT s.*, u.full_name AS resident_name, u.email AS resident_email,
             a.full_name AS reviewer_name
      FROM submissions s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN users a ON a.id = s.reviewed_by_admin_id
      WHERE 1=1
    `;
    if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
      sql += ` AND s.status = $${n++}`;
      params.push(status);
    }
    if (from) {
      sql += ` AND (s.created_at::date >= $${n++}::date)`;
      params.push(from);
    }
    if (to) {
      sql += ` AND (s.created_at::date <= $${n++}::date)`;
      params.push(to);
    }
    sql += ` ORDER BY s.created_at DESC`;
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list submissions" });
  }
});

/**
 * Approve or reject. Points are awarded ONLY here: 1 point per admin_verified_quantity when Approved.
 * Rejected submissions never add points.
 */
router.put("/submissions/:id/review", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, admin_verified_quantity, admin_note } = req.body;
  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ error: "status must be Approved or Rejected" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const subR = await client.query(`SELECT * FROM submissions WHERE id = $1 FOR UPDATE`, [id]);
    const sub = subR.rows[0];
    if (!sub) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Submission not found" });
    }
    if (sub.status !== "Pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Only pending submissions can be reviewed" });
    }

    const adminId = req.user.id;
    const note = admin_note != null ? String(admin_note).trim() : null;

    if (status === "Rejected") {
      await client.query(
        `UPDATE submissions SET status = 'Rejected', admin_note = $1, reviewed_at = now(),
         reviewed_by_admin_id = $2, admin_verified_quantity = NULL, points_awarded = 0
         WHERE id = $3`,
        [note, adminId, id]
      );
      await client.query("COMMIT");
      const out = await pool.query(
        `SELECT s.*, u.full_name AS resident_name FROM submissions s
         JOIN users u ON u.id = s.user_id WHERE s.id = $1`,
        [id]
      );
      return res.json(out.rows[0]);
    }

    // Approved — verified quantity required (0 allowed if admin decides nothing valid)
    const vq = parseInt(admin_verified_quantity, 10);
    if (!Number.isFinite(vq) || vq < 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "For approval, provide admin_verified_quantity (0 or positive integer)",
      });
    }
    const points = vq; // 1 item = 1 point

    await client.query(
      `UPDATE submissions SET status = 'Approved', admin_verified_quantity = $1, points_awarded = $2,
       admin_note = $3, reviewed_at = now(), reviewed_by_admin_id = $4 WHERE id = $5`,
      [vq, points, note, adminId, id]
    );
    if (points > 0) {
      await client.query(`UPDATE users SET total_points = total_points + $1 WHERE id = $2`, [
        points,
        sub.user_id,
      ]);
    }
    await client.query("COMMIT");
    const out = await pool.query(
      `SELECT s.*, u.full_name AS resident_name FROM submissions s
       JOIN users u ON u.id = s.user_id WHERE s.id = $1`,
      [id]
    );
    res.json(out.rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "Review failed" });
  } finally {
    client.release();
  }
});

router.get("/users", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, full_name, email, role, total_points, created_at FROM users ORDER BY role DESC, full_name`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list users" });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const residents = await pool.query("SELECT COUNT(*)::int AS c FROM users WHERE role = 'resident'");
    const bins = await pool.query("SELECT COUNT(*)::int AS c FROM bins");
    const pending = await pool.query(`SELECT COUNT(*)::int AS c FROM submissions WHERE status = 'Pending'`);
    const approved = await pool.query(`SELECT COUNT(*)::int AS c FROM submissions WHERE status = 'Approved'`);
    const pointsIssued = await pool.query(
      `SELECT COALESCE(SUM(points_awarded), 0)::bigint AS s FROM submissions WHERE status = 'Approved'`
    );
    const redemptions = await pool.query("SELECT COUNT(*)::int AS c FROM redemptions");
    const byStatus = await pool.query(
      `SELECT status, COUNT(*)::int AS c FROM submissions GROUP BY status`
    );
    const recent = await pool.query(
      `SELECT * FROM (
         SELECT 'submission'::text AS type, s.created_at AS at, u.full_name AS detail,
                s.status::text AS extra
         FROM submissions s JOIN users u ON u.id = s.user_id
         UNION ALL
         SELECT 'redemption'::text, r.created_at, u.full_name, r.redemption_code
         FROM redemptions r JOIN users u ON u.id = r.user_id
       ) sub ORDER BY at DESC NULLS LAST LIMIT 15`
    );

    res.json({
      totalResidents: residents.rows[0].c,
      totalBins: bins.rows[0].c,
      pendingSubmissions: pending.rows[0].c,
      approvedSubmissions: approved.rows[0].c,
      totalPointsIssued: Number(pointsIssued.rows[0].s),
      totalRedemptions: redemptions.rows[0].c,
      submissionsByStatus: byStatus.rows,
      recentActivity: recent.rows,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

router.get("/redemptions", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS user_name, u.email AS user_email, rw.reward_name, rw.points_required
       FROM redemptions r
       JOIN users u ON u.id = r.user_id
       JOIN rewards rw ON rw.id = r.reward_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list redemptions" });
  }
});

/** Mark a redemption as claimed at the physical pickup point */
router.put("/redemptions/:id/claim", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const r = await pool.query(
      `UPDATE redemptions SET status = 'Claimed', claimed_at = now() WHERE id = $1 AND status = 'Active' RETURNING *`,
      [id]
    );
    if (!r.rows[0]) {
      return res.status(400).json({ error: "Not found or not an active redemption" });
    }
    const row = await pool.query(
      `SELECT r.*, u.full_name AS user_name, rw.reward_name FROM redemptions r
       JOIN users u ON u.id = r.user_id JOIN rewards rw ON rw.id = r.reward_id WHERE r.id = $1`,
      [id]
    );
    res.json(row.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to mark claimed" });
  }
});

router.get("/bins", async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM bins ORDER BY bin_code`);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list bins" });
  }
});

router.post("/bins", async (req, res) => {
  try {
    const { bin_code, qr_value, location } = req.body;
    const code = (bin_code || "").trim();
    if (!code) return res.status(400).json({ error: "bin_code required" });
    const qr = qr_value != null && String(qr_value).trim() !== "" ? String(qr_value).trim() : null;
    const { rows } = await pool.query(
      `INSERT INTO bins (bin_code, qr_value, location) VALUES ($1, $2, $3) RETURNING *`,
      [code, qr, location || ""]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === "23505") {
      return res.status(400).json({ error: "Bin code or QR value already exists" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to create bin" });
  }
});

router.put("/bins/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const ex = await pool.query("SELECT * FROM bins WHERE id = $1", [id]);
    if (!ex.rows[0]) return res.status(404).json({ error: "Not found" });
    const { bin_code, qr_value, location } = req.body;
    const existing = ex.rows[0];
    const code = bin_code != null ? String(bin_code).trim() : existing.bin_code;
    const qr =
      qr_value !== undefined
        ? String(qr_value).trim() === ""
          ? null
          : String(qr_value).trim()
        : existing.qr_value;
    const loc = location != null ? String(location) : existing.location;
    const { rows } = await pool.query(
      `UPDATE bins SET bin_code = $1, qr_value = $2, location = $3 WHERE id = $4 RETURNING *`,
      [code, qr, loc, id]
    );
    res.json(rows[0]);
  } catch (e) {
    if (e.code === "23505") {
      return res.status(400).json({ error: "Bin code or QR value already exists" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to update bin" });
  }
});

router.delete("/bins/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const r = await pool.query("DELETE FROM bins WHERE id = $1 RETURNING id", [id]);
    if (!r.rowCount) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    if (e.code === "23503") {
      return res.status(400).json({ error: "Cannot delete bin that has submissions" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to delete bin" });
  }
});

export default router;
