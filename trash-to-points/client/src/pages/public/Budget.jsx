/**
 * Here's what this is for:
 * Static table of how initiative funds are allocated (demo/public transparency).
 *
 * How it fits in:
 * Linked from home — supports grants and community accountability story.
 *
 * Why it matters:
 * Stakeholders often ask “where does the money go?” — this page answers at a glance.
 */
export default function Budget() {
  const rows = [
    { item: "Stickers", amount: "$20" },
    { item: "Breakfast", amount: "$30" },
    { item: "Eco-friendly rewards", amount: "$20" },
  ];
  return (
    <div>
      <h1 style={{ color: "var(--green-900)" }}>Program budget (sample)</h1>
      <p style={{ color: "var(--gray-600)" }}>Illustrative monthly allocation for rewards.</p>
      <div className="card" style={{ marginTop: "1rem" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Line item</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.item}>
                <td>{r.item}</td>
                <td>{r.amount}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 800 }}>
              <td>Total</td>
              <td>$70</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
