/**
 * Here's what this is for:
 * Create submissions (photo + metadata) and list the current user’s own rows; ties to bin codes.
 *
 * How it fits in:
 * Powers “New submission” and “My submissions”; staff review/approve happens via admin routes.
 *
 * Why it matters:
 * Submissions are how residents earn points — this is the core intake path for the program’s data.
 */
import { Router } from "express";
import { pool } from "../db/pool.js";
import { authRequired, residentOnly } from "../middleware/auth.js";
import { uploadProof } from "../middleware/upload.js";

const router = Router();

/**
 * Resident creates a submission (photo + bin + count). Status Pending — no points until admin approves.
 */
router.post(
  "/",
  authRequired,
  residentOnly,
  uploadProof.single("image"),
  async (req, res) => {
    try {
      const rawBin = (req.body.bin_code || "").trim();
      const qty = parseInt(req.body.user_reported_quantity, 10);
      if (!req.file) {
        return res.status(400).json({ error: "Please upload a photo of your disposal" });
      }
      if (!rawBin) {
        return res.status(400).json({ error: "Enter the bin code or scan the bin QR" });
      }
      if (!Number.isFinite(qty) || qty < 1) {
        return res.status(400).json({ error: "Number of items must be at least 1" });
      }

      const b = await pool.query(
        `SELECT bin_code FROM bins WHERE UPPER(TRIM(bin_code)) = UPPER(TRIM($1)) OR (qr_value IS NOT NULL AND TRIM(qr_value) = TRIM($1))`,
        [rawBin]
      );
      if (!b.rows[0]) {
        return res.status(400).json({ error: "That bin code or QR is not registered" });
      }
      const binCode = b.rows[0].bin_code;
      const image_url = `/uploads/${req.file.filename}`;

      const ins = await pool.query(
        `INSERT INTO submissions (user_id, bin_code, image_url, user_reported_quantity, status, points_awarded)
         VALUES ($1, $2, $3, $4, 'Pending', 0) RETURNING *`,
        [req.user.id, binCode, image_url, qty]
      );
      res.status(201).json(ins.rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not save submission" });
    }
  }
);

/** Logged-in resident: own submissions */
router.get("/my", authRequired, residentOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM submissions WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load submissions" });
  }
});

export default router;
