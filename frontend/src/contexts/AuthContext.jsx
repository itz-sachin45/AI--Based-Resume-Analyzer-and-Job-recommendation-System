import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("careerai-user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("careerai-token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      api.get("/api/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => logout());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const persist = (tok, u) => {
    localStorage.setItem("careerai-token", tok);
    localStorage.setItem("careerai-user", JSON.stringify(u));
    setToken(tok);
    setUser(u);
  };

  const register = async (full_name, email, password, confirm_password) => {
    const res = await api.post("/api/auth/register", { full_name, email, password, confirm_password });
    persist(res.data.access_token, res.data.user);
    return res.data.user;
  };

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    persist(res.data.access_token, res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("careerai-token");
    localStorage.removeItem("careerai-user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
