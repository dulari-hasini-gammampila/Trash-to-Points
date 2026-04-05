/**
 * Here's what this is for:
 * Route guard: requires auth; optional `role` prop redirects wrong roles to `/` or `/login`.
 *
 * How it fits in:
 * Wraps resident and admin sections in App.jsx so URLs aren’t open by URL guessing alone.
 *
 * Why it matters:
 * Core security/UX boundary — prevents residents from hitting admin APIs via the UI.
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap routes that need login.
 * role: "resident" | "admin" — if set, user must match.
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: role }} />;

  if (role && user.role !== role) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/resident/dashboard" replace />;
  }

  return children;
}
