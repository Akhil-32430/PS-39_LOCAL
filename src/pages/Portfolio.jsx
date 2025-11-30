import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../services/api.js";
import ProjectCard from "../components/ProjectCard.jsx";

const Portfolio = () => {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);

  const loadProjects = async () => {
    const res = await apiRequest("/projects", "GET", null, token);
    setProjects(res);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const approved = projects.filter((p) => p.status === "approved").length;
  const pending = projects.filter((p) => p.status !== "approved").length;

  return (
    <div className="content">
      <h1>{user.name}'s Portfolio</h1>

      {/* Profile Card */}
      <div className="card" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <h3>Profile Details</h3>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      {/* Stats */}
      <div className="grid-3">
        <div className="card stat-card">
          <h4>Total Projects</h4>
          <p className="stat-num">{projects.length}</p>
        </div>
        <div className="card stat-card">
          <h4>Approved</h4>
          <p className="stat-num">{approved}</p>
        </div>
        <div className="card stat-card">
          <h4>Pending</h4>
          <p className="stat-num">{pending}</p>
        </div>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Your Projects</h2>

      <div className="grid-2">
        {projects.length === 0 ? (
          <p className="muted">You have no projects yet.</p>
        ) : (
          projects.map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))
        )}
      </div>
    </div>
  );
};

export default Portfolio;
