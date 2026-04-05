/**
 * Here's what this is for:
 * Summary stats and shortcuts into each admin management screen.
 *
 * How it fits in:
 * First screen staff see after admin login — operational health at a glance.
 *
 * Why it matters:
 * Surfaces backlog (submissions, redemptions) so nothing sits unreviewed too long.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import StatCard from "../../components/StatCard";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    function load() {
      api("/admin/stats")
        .then((s) => {
          if (!cancelled) setStats(s);
        })
        .catch(() => {
          if (!cancelled) setStats(null);
        });
    }
    load();
    const pollMs = Number(import.meta.env.VITE_DASHBOARD_POLL_MS) || 0;
    if (!pollMs)
      return () => {
        cancelled = true;
      };
    const id = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!stats) return <div className="page-loading">Loading dashboard…</div>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Admin dashboard</h1>
      <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
        <StatCard label="Residents" value={stats.totalResidents} />
        <StatCard label="Bins" value={stats.totalBins} />
        <StatCard label="Pending reviews" value={stats.pendingSubmissions} />
        <StatCard label="Points issued" value={stats.totalPointsIssued} />
        <StatCard label="Redemptions" value={stats.totalRedemptions} />
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>Quick actions</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <Link to="/admin/submissions" className="btn btn-primary">
            Review submissions
          </Link>
          <Link to="/admin/bins" className="btn btn-outline">
            Manage bins
          </Link>
          <Link to="/admin/residents" className="btn btn-outline">
            Users
          </Link>
          <Link to="/admin/rewards" className="btn btn-outline">
            Rewards
          </Link>
          <Link to="/admin/redemptions" className="btn btn-outline">
            Redemptions
          </Link>
          <Link to="/admin/statistics" className="btn btn-outline">
            Full statistics
          </Link>
        </div>
      </div>

      <h2 className="section-title" style={{ marginTop: 0 }}>
        Recent activity
      </h2>
      <div className="card">
        {stats.recentActivity.length === 0 ? (
          <p className="empty-state" style={{ border: "none", padding: "1rem" }}>
            No activity yet.
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {stats.recentActivity.map((a, i) => (
              <li key={i} style={{ marginBottom: "0.35rem" }}>
                <strong>{a.type}</strong> — {a.detail}{" "}
                {a.extra != null && <span>({a.extra})</span>} — <small>{a.at?.slice(0, 16)}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
