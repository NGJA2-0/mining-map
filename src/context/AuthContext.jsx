import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mm_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("mm_token"));

  useEffect(() => {
    if (user) localStorage.setItem("mm_user", JSON.stringify(user));
    else localStorage.removeItem("mm_user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("mm_token", token);
    else localStorage.removeItem("mm_token");
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
      throw new Error(data.message || "Signup failed. Please try again.");
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
      throw new Error(data.message || "Login failed. Please try again.");
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
