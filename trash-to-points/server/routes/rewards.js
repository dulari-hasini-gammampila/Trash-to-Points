/**
 * Here's what this is for:
 * CRUD for the reward catalog (titles, costs, images) with public read and admin-only writes.
 *
 * How it fits in:
 * Drives the public rewards page and admin “Manage rewards”; redemptions reference these rows.
 *
 * Why it matters:
 * Wrong point costs or missing rewards break trust and accounting for the whole redemption flow.
 */
import { Router } from "express";
import { pool } from "../db/pool.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM rewards ORDER BY points_required ASC");
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list rewards" });
  }
});

router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    const { reward_name, points_required, description, stock } = req.body;
    if (!reward_name || points_required == null) {
      return res.status(400).json({ error: "reward_name and points_required required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO rewards (reward_name, points_required, description, stock) VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        String(reward_name).trim(),
        Math.max(0, parseInt(points_required, 10) || 0),
        description || "",
        Math.max(0, parseInt(stock, 10) || 0),
      ]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create reward" });
  }
});

router.put("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const ex = await pool.query("SELECT * FROM rewards WHERE id = $1", [id]);
    const existing = ex.rows[0];
    if (!existing) return res.status(404).json({ error: "Not found" });
    const { reward_name, points_required, description, stock } = req.body;
    const { rows } = await pool.query(
      `UPDATE rewards SET reward_name = $1, points_required = $2, description = $3, stock = $4 WHERE id = $5 RETURNING *`,
      [
        reward_name != null ? String(reward_name).trim() : existing.reward_name,
        points_required != null ? Math.max(0, parseInt(points_required, 10) || 0) : existing.points_required,
        description != null ? description : existing.description,
        stock != null ? Math.max(0, parseInt(stock, 10) || 0) : existing.stock,
        id,
      ]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update reward" });
  }
});

router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const r = await pool.query("DELETE FROM rewards WHERE id = $1", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete reward" });
  }
});

export default router;
