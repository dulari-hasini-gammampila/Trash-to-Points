/**
 * Here's what this is for:
 * Tabular list of bins with optional delete — props control read-only mode.
 *
 * How it fits in:
 * ManageBins passes API rows and callbacks so staff maintain accurate drop-off codes.
 *
 * Why it matters:
 * Residents submit against these codes; mistakes break verification.
 */
export default function BinTable({ bins, onDelete, readOnly }) {
  if (!bins?.length) {
    return <div className="empty-state">No bins yet.</div>;
  }
  return (
    <div className="table-wrap card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>QR value</th>
            <th>Location</th>
            {!readOnly && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {bins.map((b) => (
            <tr key={b.id}>
              <td>
                <code>{b.bin_code}</code>
              </td>
              <td>{b.qr_value || "—"}</td>
              <td>{b.location || "—"}</td>
              {!readOnly && (
                <td>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => onDelete?.(b.id)}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
