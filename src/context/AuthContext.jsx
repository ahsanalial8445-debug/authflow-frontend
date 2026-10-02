import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import {
  setToken,
  setUser,
  getToken,
  getUser,
  clearAuth,
} from "../utils/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const { data } = await api.get("/auth/me");
        setUserState(data.user);
        setUser(data.user);
      } catch (err) {
        const cached = getUser();
        if (cached) setUserState(cached);
      }
    };
    bootstrap();
  }, []);

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    setToken(data.token);
    setUser(data.user);
    setUserState(data.user);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    setUserState(data.user);
    return data;
  };

  const logout = () => {
    clearAuth();
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};