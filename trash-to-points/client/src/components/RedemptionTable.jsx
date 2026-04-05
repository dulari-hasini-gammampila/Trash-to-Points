/**
 * Here's what this is for:
 * Table of redemptions with codes and status; admin mode can mark items claimed.
 *
 * How it fits in:
 * Used on staff and resident pages with different props for actions vs read-only.
 *
 * Why it matters:
 * Pickup desk relies on codes and status matching reality.
 */
export default function RedemptionTable({ rows, admin, onMarkClaimed }) {
  if (!rows?.length) {
    return <div className="empty-state">No redemptions yet.</div>;
  }
  return (
    <div className="table-wrap card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="data-table">
        <thead>
          <tr>
            {admin && <th>User</th>}
            <th>Reward</th>
            <th>Code</th>
            <th>Points</th>
            <th>Status</th>
            <th>Created</th>
            {admin && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              {admin && <td>{r.user_name || r.user_email}</td>}
              <td>{r.reward_name}</td>
              <td>
                <code style={{ fontSize: "0.85rem" }}>{r.redemption_code}</code>
              </td>
              <td>{r.points_used ?? r.points_required}</td>
              <td>
                <span className={`status-badge status-${r.status}`}>{r.status}</span>
              </td>
              <td>{r.created_at?.slice(0, 16) || "—"}</td>
              {admin && (
                <td>
                  {r.status === "Active" && (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => onMarkClaimed?.(r.id)}
                    >
                      Mark claimed
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
