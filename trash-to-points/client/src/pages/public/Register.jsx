/**
 * Here's what this is for:
 * Collects signup fields, POSTs to register, saves token and user on success.
 *
 * How it fits in:
 * Onboards new residents into Postgres and AuthContext in one step.
 *
 * Why it matters:
 * Primary growth path for the user base; validation errors must be clear to reduce drop-off.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AlertMessage from "../../components/AlertMessage";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(username.trim(), full_name.trim(), password, email);
      nav("/resident/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-icon" aria-hidden="true">
          ♻
        </div>
        <h1 className="auth-card-title">Create resident account</h1>
        <p className="auth-card-lead">
          Registration is for <strong>community residents only</strong>. You will use your username to sign in.
          <br />
          Already registered? <Link to="/login">Log in</Link>
        </p>
        <AlertMessage type="error" message={error} />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              required
              autoComplete="username"
              placeholder="letters, numbers, underscores (3–32)"
              spellCheck={false}
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9_]{3,32}"
              title="3–32 characters: letters, numbers, underscores"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-name">Full name</label>
            <input id="reg-name" value={full_name} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email (optional)</label>
            <input id="reg-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div className="form-group">
            <label htmlFor="reg-pass">Password (min 6 characters)</label>
            <input
              id="reg-pass"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={6}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
