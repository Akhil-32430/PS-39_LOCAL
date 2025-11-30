import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Fab from "../components/Fab.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { downloadCSV } from "../utils/csv";

const emptyForm = {
  title: "",
  description: "",
  technologies: "",
  repoLink: "",
  demoLink: "",
  mediaUrl: "",
  milestonesText: ""
};

const Projects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const { showToast } = useToast();

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/projects", "GET", null, token);
      setProjects(Array.isArray(data) ? data : data?.projects || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadProjects();
  }, [token]);

  // delete flow with confirm modal
  const performDelete = async () => {
    if (!toDelete) return;
    try {
      await apiRequest(`/projects/${toDelete._id}`, "DELETE", null, token);
      setConfirmOpen(false);
      setToDelete(null);
      loadProjects();
      showToast("Project deleted", "info");
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  

  const buildPayload = () => {
    const technologies = form.technologies
      ? form.technologies.split(",").map((t) => t.trim())
      : [];

    const milestones = form.milestonesText
      ? form.milestonesText
          .split("\n")
          .map((label) => label.trim())
          .filter(Boolean)
          .map((label) => ({ label, completed: false }))
      : [];

    return {
      title: form.title,
      description: form.description,
      technologies,
      repoLink: form.repoLink,
      demoLink: form.demoLink,
      mediaUrl: form.mediaUrl,
      milestones
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = buildPayload();
      if (editingId) {
        await apiRequest(`/projects/${editingId}`, "PUT", payload, token);
      } else {
        await apiRequest("/projects", "POST", payload, token);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setForm({
      title: project.title,
      description: project.description,
      technologies: project.technologies?.join(", ") || "",
      repoLink: project.repoLink || "",
      demoLink: project.demoLink || "",
      mediaUrl: project.mediaUrl || "",
      milestonesText:
        project.milestones?.map((m) => m.label).join("\n") || ""
    });
  };

  const filtered = projects.filter((p) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (p.title || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.technologies || []).join(" ").toLowerCase().includes(q) ||
      (p.owner?.name || p.owner?.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="content">
      <div className="grid-2">
        <div>
          <h2 className="section-title">
            {editingId ? "Edit Project" : "Add New Project"}
          </h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form className="form" onSubmit={handleSubmit}>
            <label>
              Title
              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                rows="3"
                required
                value={form.description}
                onChange={handleChange}
              />
            </label>

            <label>
              Technologies (comma separated)
              <input
                name="technologies"
                value={form.technologies}
                onChange={handleChange}
                placeholder="React, Node, MongoDB"
              />
            </label>

            <label>
              Repo Link
              <input
                name="repoLink"
                value={form.repoLink}
                onChange={handleChange}
              />
            </label>

            <label>
              Demo Link
              <input
                name="demoLink"
                value={form.demoLink}
                onChange={handleChange}
              />
            </label>

            <label>
              Media URL (image / video)
              <input
                name="mediaUrl"
                value={form.mediaUrl}
                onChange={handleChange}
              />
            </label>


            <label>
              Milestones (one per line)
              <textarea
                name="milestonesText"
                rows="3"
                value={form.milestonesText}
                onChange={handleChange}
              />
            </label>

            <button className="btn btn-primary" type="submit">
              {editingId ? "Update Project" : "Create Project"}
            </button>
          </form>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="section-title">My Projects</h2>
            <div style={{ marginLeft: 'auto' }}>
              <SearchBar value={query} onChange={setQuery} />
            </div>
          </div>

          {loading ? (
            <p className="muted">Loading projects…</p>
          ) : filtered.length === 0 ? (
            <EmptyState title="No matching projects" subtitle={query ? `No results for "${query}".` : 'You have not created any projects yet.'} cta={(
              <button className="btn btn-primary" onClick={() => { document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' }); document.querySelector('input[name="title"]')?.focus(); }}>Create your first project</button>
            )} />
          ) : (
            <>
              <div className="project-list">
                {filtered
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((p) => (
                    <ProjectCard
                      key={p._id}
                      project={{ ...p, reload: loadProjects, onDelete: () => { setToDelete(p); setConfirmOpen(true); } }}
                      onEdit={handleEdit}
                    />
                  ))}
              </div>
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button className="btn btn-outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                <div>Page {page} / {Math.max(1, Math.ceil(projects.length / pageSize))}</div>
                <button className="btn btn-outline" onClick={() => setPage((p) => Math.min(Math.ceil(projects.length / pageSize) || 1, p + 1))}>Next</button>
                <div style={{ marginLeft: "auto" }}>
                  <button className="btn" onClick={() => downloadCSV("projects.csv", projects, ["title","description","status","owner"]) }>Export CSV</button>
                </div>
              </div>
            </>
          )}

          <Fab title="Create" onClick={() => { document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' }); document.querySelector('input[name="title"]')?.focus(); }} />
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete Project"
        message={`Delete project "${toDelete?.title}"?`}
        onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
        onConfirm={performDelete}
      />
    </div>
  );
};

export default Projects;
