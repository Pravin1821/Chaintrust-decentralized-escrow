import { createContext, useContext, useState, useEffect } from "react";
import api, { registerApi, setOnUnauthorized } from "../api/axios";
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Initialize from localStorage, then verify with /me
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
    const rawMePath =
      (import.meta.env.VITE_ME_ENDPOINT && import.meta.env.VITE_ME_ENDPOINT) ||
      "/auth/me";
    const mePath = normalizeAuthPath(rawMePath, "/auth/me");
    const init = async () => {
      try {
        // Register global 401 handler
        setOnUnauthorized(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        });
        if (token) {
          const { data } = await api.get(mePath);
          const normalizedUser = data.user || {
            _id: data._id,
            username: data.username,
            email: data.email,
            role: data.role,
            walletAddress: data.walletAddress,
            isWalletVerified: data.isWalletVerified,
            isActive: data.isActive,
            createdAt: data.createdAt,
            reputation: data.reputation,
            permissions: data.permissions,
            department: data.department,
          };
          localStorage.setItem("user", JSON.stringify(normalizedUser));
          setUser(normalizedUser);
        }
      } catch (e) {
        // Token invalid or server error; clear auth state
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);
  const login = async (payload) => {
    const rawLoginPath = import.meta.env.VITE_LOGIN_ENDPOINT || "/auth/login";
    const loginPath = normalizeAuthPath(rawLoginPath, "/auth/login");
    const { data } = await api.post(loginPath, payload);
    const token = data.token;
    const normalizedUser = data.user || {
      _id: data._id,
      username: data.username,
      email: data.email,
      role: data.role,
      walletAddress: data.walletAddress,
      isWalletVerified: data.isWalletVerified,
      isActive: data.isActive,
      createdAt: data.createdAt,
      reputation: data.reputation,
    };
    if (token) localStorage.setItem("token", token);
    if (token) {
      console.log("[Auth] Login token:", token);
    } else {
      console.warn("[Auth] Login response has no token");
    }
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    return normalizedUser;
  };
  const register = async (payload, opts = {}) => {
    const rawRegisterPath =
      import.meta.env.VITE_REGISTER_ENDPOINT || "/auth/register";
    const endpoint = normalizeAuthPath(rawRegisterPath, "/auth/register");
    const client = opts.useAltApi ? registerApi : api;
    const { data } = await client.post(endpoint, payload);
    const token = data.token;
    const normalizedUser = data.user || {
      _id: data._id,
      username: data.username,
      email: data.email,
      role: data.role,
      walletAddress: data.walletAddress,
      isWalletVerified: data.isWalletVerified,
      isActive: data.isActive,
      createdAt: data.createdAt,
      reputation: data.reputation,
    };
    if (token) localStorage.setItem("token", token);
    // Debug: show token in console when registering
    if (token) {
      console.log("[Auth] Register token:", token);
    } else {
      console.warn("[Auth] Register response has no token");
    }
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    return normalizedUser;
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  return useContext(AuthContext);
};

// Ensure overridden auth endpoints always include the /auth prefix
function normalizeAuthPath(path, fallback) {
  let p = path || fallback;
  if (!p) return "/auth"; // safety
  // Trim trailing spaces
  p = String(p).trim();
  // Ensure starts with '/'
  if (!p.startsWith("/")) p = `/${p}`;
  // If already under /auth, return
  if (/^\/auth(\/.|$)/.test(p)) return p;
  // If it's bare auth endpoints like /login, /register, /me, prefix /auth
  if (/^\/(login|register|me)(\/|$)/.test(p)) {
    return `/auth${p}`;
  }
  return p;
}
