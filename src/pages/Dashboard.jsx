import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

const Dashboard = () => {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/projects", "GET", null, token);
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProjects();
    }
  }, [token]);

  const approved = projects.filter((p) => p.status === "approved").length;
  const pending = projects.filter((p) => p.status === "pending").length;
  const inReview = projects.filter((p) => p.status === "in-review").length;

  // animated counters for a futuristic feel
  const [countTotal, setCountTotal] = useState(0);
  const [countApproved, setCountApproved] = useState(0);
  const [countPending, setCountPending] = useState(0);

  useEffect(() => {
    // simple ease animation
    const animate = (from, to, setter) => {
      const duration = 700;
      const start = performance.now();
      const frame = (t) => {
        const p = Math.min(1, (t - start) / duration);
        const v = Math.round(from + (to - from) * p);
        setter(v);
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    animate(countTotal, projects.length, setCountTotal);
    animate(countApproved, approved, setCountApproved);
    animate(countPending, pending + inReview, setCountPending);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  return (
    <div className="content">
      <div className="hero">
        <div className="hero-left">
          <h1 className="hero-title">Hello, {user.name || 'User'}</h1>
          <div className="hero-sub">Manage your projects, track reviews, and showcase your best work.</div>
          <div className="hero-actions">
            <a href="/projects" className="btn btn-primary">Create Project</a>
            <a href="/portfolio" className="btn btn-outline">View Portfolio</a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.9rem' }}>
          <div className="card stat-card" style={{ minWidth: 140, textAlign: 'center' }}>
            <div className="small muted">Total</div>
            <div className="stat-animated">{countTotal}</div>
          </div>
          <div className="card stat-card" style={{ minWidth: 140, textAlign: 'center' }}>
            <div className="small muted">Approved</div>
            <div className="stat-animated">{countApproved}</div>
          </div>
          <div className="card stat-card" style={{ minWidth: 140, textAlign: 'center' }}>
            <div className="small muted">Pending</div>
            <div className="stat-animated">{countPending}</div>
          </div>
        </div>
      </div>

      <h2 className="section-title">
        {user.role === "admin" ? "Recent Submissions" : "Your Recent Projects"}
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet" subtitle={"Create your first project in My Projects."} cta={(<a href="/projects" className="btn btn-primary">Go to My Projects</a>)} />
      ) : (
        <div className="grid-2">
          {projects.slice(0, 4).map((p) => (
            <ProjectCard key={p._id} project={p} reload={loadProjects} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
