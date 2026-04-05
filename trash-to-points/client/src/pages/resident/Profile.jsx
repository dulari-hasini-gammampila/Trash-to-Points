/**
 * Here's what this is for:
 * Form to view/update the logged-in resident’s profile via PATCH /users/me (or similar).
 *
 * How it fits in:
 * Lets users fix name/email mistakes without admin intervention.
 *
 * Why it matters:
 * Accurate contact info is needed for reward pickup and communications.
 */
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import AlertMessage from "../../components/AlertMessage";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    setFullName(user?.full_name || "");
    setEmail(user?.email || "");
  }, [user?.full_name, user?.email]);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      const body = { full_name: full_name.trim() };
      const em = email.trim();
      body.email = em === "" ? null : em;
      if (password.length >= 6) body.password = password;
      await api(`/users/${user.id}`, { method: "PUT", body });
      setMsg("Profile updated.");
      setPassword("");
      refreshUser();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>My profile</h1>
      <AlertMessage type="success" message={msg} />
      <AlertMessage type="error" message={err} />
      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: "480px" }}>
        <div className="form-group">
          <label>Username</label>
          <input value={user?.username || ""} disabled style={{ opacity: 0.75 }} />
          <small style={{ color: "var(--gray-600)" }}>Your sign-in name. Ask an admin if you need it changed.</small>
        </div>
        <div className="form-group">
          <label>Full name</label>
          <input value={full_name} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email (optional)</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>
        <div className="form-group">
          <label>New password (optional, min 6 chars)</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </div>
        <button type="submit" className="btn btn-primary">
          Save changes
        </button>
      </form>
    </div>
  );
}
