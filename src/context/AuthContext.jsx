import React, { createContext, useContext, useEffect, useState } from "react";
import { useNotifications } from "./NotificationContext.jsx";
import { useToast } from "./ToastContext.jsx";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // notification hooks (providers are above AuthProvider in tree)
  const { addNotification } = useNotifications();
  const { showToast } = useToast();

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  const login = (userData, tokenVal) => {
    setUser(userData);
    setToken(tokenVal);
    try {
      if (addNotification) addNotification({ title: 'Logged in', message: `Welcome back, ${userData.name || 'user'}`, type: 'success', timeout: 4000 });
      if (showToast) showToast('Login successful', 'info', 3000);
    } catch (err) {}
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      if (addNotification) addNotification({ title: 'Logged out', message: 'You have been logged out', type: 'info', timeout: 3500 });
      if (showToast) showToast('Logged out successfully', 'info', 2500);
    } catch (err) {}
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
