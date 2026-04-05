/**
 * Here's what this is for:
 * Site-wide top bar: branding, nav links, auth-aware CTAs, mobile drawer, theme toggle.
 *
 * How it fits in:
 * Rendered from App.jsx so every route shares the same header chrome.
 *
 * Why it matters:
 * Primary navigation and sign-in entry — breaks here strand users on every page.
 */
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onToggleDark }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) => (isActive ? "navbar-link is-active" : "navbar-link");

  return (
    <header className="navbar">
      <div className="navbar-inner">
      <div className="navbar-bar">
        <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          <span className="navbar-brand-mark" aria-hidden="true">
            ♻
          </span>
          <span className="navbar-brand-text">Trash-to-Points</span>
        </Link>
        <button
          type="button"
          className="navbar-burger"
          aria-expanded={open}
          aria-label="Open menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`navbar-links ${open ? "is-open" : ""}`} aria-label="Main">
        <NavLink to="/" className={linkClass} end onClick={() => setOpen(false)}>
          Home
        </NavLink>
        <NavLink to="/about" className={linkClass} onClick={() => setOpen(false)}>
          About
        </NavLink>
        <NavLink to="/event-details" className={linkClass} onClick={() => setOpen(false)}>
          Event
        </NavLink>
        <NavLink to="/rewards" className={linkClass} onClick={() => setOpen(false)}>
          Rewards
        </NavLink>
        <NavLink to="/budget" className={linkClass} onClick={() => setOpen(false)}>
          Budget
        </NavLink>
        {!user && (
          <>
            <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
              Login
            </NavLink>
            <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>
              Register
            </NavLink>
            <NavLink
              to="/staff/login"
              className={({ isActive }) =>
                `navbar-link navbar-link--accent${isActive ? " is-active" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              Admin login
            </NavLink>
          </>
        )}
        {user?.role === "resident" && (
          <>
            <NavLink to="/resident/dashboard" className={linkClass} onClick={() => setOpen(false)}>
              Dashboard
            </NavLink>
            <button type="button" className="navbar-toggle" onClick={() => { logout(); setOpen(false); }}>
              Log out
            </button>
          </>
        )}
        {user?.role === "admin" && (
          <>
            <NavLink to="/admin/dashboard" className={linkClass} onClick={() => setOpen(false)}>
              Admin
            </NavLink>
            <button type="button" className="navbar-toggle" onClick={() => { logout(); setOpen(false); }}>
              Log out
            </button>
          </>
        )}
        <button type="button" className="navbar-toggle" onClick={onToggleDark} title="Toggle theme">
          Theme
        </button>
      </nav>
      </div>
    </header>
  );
}
