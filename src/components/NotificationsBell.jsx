import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext.jsx";

const NotificationsBell = () => {
  const { notifications, unreadCount, markRead, markAllRead, removeNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handleToggle = (e) => {
    e.stopPropagation();
    setOpen(!open);
    if (!open) {
      // mark all read when opening
      setTimeout(() => markAllRead(), 250);
    }
  };

  return (
    <div className="notif-bell" ref={ref}>
      <button className="btn" onClick={handleToggle} aria-label="Notifications">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M15 17H9a3 3 0 01-3-3V10a6 6 0 0112 0v4a3 3 0 01-3 3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong>Notifications</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={() => markAllRead()}>Mark all</button>
              <button className="btn btn-sm" onClick={() => notifications.forEach(n => removeNotification(n.id))}>Clear</button>
            </div>
          </div>

          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.length === 0 && <div className="muted small">No notifications yet.</div>}
            {notifications.map((n) => (
              <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{n.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{new Date(n.createdAt).toLocaleTimeString()}</div>
                  </div>
                  <div className="small muted" style={{ marginTop: 4 }}>{n.message}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {!n.read && <button className="btn btn-sm" onClick={() => markRead(n.id)}>Mark</button>}
                  <button className="btn btn-outline btn-sm" onClick={() => removeNotification(n.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
