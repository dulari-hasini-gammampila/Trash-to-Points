/**
 * Here's what this is for:
 * Immediately redirects to `/login?demo=admin` so demos can open the staff flow in one link.
 *
 * How it fits in:
 * Tiny route alias — reuses Login.jsx instead of duplicating a second form.
 *
 * Why it matters:
 * Bookmarkable URL for presentations; changing query handling happens in one place (Login).
 */
import { Navigate } from "react-router-dom";

export default function StaffLogin() {
  return <Navigate to="/login?demo=admin" replace />;
}
