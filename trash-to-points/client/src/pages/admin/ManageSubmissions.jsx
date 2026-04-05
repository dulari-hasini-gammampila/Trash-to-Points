/**
 * Here's what this is for:
 * Review queue for photo submissions: approve/reject, set points, view thumbnails.
 *
 * How it fits in:
 * Where staff validate evidence — connects field behavior to ledger updates.
 *
 * Why it matters:
 * Fairness of the program hinges on consistent, timely review of proof.
 */
import { useEffect, useState } from "react";
import { api, mediaUrl } from "../../api";
import AlertMessage from "../../components/AlertMessage";

export default function ManageSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [verifyQty, setVerifyQty] = useState("");
  const [note, setNote] = useState("");

  function load() {
    const q = filter ? `?status=${encodeURIComponent(filter)}` : "";
    api(`/admin/submissions${q}`)
      .then(setSubmissions)
      .catch(() => setSubmissions([]));
  }

  useEffect(() => {
    load();
  }, [filter]);

  function openReview(s) {
    setExpanded(s.id);
    setVerifyQty(String(s.user_reported_quantity));
    setNote("");
    setErr("");
  }

  async function review(id, status) {
    setMsg("");
    setErr("");
    try {
      const body = { status, admin_note: note || null };
      if (status === "Approved") {
        const v = parseInt(verifyQty, 10);
        if (!Number.isFinite(v) || v < 0) {
          setErr("Enter a valid verified quantity (0 or more). Points = that number × 1 pt per item.");
          return;
        }
        body.admin_verified_quantity = v;
      }
      await api(`/admin/submissions/${id}/review`, { method: "PUT", body });
      setMsg(status === "Approved" ? "Approved and points awarded." : "Submission rejected.");
      setExpanded(null);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Review submissions</h1>
      <p style={{ color: "var(--gray-600)", maxWidth: "40rem" }}>
        Compare each photo with the resident&apos;s count. Adjust <strong>verified quantity</strong> if the image
        shows fewer items — points are only added after you approve, using your verified number (1 item = 1
        point).
      </p>
      <AlertMessage type="success" message={msg} onClose={() => setMsg("")} />
      <AlertMessage type="error" message={err} onClose={() => setErr("")} />

      <div className="form-group" style={{ maxWidth: 280 }}>
        <label>Filter by status</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {submissions.length === 0 ? (
          <div className="empty-state">No submissions in this view.</div>
        ) : (
          submissions.map((s) => (
            <div key={s.id} className="card">
              <div className="review-grid">
                <div>
                  {s.image_url ? (
                    <a href={mediaUrl(s.image_url)} target="_blank" rel="noreferrer">
                      <img className="submission-preview" src={mediaUrl(s.image_url)} alt="Proof" />
                    </a>
                  ) : (
                    <span>No image</span>
                  )}
                </div>
                <div>
                  <p style={{ margin: "0 0 0.35rem" }}>
                    <strong>{s.resident_name}</strong> ({s.resident_email})
                  </p>
                  <p style={{ margin: "0 0 0.35rem" }}>
                    Bin: <code>{s.bin_code}</code> — Reported items: <strong>{s.user_reported_quantity}</strong>
                  </p>
                  <p style={{ margin: "0 0 0.5rem" }}>
                    Status: <span className={`status-badge status-${s.status}`}>{s.status}</span>
                  </p>
                  {s.status === "Approved" && (
                    <p style={{ margin: "0 0 0.35rem", fontSize: "0.9rem" }}>
                      Verified qty: {s.admin_verified_quantity ?? "—"} — Points awarded: {s.points_awarded}
                    </p>
                  )}
                  {s.status === "Rejected" && s.admin_note && (
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>Note: {s.admin_note}</p>
                  )}
                  {s.status === "Pending" && (
                    <>
                      {expanded === s.id ? (
                        <div className="review-panel">
                          <div className="form-group" style={{ maxWidth: 200 }}>
                            <label>Verified quantity (admin)</label>
                            <input
                              type="number"
                              min={0}
                              value={verifyQty}
                              onChange={(e) => setVerifyQty(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Note (optional)</label>
                            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => review(s.id, "Approved")}
                            >
                              Approve &amp; award points
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
                              onClick={() => review(s.id, "Rejected")}
                            >
                              Reject
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setExpanded(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => openReview(s)}>
                          Review
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
