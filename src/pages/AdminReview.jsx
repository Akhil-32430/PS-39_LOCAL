import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { downloadCSV } from "../utils/csv";

const AdminReview = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("in-review");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
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

  const stats = {
    total: projects.length,
    approved: projects.filter((p) => p.status === "approved").length,
    pending: projects.filter((p) => p.status === "pending").length,
    changes: projects.filter((p) => p.status === "changes-required").length
  };

  const openReview = (p) => {
    setSelected(p);
    setStatus(p.status || "in-review");
    setFeedback(p.feedback || "");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      await apiRequest(
        `/projects/${selected._id}/review`,
        "PATCH",
        { status, feedback },
        token
      );
      setSelected(null);
      loadProjects();
    } catch (err) {
      showToast(err.message || "Review save failed", "error");
    }
  };

  return (
    <div className="content">
      <h1>Admin Dashboard</h1>

      <div className="grid-3">
        <div className="card stat-card">
          <h4>Total Projects</h4>
          <p className="stat-num">{stats.total}</p>
        </div>
        <div className="card stat-card">
          <h4>Approved</h4>
          <p className="stat-num">{stats.approved}</p>
        </div>
        <div className="card stat-card">
          <h4>Pending</h4>
          <p className="stat-num">{stats.pending}</p>
        </div>
        <div className="card stat-card">
          <h4>Need Changes</h4>
          <p className="stat-num">{stats.changes}</p>
        </div>
      </div>

      <h2 className="section-title">Review Projects</h2>

      <div className="grid-2">
        <div>
          {loading ? (
            <p className="muted">Loading submissions…</p>
          ) : projects.length === 0 ? (
            <p className="muted">No submissions yet.</p>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Submissions</h3>
                <div>
                  <button className="btn" onClick={() => downloadCSV("submissions.csv", projects, ["title","status","owner"]) }>Export CSV</button>
                </div>
              </div>
              <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Student</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {projects.slice((page - 1) * pageSize, page * pageSize).map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td>{p.owner?.name}</td>
                    <td>
                      <span className={`badge badge-${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => openReview(p)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", gap: ".5rem", alignItems: "center", marginTop: ".5rem" }}>
              <button className="btn btn-outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
              <div>Page {page} / {Math.max(1, Math.ceil(projects.length / pageSize))}</div>
              <button className="btn btn-outline" onClick={() => setPage((p) => Math.min(Math.ceil(projects.length / pageSize) || 1, p + 1))}>Next</button>
            </div>
            </>
          )}
        </div>

        {selected && (
          <div className="card review-card">
            <h3>Review: {selected.title}</h3>
            <p className="muted">
              By {selected.owner?.name} ({selected.owner?.email})
            </p>
            <p>{selected.description}</p>

            <form className="form" onSubmit={submitReview}>
              <label>
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="changes-required">Changes Required</option>
                </select>
              </label>

              <label>
                Feedback
                <textarea
                  rows="3"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </label>

              <button className="btn btn-primary">Save Review</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReview;
