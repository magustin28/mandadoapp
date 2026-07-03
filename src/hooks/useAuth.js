import { useState, useEffect } from "react";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../services/storage";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  function login(email, password) {
    const result = loginUser(email, password);
    if (result.user) setUser(result.user);
    return result;
  }

  function logout() {
    logoutUser();
    setUser(null);
  }

  function register(name, email, password) {
    const result = registerUser(name, email, password);
    if (result.user) setUser(result.user);
    return result;
  }

  function getInitials() {
    if (!user) return "";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return { user, loading, login, logout, register, getInitials };
}
