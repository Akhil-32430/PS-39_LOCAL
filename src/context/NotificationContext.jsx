import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useToast } from "./ToastContext.jsx";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const timers = useRef(new Map());
  const { showToast } = useToast();

  useEffect(() => {
    return () => {
      // clear all timers
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
      setAlerts([]);
    };
  }, []);

  const actuallyRemove = (id) => {
    setAlerts((s) => s.filter((a) => a.id !== id));
    if (timers.current.has(id)) {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
    }
  };

  const scheduleRemove = (id, ms) => {
    if (timers.current.has(id)) clearTimeout(timers.current.get(id));
    const t = setTimeout(() => {
      // mark closing to allow exit animation
      setAlerts((s) => s.map((a) => (a.id === id ? { ...a, closing: true } : a)));
      // remove after animation (300ms)
      setTimeout(() => actuallyRemove(id), 320);
    }, ms);
    timers.current.set(id, t);
  };

  const addNotification = ({ title = "Notification", message = "You have a new notification.", type = "info", timeout = 5000 }) => {
    const id = `${Date.now()}-${Math.random()}`;
    const alert = { id, title, message, type, remaining: timeout, createdAt: Date.now(), closing: false };
    setAlerts((s) => [alert, ...s].slice(0, 10));

    // also show a toast for quick feedback
    try { showToast(`${title}: ${message}`, type === 'error' ? 'danger' : 'info', Math.max(3000, timeout)); } catch (e) {}

    scheduleRemove(id, timeout);

    return id;
  };

  const removeNotification = (id) => {
    // allow exit animation
    setAlerts((s) => s.map((a) => (a.id === id ? { ...a, closing: true } : a)));
    setTimeout(() => actuallyRemove(id), 320);
  };

  const pause = (id) => {
    const t = timers.current.get(id);
    if (!t) return;
    clearTimeout(t);
    timers.current.delete(id);
    // compute remaining
    setAlerts((s) => s.map((a) => {
      if (a.id !== id) return a;
      const elapsed = Date.now() - (a.createdAt || Date.now());
      const remaining = Math.max(0, (a.remaining || 0) - elapsed);
      return { ...a, remaining, pausedAt: Date.now() };
    }));
  };

  const resume = (id) => {
    setAlerts((s) => s.map((a) => {
      if (a.id !== id) return a;
      const rem = a.remaining || 3000;
      // refresh createdAt so elapsed calculations remain sensible
      const updated = { ...a, createdAt: Date.now() };
      // schedule removal
      scheduleRemove(id, rem);
      return updated;
    }));
  };

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification, alerts }}>
      {children}
      <div className="alert-box" aria-live="polite">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`alert card alert-${a.type} ${a.closing ? 'closing' : ''}`}
            role="alert"
            onMouseEnter={() => pause(a.id)}
            onMouseLeave={() => resume(a.id)}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div className="alert-icon" aria-hidden>
                {a.type === 'success' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
                {a.type === 'error' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
                {a.type === 'warning' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="0" fill="currentColor"/></svg>
                )}
                {a.type === 'info' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2"/><path d="M12 16v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M12 8h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{a.title}</div>
                <div className="small muted" style={{ marginTop: 4 }}>{a.message}</div>
              </div>
              <div>
                <button className="btn btn-sm" onClick={() => removeNotification(a.id)}>Close</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
