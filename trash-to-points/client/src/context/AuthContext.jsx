/**
 * Here's what this is for:
 * Remembers who is logged in across every page—name, role (resident or admin), and loading state.
 * Provides login, logout, and sign-up for the rest of the app.
 *
 * How it fits in:
 * Wraps the whole app from main.jsx so any button or page can ask “who am I?”
 *
 * Why it matters:
 * The resident and admin menus depend on this. If it breaks, people see the wrong screens or get kicked out.
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api("/users/me");
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  async function login(username, password) {
    const data = await api("/auth/login", { method: "POST", body: { username, password } });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(username, full_name, password, email) {
    const body = { username, full_name, password };
    if (email != null && String(email).trim() !== "") body.email = String(email).trim();
    const data = await api("/auth/register", { method: "POST", body });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
