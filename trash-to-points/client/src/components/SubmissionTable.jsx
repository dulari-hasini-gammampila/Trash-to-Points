/**
 * Here's what this is for:
 * Renders submission rows with status badges and optional photo thumbnails via mediaUrl.
 *
 * How it fits in:
 * Shared between resident history and admin review with different surrounding actions.
 *
 * Why it matters:
 * Staff need quick visual proof; residents need accurate status for their log.
 */
import { mediaUrl } from "../api";

function StatusBadge({ status }) {
  const s = status || "—";
  return <span className={`status-badge status-${s}`}>{s}</span>;
}

export default function SubmissionTable({ rows, showImage, showResident }) {
  if (!rows?.length) {
    return <div className="empty-state">No submissions.</div>;
  }
  return (
    <div className="table-wrap card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="data-table">
        <thead>
          <tr>
            {showResident && <th>Resident</th>}
            <th>Bin</th>
            {showImage && <th>Photo</th>}
            <th>Reported</th>
            <th>Verified</th>
            <th>Points</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              {showResident && <td>{s.resident_name || "—"}</td>}
              <td>{s.bin_code}</td>
              {showImage && (
                <td>
                  {s.image_url ? (
                    <a href={mediaUrl(s.image_url)} target="_blank" rel="noreferrer">
                      <img
                        className="submission-preview"
                        src={mediaUrl(s.image_url)}
                        alt=""
                        style={{ maxHeight: 56 }}
                      />
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              )}
              <td>{s.user_reported_quantity}</td>
              <td>{s.admin_verified_quantity ?? "—"}</td>
              <td>{s.points_awarded}</td>
              <td>
                <StatusBadge status={s.status} />
              </td>
              <td>{s.created_at?.slice(0, 16) || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
