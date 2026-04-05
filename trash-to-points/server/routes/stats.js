/**
 * Here's what this is for:
 * Aggregated metrics endpoints for dashboards (legacy + newer admin stats consumers).
 *
 * How it fits in:
 * Admin statistics and dashboard cards read from here to show program health at a glance.
 *
 * Why it matters:
 * Good stats help staff prioritize; broken stats hide problems like backlog or low participation.
 */
import { Router } from "express";
import { pool } from "../db/pool.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = Router();

/** @deprecated Use GET /api/admin/stats — kept for older clients */
router.get("/admin", authRequired, adminOnly, async (_req, res) => {
  try {
    const pending = await pool.query(`SELECT COUNT(*)::int AS c FROM submissions WHERE status = 'Pending'`);
    const residents = await pool.query("SELECT COUNT(*)::int AS c FROM users WHERE role = 'resident'");
    res.json({
      pendingSubmissions: pending.rows[0].c,
      totalResidents: residents.rows[0].c,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
