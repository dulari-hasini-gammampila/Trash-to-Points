/**
 * Here's what this is for:
 * Register and login endpoints: hashes passwords with bcrypt, issues JWTs, returns user payloads.
 *
 * How it fits in:
 * Every protected screen depends on tokens created here; AuthContext stores the JWT client-side.
 *
 * Why it matters:
 * Broken auth means no trustworthy identity — the whole permission model (resident vs admin) rests on this.
 */
import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { signToken } from "../middleware/auth.js";

const router = Router();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

function normalizeUsername(s) {
  return String(s || "").trim().toLowerCase();
}

function userPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    total_points: row.total_points,
    created_at: row.created_at,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { username, full_name, email, password } = req.body;
    const u = normalizeUsername(username);
    if (!full_name || !password) {
      return res.status(400).json({ error: "Full name and password are required" });
    }
    if (!u || !USERNAME_RE.test(u)) {
      return res.status(400).json({
        error: "Username must be 3–32 characters: letters, numbers, and underscores only",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const em = email != null && String(email).trim() !== "" ? String(email).trim().toLowerCase() : null;
    if (em) {
      const existsE = await pool.query("SELECT id FROM users WHERE email = $1", [em]);
      if (existsE.rows[0]) return res.status(400).json({ error: "Email already registered" });
    }
    const existsU = await pool.query("SELECT id FROM users WHERE lower(btrim(username)) = $1", [u]);
    if (existsU.rows[0]) {
      return res.status(400).json({ error: "That username is already taken" });
    }
    const h = bcrypt.hashSync(password, 10);
    const ins = await pool.query(
      `INSERT INTO users (username, full_name, email, password_hash, role, total_points)
       VALUES ($1, $2, $3, $4, 'resident', 0) RETURNING *`,
      [u, full_name.trim(), em, h]
    );
    const user = ins.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user: userPublic(user) });
  } catch (e) {
    console.error(e);
    if (e.code === "23505") {
      return res.status(400).json({ error: "Username or email already in use" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const raw = req.body.username ?? req.body.name;
    const { password } = req.body;
    const u = normalizeUsername(raw);
    if (!u || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    const { rows } = await pool.query("SELECT * FROM users WHERE lower(btrim(username)) = $1", [u]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = signToken(user);
    res.json({ token, user: userPublic(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
