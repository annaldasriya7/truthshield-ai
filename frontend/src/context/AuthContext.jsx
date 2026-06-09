import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("truthshield_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("truthshield_token", data.token);
      localStorage.setItem("truthshield_user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", { name, email, password });
      localStorage.setItem("truthshield_token", data.token);
      localStorage.setItem("truthshield_user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("truthshield_token");
    localStorage.removeItem("truthshield_user");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("truthshield_token");
    if (!token) return;

    API.get("/auth/profile").catch(() => {
      logout();
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
