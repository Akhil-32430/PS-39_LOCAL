import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="nav-left logo">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="url(#g)" />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="var(--accent)" />
                <stop offset="1" stopColor="var(--accent-2)" />
              </linearGradient>
            </defs>
          </svg>
          <div>
            <span className="brand">ProjectTrack</span>
            <div className="brand-sub">Student Portfolio Platform</div>
          </div>
        </Link>
      </div>

      <nav className="nav-right">
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ThemeToggle />
              {import.meta.env && import.meta.env.MODE === 'development' && (
                <button
                  className="btn btn-sm"
                  onClick={() => addNotification({ title: 'Dev Alert', message: 'This is a test alert', type: 'info', timeout: 4500 })}
                >
                  Test Alert
                </button>
              )}
              <div className="nav-user small muted" style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{user.role?.toUpperCase()}</div>
                <div style={{ fontSize: '0.8rem' }}>{user.name}</div>
              </div>
              <div className="avatar" title={user.name}>
                {user.name ? user.name.split(' ').map(n=>n[0]).slice(0,2).join('') : 'U'}
              </div>
            </div>
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <ThemeToggle />
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label="Toggle theme"
      className="theme-pill"
      style={{ border: 'none', cursor: 'pointer' }}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" style={{ opacity: isDark ? 0.9 : 0.55 }}>
        <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8L6.76 4.84zM12 6a6 6 0 100 12 6 6 0 000-12z" fill="currentColor" />
      </svg>

      <div style={{ width: 8 }} />

      <div className="theme-track" style={{ position: 'relative' }}>
        <div
          className="theme-dot"
          style={{ transform: isDark ? 'translateX(0)' : 'translateX(26px)' }}
        />
      </div>

      <div style={{ width: 8 }} />
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" style={{ opacity: isDark ? 0.55 : 0.95 }}>
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
      </svg>
    </button>
  );
};

export default Navbar;
