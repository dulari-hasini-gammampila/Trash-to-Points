/**
 * Here's what this is for:
 * CRUD for physical bin locations/codes; exposes a safe public list for residents picking a bin.
 *
 * How it fits in:
 * Submission forms and admin bin management depend on accurate bin rows in the database.
 *
 * Why it matters:
 * Wrong codes break verification — residents can’t prove they used the right drop-off point.
 */
import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

/** Public list of bins so residents can pick codes / confirm QR targets (no secrets). */
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, bin_code, qr_value, location, created_at FROM bins ORDER BY bin_code`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list bins" });
  }
});

export default router;
