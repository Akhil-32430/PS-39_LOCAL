import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext.jsx';

const LiveFeed = () => {
  const { addNotification } = useNotifications();
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let es;
    let sim;

    const push = (payload) => {
      const item = { id: `${Date.now()}-${Math.random()}`, time: new Date().toLocaleTimeString(), ...payload };
      setEvents((s) => [item, ...s].slice(0, 20));
      try { addNotification({ title: item.title || 'Live', message: item.message || '', type: item.type || 'info', timeout: 5000 }); } catch (e) {}
    };

    // Try Server-Sent Events endpoint first
    try {
      if (window.EventSource) {
        es = new EventSource('/events');
        es.onmessage = (e) => {
          try { push(JSON.parse(e.data)); } catch (err) { push({ title: 'Event', message: e.data }); }
        };
        es.onerror = () => { es.close(); es = null; };
      }
    } catch (e) {
      es = null;
    }

    // Fallback simulation when no SSE available
    if (!es) {
      sim = setInterval(() => {
        push({ title: 'New Submission', message: 'A student submitted a project.' });
      }, 15000);
    }

    return () => {
      if (es) es.close();
      if (sim) clearInterval(sim);
    };
  }, [addNotification]);

  return (
    <div className={`livefeed ${open ? 'open' : ''}`} aria-live="polite">
      <button className="livefeed-toggle btn" onClick={() => setOpen(!open)} aria-expanded={open} title="Live activity">
        ⚡
        {events.length > 0 && <span className="notif-badge">{events.length}</span>}
      </button>

      <div className="livefeed-panel card" style={{ display: open ? 'block' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong>Live Activity</strong>
          <button className="btn btn-sm" onClick={() => setEvents([])}>Clear</button>
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.length === 0 && <div className="muted small">No recent activity.</div>}
          {events.map((e) => (
            <div key={e.id} className="notif-item" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{e.title}</div>
                <div className="small muted">{e.message}</div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{e.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveFeed;
