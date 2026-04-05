/**
 * Here's what this is for:
 * Displays a reward with points cost and optional redeem handler for logged-in residents.
 *
 * How it fits in:
 * Powers in-app catalog flows where balance checks and redemptions matter.
 *
 * Why it matters:
 * Central place for redemption UX — errors here block spending points safely.
 */
export default function RewardCard({ reward, onRedeem, disabled, showRedeem }) {
  return (
    <div className="card">
      <h3 style={{ margin: "0 0 0.5rem", color: "var(--green-900)" }}>{reward.reward_name}</h3>
      <p style={{ margin: "0 0 0.35rem", fontWeight: 700, color: "var(--green-600)" }}>
        {reward.points_required} points
      </p>
      <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--gray-600)" }}>
        {reward.description || "—"}
      </p>
      <p style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>Stock: {reward.stock}</p>
      {showRedeem && (
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={disabled || reward.stock <= 0}
          onClick={() => onRedeem(reward.id)}
        >
          {reward.stock <= 0 ? "Out of stock" : "Redeem"}
        </button>
      )}
    </div>
  );
}
