/**
 * Here's what this is for:
 * Renders a small budget breakdown table from static ROWS (demo figures).
 *
 * How it fits in:
 * Home page transparency block — pairs with the dedicated Budget route if linked.
 *
 * Why it matters:
 * Stakeholders often ask how funds are split; this is the quick visual answer.
 */
const ROWS = [
  { item: "Stickers", cost: "$20" },
  { item: "Breakfast", cost: "$30" },
  { item: "Eco-friendly rewards", cost: "$20" },
];

export default function BudgetTable() {
  return (
    <div className="table-wrap card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Budget</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.item}>
              <td>{r.item}</td>
              <td>{r.cost}</td>
            </tr>
          ))}
          <tr>
            <td>
              <strong>Total</strong>
            </td>
            <td>
              <strong>$70</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
