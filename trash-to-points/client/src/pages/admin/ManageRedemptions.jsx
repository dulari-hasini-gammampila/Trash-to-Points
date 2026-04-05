/**
 * Here's what this is for:
 * Lists all redemptions org-wide; staff update status when rewards are handed out.
 *
 * How it fits in:
 * Pairs with resident “My redemptions” — operational fulfillment queue.
 *
 * Why it matters:
 * Prevents double pickup and keeps points accounting aligned with physical rewards.
 */
import { useEffect, useState } from "react";
import { api } from "../../api";
import RedemptionTable from "../../components/RedemptionTable";
import AlertMessage from "../../components/AlertMessage";

export default function ManageRedemptions() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function load() {
    api("/admin/redemptions").then(setRows).catch(() => setRows([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function onMarkClaimed(id) {
    setMsg("");
    setErr("");
    try {
      await api(`/admin/redemptions/${id}/claim`, { method: "PUT" });
      setMsg("Marked as claimed.");
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Manage redemptions</h1>
      <AlertMessage type="success" message={msg} onClose={() => setMsg("")} />
      <AlertMessage type="error" message={err} onClose={() => setErr("")} />
      <RedemptionTable rows={rows} admin onMarkClaimed={onMarkClaimed} />
    </div>
  );
}
