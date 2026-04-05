/**
 * Here's what this is for:
 * JWT helpers: signToken, authRequired, adminRequired — parses Bearer tokens and sets req.user.
 *
 * How it fits in:
 * Imported by nearly every protected route; ties HTTP requests back to users and roles in Postgres.
 *
 * Why it matters:
 * This is the security gate — if JWT verification is wrong, accounts and data are exposed or locked out.
 */
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(user) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function authRequired(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = h.slice(7);
  try {
    if (!JWT_SECRET) return res.status(500).json({ error: "Server misconfiguration" });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function residentOnly(req, res, next) {
  if (!req.user || req.user.role !== "resident") {
    return res.status(403).json({ error: "This action is for residents only" });
  }
  next();
}
