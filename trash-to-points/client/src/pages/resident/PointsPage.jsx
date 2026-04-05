/**
 * Here's what this is for:
 * Shows total points and short stats from AuthContext / API for the current user.
 *
 * How it fits in:
 * Resident-facing “wallet” view — reinforces progress toward rewards.
 *
 * Why it matters:
 * If numbers disagree with admin data, trust erodes — should match server totals.
 */
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";

export default function PointsPage() {
  const { user } = useAuth();
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>My points</h1>
      <p style={{ color: "var(--gray-600)" }}>
        Points are added only after an <strong>admin approves</strong> your disposal photo. The program uses{" "}
        <strong>1 verified item = 1 point</strong> (the admin can correct the count to match your picture).
      </p>
      <div className="grid-3" style={{ marginTop: "1rem" }}>
        <StatCard label="Current balance" value={user?.total_points ?? 0} />
      </div>
    </div>
  );
}
