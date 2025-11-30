import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const getInitial = () => {
    try {
      const stored = localStorage.getItem("ft_theme");
      if (stored) return stored;
    } catch (e) {}
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
  };

  // compute initial and apply immediately to avoid flash
  const initial = getInitial();
  try { document.documentElement.setAttribute("data-theme", initial); } catch (e) {}
  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    try { localStorage.setItem("ft_theme", theme); } catch (e) {}
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeContext;
