/**
 * Here's what this is for:
 * Email/password form, calls auth API, stores JWT, optional `from` redirect after success.
 *
 * How it fits in:
 * Gateway for residents (and demo staff query) into the logged-in app and ProtectedRoutes.
 *
 * Why it matters:
 * Broken login blocks all downstream features; handles the core session handshake with the API.
 */
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AlertMessage from "../../components/AlertMessage";

const DEMO_ADMIN = { username: "admin", password: "admin123" };
const DEMO_RESIDENT = { username: "alex", password: "resident123" };

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const adminHint = location.state?.adminHint || searchParams.get("demo") === "admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const demo = searchParams.get("demo");
    if (demo === "admin") {
      setUsername(DEMO_ADMIN.username);
      setPassword(DEMO_ADMIN.password);
    } else if (demo === "resident") {
      setUsername(DEMO_RESIDENT.username);
      setPassword(DEMO_RESIDENT.password);
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const u = await login(username.trim(), password);
      nav(u.role === "admin" ? "/admin/dashboard" : "/resident/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-icon" aria-hidden="true">
          ♻
        </div>
        <h1 className="auth-card-title">Log in</h1>
        <p className="auth-card-lead">
          New here? <Link to="/register">Create a resident account</Link>
        </p>

        <div className="auth-callout">
          Sign in with your <strong>username</strong> (the name you chose when you registered) and your password.
          Demo admin after seed: username <code>admin</code>, password <code>admin123</code>.
        </div>

        {adminHint && (
          <div className="alert alert-success" style={{ fontWeight: 600 }}>
            Tip: use the buttons below to fill demo credentials, then click Log in.
          </div>
        )}
        <AlertMessage type="error" message={error} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              required
              autoComplete="username"
              placeholder="e.g. admin or alex"
              spellCheck={false}
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Log in
          </button>
        </form>

        <div className="auth-demo-row">
          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={() => {
              setUsername(DEMO_ADMIN.username);
              setPassword(DEMO_ADMIN.password);
              setError("");
            }}
          >
            Fill demo admin
          </button>
          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={() => {
              setUsername(DEMO_RESIDENT.username);
              setPassword(DEMO_RESIDENT.password);
              setError("");
            }}
          >
            Fill demo resident
          </button>
        </div>
        <p className="auth-foot-note">
          Usernames are not case-sensitive. Use letters, numbers, and underscores only (3–32 characters).
        </p>
      </div>
    </div>
  );
}
