/**
 * Here's what this is for:
 * Sortable/read-only table of user accounts for admin review.
 *
 * How it fits in:
 * ManageResidents page feeds it API data — search/filter may live in parent.
 *
 * Why it matters:
 * Quick scan of roles and balances when resolving account issues.
 */
export default function UserTable({ users }) {
  if (!users?.length) {
    return <div className="empty-state">No users found.</div>;
  }
  return (
    <div className="table-wrap card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Points</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <code>{u.username}</code>
              </td>
              <td>{u.full_name}</td>
              <td>{u.email || "—"}</td>
              <td>{u.role}</td>
              <td>{u.total_points}</td>
              <td>{u.created_at?.slice(0, 10) || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
