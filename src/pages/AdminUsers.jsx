import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { downloadCSV } from "../utils/csv";

const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const { showToast } = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "student" });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/users", "GET", null, token);
      setUsers(Array.isArray(data) ? data : data?.users || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadUsers();
  }, [token]);

  const startEdit = (u) => {
    setEditing(u._id);
    setForm({ name: u.name || "", email: u.email || "", role: u.role || "student" });
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/users/${editing}`, "PUT", form, token);
      setEditing(null);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    setToDelete(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!toDelete) return;
    try {
      await apiRequest(`/users/${toDelete}`, "DELETE", null, token);
      setConfirmOpen(false);
      setToDelete(null);
      loadUsers();
      showToast("User deleted", "info");
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  return (
    <div className="content">
      <h1>User Management</h1>
      {loading ? (
        <p className="muted">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="muted">No users found.</p>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Users</h2>
            <div>
              <button className="btn" onClick={() => downloadCSV("users.csv", users, ["name","email","role"]) }>Export CSV</button>
            </div>
          </div>
          <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.slice((page - 1) * pageSize, page * pageSize).map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => startEdit(u)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center", marginTop: ".5rem" }}>
            <button className="btn btn-outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <div>Page {page} / {Math.max(1, Math.ceil(users.length / pageSize))}</div>
            <button className="btn btn-outline" onClick={() => setPage((p) => Math.min(Math.ceil(users.length / pageSize) || 1, p + 1))}>Next</button>
          </div>
        </>
      )}

      {editing && (
        <div className="card">
          <h3>Edit User</h3>
          <form className="form" onSubmit={submitEdit}>
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-primary" type="submit">Save</button>
              <button className="btn btn-outline" type="button" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete User"
        message={`Delete selected user?`}
        onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
        onConfirm={performDelete}
      />
    </div>
  );
};

export default AdminUsers;
