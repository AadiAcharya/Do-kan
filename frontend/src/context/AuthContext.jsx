import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [vendor, setVendor] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("dokan_token") || null);
  const [loading, setLoading] = useState(true);

  const saveAuth = (tok, u, v = null) => {
    localStorage.setItem("dokan_token", tok);
    setToken(tok);
    setUser(u);
    setVendor(v);
  };

  const logout = useCallback(() => {
    localStorage.removeItem("dokan_token");
    setToken(null);
    setUser(null);
    setVendor(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { logout(); return; }
      const data = await res.json();
      setUser(data.user);
      setVendor(data.vendor || null);
    } catch {
      logout();
    }
  }, [token, logout]);

  // Re-hydrate session on mount
  useEffect(() => {
    const hydrate = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch("http://localhost:3001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { logout(); return; }
        const data = await res.json();
        setUser(data.user);
        setVendor(data.vendor || null);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, vendor, token, loading, saveAuth, logout, refreshUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
