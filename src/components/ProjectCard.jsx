import React, { useState } from "react";
import { apiRequest } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const statusColor = {
  pending: "badge-grey",
  "in-review": "badge-blue",
  approved: "badge-green",
  "changes-required": "badge-red"
};

const ProjectCard = ({ project, onEdit, reload }) => {
  const { token, user } = useAuth();
  const [modal, setModal] = useState(null);

  const toggleMilestone = async (index) => {
    if (!token) return;
    const updatedMilestones = [...(project.milestones || [])];
    updatedMilestones[index].completed = !updatedMilestones[index].completed;

    await apiRequest(
      `/projects/${project._id}`,
      "PUT",
      { milestones: updatedMilestones },
      token
    );

    if (typeof reload === "function") reload();
    else if (typeof project.reload === "function") project.reload();
    else window.location.reload();
  };

  const handleDelete = async () => {
    // prefer parent-managed delete (Projects passes `onDelete`), fallback to inline
    if (typeof project.onDelete === "function") return project.onDelete(project);
    if (typeof onEdit === "function" && typeof onEdit.onDelete === "function") return onEdit.onDelete(project);
    if (!token) return;
    if (!confirm("Delete this project?")) return;
    try {
      await apiRequest(`/projects/${project._id}`, "DELETE", null, token);
      if (typeof reload === "function") reload();
      else if (typeof project.reload === "function") project.reload();
      else window.location.reload();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="card project-card">
      {/* thumbnail if available */}
      {/* thumbnail / gallery */}
      {project.mediaUrls && project.mediaUrls.length > 0 ? (
        <div className="project-thumb gallery">
          {project.mediaUrls.slice(0,4).map((m, idx) => (
            <button key={idx} className="thumb-btn" onClick={() => setModal(m)} style={{ backgroundImage: `url(${m})` }} aria-label={`Open media ${idx+1}`} />
          ))}
        </div>
      ) : project.mediaUrl ? (
        <div className="project-thumb" style={{ backgroundImage: `url(${project.mediaUrl})` }} />
      ) : (
        <div className="project-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>No preview</div>
      )}
      <div className="card-header">
        <h3>{project.title}</h3>
        <span className={`badge ${statusColor[project.status]}`}>
          {project.status?.toUpperCase()}
        </span>
      </div>

      { (project.owner || project.createdAt) && (
        <div className="project-meta">
          {project.owner && (
            <div className="meta-item">
              <strong>{project.owner.name || project.owner.email}</strong>
            </div>
          )}
          {project.createdAt && (
            <div className="meta-item">Created: {new Date(project.createdAt).toLocaleDateString()}</div>
          )}
        </div>
      )}

      <p className="project-desc">{project.description}</p>

      {project.technologies?.length > 0 && (
        <div className="chip-container">
          {project.technologies.map((t, i) => (
            <span key={i} className="chip">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="project-links">
        {project.repoLink && (
          <a href={project.repoLink} target="_blank" rel="noreferrer">
            Repo
          </a>
        )}
        {project.demoLink && (
          <a href={project.demoLink} target="_blank" rel="noreferrer">
            Demo
          </a>
        )}
      </div>

      {project.milestones?.length > 0 && (
        <ul className="milestone-list">
          {project.milestones.map((m, i) => (
            <li
              key={i}
              className={m.completed ? "done" : ""}
              onClick={() => toggleMilestone(i)}
              style={{ cursor: "pointer" }}
            >
              <span className="milestone-dot" />
              {m.label} {m.completed && "✔"}
            </li>
          ))}
        </ul>
      )}

      {project.feedback && (
        <p className="feedback">
          <strong>Feedback:</strong> {project.feedback}
        </p>
      )}

      <div className="project-actions">
        {onEdit && (
          <button className="btn btn-sm btn-outline" onClick={() => onEdit(project)}>
            Edit Project
          </button>
        )}

        {(user && (user.role === "admin" || user._id === project.owner?._id)) && (
          <button className="btn btn-sm btn-danger" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
      {modal && (
        <div className="media-modal" role="dialog" aria-modal="true" onClick={() => setModal(null)}>
          <img src={modal} alt={project.title} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

// modal state handler added below: small inline modal using state


export default ProjectCard;
