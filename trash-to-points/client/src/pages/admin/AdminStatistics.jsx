/**
 * Here's what this is for:
 * Fetches aggregate stats and renders charts/tables for program analytics.
 *
 * How it fits in:
 * Uses admin/stats APIs — deeper view than the dashboard cards alone.
 *
 * Why it matters:
 * Data-driven decisions (events, bin placement) depend on accurate aggregates here.
 */
import { useEffect, useState } from "react";
import { api } from "../../api";

export default function AdminStatistics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api("/admin/stats")
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  if (!stats) return <div className="page-loading">Loading statistics…</div>;

  const maxS = Math.max(...(stats.submissionsByStatus || []).map((x) => x.c || 0), 1);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Statistics</h1>
      <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
        <div className="card stat-card">
          <p className="label">Residents</p>
          <p className="value">{stats.totalResidents}</p>
        </div>
        <div className="card stat-card">
          <p className="label">Bins</p>
          <p className="value">{stats.totalBins}</p>
        </div>
        <div className="card stat-card">
          <p className="label">Pending reviews</p>
          <p className="value">{stats.pendingSubmissions}</p>
        </div>
        <div className="card stat-card">
          <p className="label">Approved records</p>
          <p className="value">{stats.approvedSubmissions}</p>
        </div>
        <div className="card stat-card">
          <p className="label">Points issued (approved)</p>
          <p className="value">{stats.totalPointsIssued}</p>
        </div>
        <div className="card stat-card">
          <p className="label">Redemptions</p>
          <p className="value">{stats.totalRedemptions}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>Submissions by status</h2>
        <div className="chart-bar">
          {(stats.submissionsByStatus || []).map((w) => (
            <div key={w.status} className="chart-bar-item">
              <div
                className="chart-bar-fill"
                style={{ height: `${(w.c / maxS) * 120}px` }}
                title={`${w.c} submissions`}
              />
              <span className="chart-bar-label">{w.status}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="section-title">Recent activity</h2>
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
