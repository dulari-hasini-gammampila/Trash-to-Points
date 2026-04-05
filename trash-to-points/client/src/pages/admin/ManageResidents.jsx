/**
 * Here's what this is for:
 * Lists users from the API in UserTable; supports search and admin awareness of roles/points.
 *
 * How it fits in:
 * Staff tool for account oversight — complements DB records in Postgres.
 *
 * Why it matters:
 * Needed to resolve disputes, fix roles, and understand who participates.
 */
import { useEffect, useState } from "react";
import { api } from "../../api";
import UserTable from "../../components/UserTable";

export default function ManageResidents() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    api(`/users${q}`)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Manage users</h1>
      <div className="card" style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "200px", padding: "0.5rem" }}
        />
        <button type="button" className="btn btn-primary" onClick={load}>
          Search
        </button>
      </div>
      {loading ? <div className="page-loading">Loading…</div> : <UserTable users={users} />}
    </div>
  );
}
