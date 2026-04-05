/**
 * Here's what this is for:
 * Fetches and displays the current user’s redemptions (codes, status) in a table.
 *
 * How it fits in:
 * Resident counterpart to admin “Manage redemptions” — pickup instructions live here.
 *
 * Why it matters:
 * Residents need to know what they’ve claimed and whether staff marked items ready.
 */
import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import RedemptionTable from "../../components/RedemptionTable";

export default function MyRedemptions() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (!user?.id) return;
    api("/redemptions/my").then(setRows).catch(() => setRows([]));
  }, [user?.id]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>My rewards &amp; redemptions</h1>
      <p style={{ color: "var(--gray-600)" }}>
        Show your redemption code at the collection point. Staff will mark it as claimed after you pick up
        your reward.
      </p>
      <RedemptionTable rows={rows} admin={false} />
    </div>
  );
}
