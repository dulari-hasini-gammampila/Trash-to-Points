/**
 * Here's what this is for:
 * Fetches and displays the reward catalog for visitors without logging in.
 *
 * How it fits in:
 * Marketing transparency — shows what participants can eventually redeem.
 *
 * Why it matters:
 * Motivates sign-ups by proving the program has tangible perks.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import RewardCard from "../../components/RewardCard";

export default function RewardsPublic() {
  const [rewards, setRewards] = useState([]);
  useEffect(() => {
    api("/rewards").then(setRewards).catch(() => setRewards([]));
  }, []);
  return (
    <div>
      <h1 style={{ color: "var(--green-900)" }}>Rewards catalog</h1>
      <p style={{ color: "var(--gray-600)" }}>
        Submit disposal photos for admin approval, earn points, then redeem.{" "}
        <Link to="/register">Register</Link> to participate.
      </p>
      <div className="grid-2" style={{ marginTop: "1rem" }}>
        {rewards.map((r) => (
          <RewardCard key={r.id} reward={r} showRedeem={false} />
        ))}
      </div>
    </div>
  );
}
