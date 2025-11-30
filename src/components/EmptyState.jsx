import React from "react";

const EmptyState = ({ title = "Nothing here", subtitle, cta }) => {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: 42, marginBottom: '0.6rem', color: 'var(--muted)' }}>📭</div>
      <h3 style={{ margin: 0 }}>{title}</h3>
      {subtitle && <p className="muted" style={{ marginTop: '0.5rem' }}>{subtitle}</p>}
      {cta && <div style={{ marginTop: '1rem' }}>{cta}</div>}
    </div>
  );
};

export default EmptyState;
