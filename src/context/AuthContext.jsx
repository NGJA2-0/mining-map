import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** Decode the exp claim from a JWT without verifying the signature. */
function getTokenExpMs(jwt) {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Returns null if the JWT is missing, malformed, or already expired. */
function getValidStoredToken() {
  const jwt = localStorage.getItem("mm_token");
  if (!jwt) return null;
  const expMs = getTokenExpMs(jwt);
  if (expMs !== null && expMs <= Date.now()) {
    // Expired — clear storage immediately so the app starts clean.
    localStorage.removeItem("mm_token");
    localStorage.removeItem("mm_user");
    return null;
  }
  return jwt;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getValidStoredToken());

  const [user, setUser] = useState(() => {
    // Only parse user if we have a valid token; skip if token was cleared above.
    if (!localStorage.getItem("mm_token")) return null;
    const stored = localStorage.getItem("mm_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      // Corrupt stored user — discard it.
      localStorage.removeItem("mm_user");
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("mm_user", JSON.stringify(user));
    else localStorage.removeItem("mm_user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("mm_token", token);
    else localStorage.removeItem("mm_token");
  }, [token]);

  // Auto-logout when the current token reaches its expiry while the tab is open.
  useEffect(() => {
    if (!token) return;
    const expMs = getTokenExpMs(token);
    if (expMs === null) return;
    const msUntilExpiry = expMs - Date.now();
    if (msUntilExpiry <= 0) {
      // Already expired (race condition at mount) — log out immediately.
      setToken(null);
      setUser(null);
      return;
    }
    const timer = setTimeout(() => {
      setToken(null);
      setUser(null);
    }, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [token]);

  /**
   * Calls POST /api/signup and stores the returned user + token.
   * Throws an Error with a user-facing message on failure.
   */
  const signup = async ({ name, nic, password }) => {
    const res = await fetch(`${BASE_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, nic, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "Signup failed. Please try again.");
    }

    setToken(data.token);
    setUser(data.user);
    return data;
  };

  /**
   * Calls POST /api/login and stores the returned user + token.
   * Throws an Error with a user-facing message on failure.
   */
  const login = async ({ nic, password }) => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nic, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "Login failed. Please try again.");
    }

    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
