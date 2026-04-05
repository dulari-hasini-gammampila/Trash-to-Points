/**
 * Here's what this is for:
 * List and manage community cleanup events (public read; create/update/delete for admins).
 *
 * How it fits in:
 * Feeds the marketing events page, event detail view, and admin event manager.
 *
 * Why it matters:
 * Events drive engagement — stale or broken data makes the initiative look inactive.
 */
import { Router } from "express";
import { pool } from "../db/pool.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM events ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list events" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load event" });
  }
});

router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    const { event_name, schedule, time, location, description, participants, activities } = req.body;
    if (!event_name) return res.status(400).json({ error: "event_name required" });
    const { rows } = await pool.query(
      `INSERT INTO events (event_name, schedule, time, location, description, participants, activities)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        event_name,
        schedule || "",
        time || "",
        location || "",
        description || "",
        participants || "",
        activities || "",
      ]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create event" });
  }
});

router.put("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const ex = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
    const existing = ex.rows[0];
    if (!existing) return res.status(404).json({ error: "Not found" });
    const { event_name, schedule, time, location, description, participants, activities } = req.body;
    const { rows } = await pool.query(
      `UPDATE events SET event_name = $1, schedule = $2, time = $3, location = $4, description = $5,
       participants = $6, activities = $7 WHERE id = $8 RETURNING *`,
      [
        event_name ?? existing.event_name,
        schedule ?? existing.schedule,
        time ?? existing.time,
        location ?? existing.location,
        description ?? existing.description,
        participants ?? existing.participants,
        activities ?? existing.activities,
        id,
      ]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update event" });
  }
});

export default router;
