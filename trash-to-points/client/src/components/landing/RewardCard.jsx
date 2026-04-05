/**
 * Here's what this is for:
 * Minimal “points + reward title” tile for marketing — no redeem button.
 *
 * How it fits in:
 * Home page teasers only; real redemption uses `components/RewardCard.jsx` when logged in.
 *
 * Why it matters:
 * Shows incentive examples without implying instant redemption from the landing page.
 */
export default function PublicRewardCard({ points, title }) {
  return (
    <div className="card stat-card">
      <p className="value">{points}</p>
      <p className="label">pts — {title}</p>
    </div>
  );
}
