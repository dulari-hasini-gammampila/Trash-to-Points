/**
 * Here's what this is for:
 * CRUD UI for bin records (codes, locations) shown to residents when they submit.
 *
 * How it fits in:
 * Keeps submission bin codes in sync with real-world placement.
 *
 * Why it matters:
 * Wrong bins make verification impossible and frustrate residents and staff.
 */
import { useEffect, useState } from "react";
import { api } from "../../api";
import BinTable from "../../components/BinTable";
import AlertMessage from "../../components/AlertMessage";

export default function ManageBins() {
  const [bins, setBins] = useState([]);
  const [bin_code, setBinCode] = useState("");
  const [qr_value, setQrValue] = useState("");
  const [location, setLocation] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function load() {
    api("/admin/bins").then(setBins).catch(() => setBins([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await api("/admin/bins", {
        method: "POST",
        body: { bin_code, qr_value: qr_value || null, location },
      });
      setMsg("Bin created.");
      setBinCode("");
      setQrValue("");
      setLocation("");
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this bin? Only allowed if no submissions reference it.")) return;
    setErr("");
    try {
      await api(`/admin/bins/${id}`, { method: "DELETE" });
      setMsg("Bin removed.");
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Manage bins</h1>
      <AlertMessage type="success" message={msg} onClose={() => setMsg("")} />
      <AlertMessage type="error" message={err} onClose={() => setErr("")} />

      <form className="card" onSubmit={handleCreate} style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>Add bin</h2>
        <div className="form-group">
          <label>Bin code (printed on bin)</label>
          <input value={bin_code} onChange={(e) => setBinCode(e.target.value)} required placeholder="TP-PARK-A" />
        </div>
        <div className="form-group">
          <label>QR payload (optional, unique)</label>
          <input
            value={qr_value}
            onChange={(e) => setQrValue(e.target.value)}
            placeholder="Same as code or a UUID in the QR"
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Park area name" />
        </div>
        <button type="submit" className="btn btn-primary">
          Create bin
        </button>
      </form>

      <h2 className="section-title" style={{ marginTop: 0 }}>
        All bins
      </h2>
      <BinTable bins={bins} onDelete={onDelete} />
    </div>
  );
}
