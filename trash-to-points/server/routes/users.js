/**
 * Here's what this is for:
 * /users/me and profile updates for the logged-in user; admin routes to list or adjust residents.
 *
 * How it fits in:
 * Feeds the Navbar, Profile page, and admin “Manage residents” table with real user records.
 *
 * Why it matters:
 * Points and roles live on users — incorrect handling here leaks data or breaks access control.
 */
import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = Router();

function stripSecrets(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return rest;
}

router.get("/", authRequired, adminOnly, async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    let result;
    if (search) {
      const pat = `%${search}%`;
      result = await pool.query(
        `SELECT id, username, full_name, email, role, total_points, created_at FROM users
         WHERE full_name ILIKE $1 OR email ILIKE $1 OR username ILIKE $1 ORDER BY full_name`,
        [pat]
      );
    } else {
      result = await pool.query(
        `SELECT id, username, full_name, email, role, total_points, created_at FROM users ORDER BY full_name`
      );
    }
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list users" });
  }
});

router.get("/me", authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, username, full_name, email, role, total_points, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/:id", authRequired, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (req.user.role !== "admin" && req.user.id !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const { rows } = await pool.query(
      "SELECT id, username, full_name, email, role, total_points, created_at FROM users WHERE id = $1",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/:id", authRequired, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (req.user.role !== "admin" && req.user.id !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const { full_name, email, password, total_points, username } = req.body;
    const ex = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const existing = ex.rows[0];
    if (!existing) return res.status(404).json({ error: "Not found" });

    const sets = [];
    const params = [];
    let n = 1;

    if (full_name != null) {
      sets.push(`full_name = $${n++}`);
      params.push(String(full_name).trim());
    }
    if (username != null && req.user.role === "admin") {
      const un = String(username).trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,32}$/.test(un)) {
        return res.status(400).json({ error: "Invalid username" });
      }
      const clash = await pool.query(
        "SELECT id FROM users WHERE lower(btrim(username)) = $1 AND id != $2",
        [un, id]
      );
      if (clash.rows[0]) return res.status(400).json({ error: "Username already in use" });
      sets.push(`username = $${n++}`);
      params.push(un);
    }
    if (email !== undefined && (req.user.role === "admin" || req.user.id === id)) {
      const em =
        email === null || String(email).trim() === "" ? null : String(email).trim().toLowerCase();
      if (em) {
        const clash = await pool.query("SELECT id FROM users WHERE email = $1 AND id != $2", [em, id]);
        if (clash.rows[0]) return res.status(400).json({ error: "Email already in use" });
      }
      sets.push(`email = $${n++}`);
      params.push(em);
    }
    if (password != null && String(password).length >= 6) {
      sets.push(`password_hash = $${n++}`);
      params.push(bcrypt.hashSync(password, 10));
    }
    if (total_points != null && req.user.role === "admin") {
      sets.push(`total_points = $${n++}`);
      params.push(Math.max(0, parseInt(total_points, 10) || 0));
    }

    if (sets.length === 0) {
      return res.json(stripSecrets(existing));
    }
    params.push(id);
    await pool.query(`UPDATE users SET ${sets.join(", ")} WHERE id = $${n}`, params);
    const row = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    res.json(stripSecrets(row.rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;
