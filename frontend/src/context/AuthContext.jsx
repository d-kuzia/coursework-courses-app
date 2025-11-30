import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, getToken } from "../api/client";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const [hasToken] = useState(() => !!getToken());
  const [loading, setLoading] = useState(hasToken);

  useEffect(() => {
    if (!hasToken) return;

    let cancelled = false;

    api("/api/auth/me")
      .then((data) => {
        if (!cancelled) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasToken]);

  async function login(email, password) {
    setError(null);
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setToken(data.token);
    setUser(data.user);
  }

  async function register(name, email, password) {
    setError(null);
    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  async function updateProfile(name) {
    setError(null);
    const data = await api("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify({ name })
    });
    setUser(data.user);
    return data.user;
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
