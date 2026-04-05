/**
 * Here's what this is for:
 * Small presentational card: title + emphasized numeric/stat value.
 *
 * How it fits in:
 * Used on resident and admin dashboards for KPIs (points, counts).
 *
 * Why it matters:
 * Reusable metric styling keeps dashboards scannable and consistent.
 */
export default function StatCard({ label, value }) {
  return (
    <div className="card stat-card">
      <p className="label">{label}</p>
      <p className="value">{value}</p>
    </div>
  );
}
