/**
 * Here's what this is for:
 * Vertical nav list with `NavLink` active styles; `variant` switches resident vs admin links.
 *
 * How it fits in:
 * Lives inside ResidentLayout and AdminLayout for secondary navigation.
 *
 * Why it matters:
 * Faster movement between tools than going back through the Navbar each time.
 */
import { NavLink } from "react-router-dom";

/** Resident sidebar */
export function ResidentSidebar() {
  const linkStyle = ({ isActive }) => (isActive ? "active" : "");
  return (
    <aside className="sidebar">
      <NavLink to="/resident/dashboard" className={linkStyle} end>
        Dashboard
      </NavLink>
      <NavLink to="/resident/submit" className={linkStyle}>
        New submission
      </NavLink>
      <NavLink to="/resident/submissions" className={linkStyle}>
        My submissions
      </NavLink>
      <NavLink to="/resident/points" className={linkStyle}>
        My points
      </NavLink>
      <NavLink to="/resident/redemptions" className={linkStyle}>
        My rewards
      </NavLink>
      <NavLink to="/resident/profile" className={linkStyle}>
        My profile
      </NavLink>
    </aside>
  );
}

/** Admin sidebar */
export function AdminSidebar() {
  const linkStyle = ({ isActive }) => (isActive ? "active" : "");
  return (
    <aside className="sidebar">
      <NavLink to="/admin/dashboard" className={linkStyle} end>
        Dashboard
      </NavLink>
      <NavLink to="/admin/submissions" className={linkStyle}>
        Review submissions
      </NavLink>
      <NavLink to="/admin/bins" className={linkStyle}>
        Manage bins
      </NavLink>
      <NavLink to="/admin/residents" className={linkStyle}>
        Manage users
      </NavLink>
      <NavLink to="/admin/rewards" className={linkStyle}>
        Manage rewards
      </NavLink>
      <NavLink to="/admin/redemptions" className={linkStyle}>
        Manage redemptions
      </NavLink>
      <NavLink to="/admin/events" className={linkStyle}>
        Manage events
      </NavLink>
      <NavLink to="/admin/statistics" className={linkStyle}>
        Statistics
      </NavLink>
    </aside>
  );
}
