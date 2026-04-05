/**
 * Here's what this is for:
 * Admin forms to add/edit/archive rewards and set point prices.
 *
 * How it fits in:
 * Drives catalog data for both public teaser and resident redemption flows.
 *
 * Why it matters:
 * Catalog mistakes directly affect liabilities (what you promised vs. inventory).
 */
import { useEffect, useState } from "react";
import { api } from "../../api";
import AlertMessage from "../../components/AlertMessage";

export default function ManageRewards() {
  const [rewards, setRewards] = useState([]);
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [desc, setDesc] = useState("");
  const [stock, setStock] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function load() {
    api("/rewards").then(setRewards).catch(() => setRewards([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    setErr("");
    try {
      await api("/rewards", {
        method: "POST",
        body: {
          reward_name: name,
          points_required: parseInt(points, 10),
          description: desc,
          stock: parseInt(stock, 10) || 0,
        },
      });
      setMsg("Reward added.");
      setName("");
      setPoints("");
      setDesc("");
      setStock("");
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function del(id) {
    if (!confirm("Delete this reward?")) return;
    try {
      await api(`/rewards/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Manage rewards</h1>
      <AlertMessage type="success" message={msg} onClose={() => setMsg("")} />
      <AlertMessage type="error" message={err} onClose={() => setErr("")} />

      <form className="card" onSubmit={add} style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>Add reward</h2>
        <div className="grid-2">
          <div className="form-group">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Points required</label>
            <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} required min={1} />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} min={0} />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>

      <div className="table-wrap card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Points</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r) => (
              <tr key={r.id}>
                <td>{r.reward_name}</td>
                <td>{r.points_required}</td>
                <td>{r.stock}</td>
                <td>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => del(r.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
