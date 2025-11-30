import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const Profile = () => {
  const { user, token, login, logout } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", skills: "", website: "", linkedin: "" });
  const [status, setStatus] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      skills: (user.skills && user.skills.join(', ')) || '',
      website: user.website || '',
      linkedin: user.linkedin || ''
    });
  }, [user]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setFieldErrors({});
    // client-side validation
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) errs.email = 'Please enter a valid email.';
    const urlRe = /^(https?:\/\/)?[\w.-]+(\.[\w\.-]+)+[\/]?.*$/;
    if (form.website && !urlRe.test(form.website)) errs.website = 'Please enter a valid URL.';
    if (form.linkedin && !urlRe.test(form.linkedin)) errs.linkedin = 'Please enter a valid LinkedIn URL.';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setStatus('Please fix the highlighted errors.');
      return;
    }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, website: form.website, linkedin: form.linkedin };
      if (form.password) payload.password = form.password;
      // parse skills as comma-separated
      if (form.skills) payload.skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);

      const updated = await apiRequest("/auth/me", "PUT", payload, token);
      // update auth context with new user and token
      if (updated && updated.token) {
        login({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role }, updated.token);
        setStatus("Profile updated");
      } else {
        setStatus("Profile updated — please re-login");
        logout();
      }
    } catch (err) {
      setStatus(err.message);
    }
    setLoading(false);
  };

  if (!user) return <div className="content"><p className="muted">Loading profile…</p></div>;

  return (
    <div className="content">
      <h2>Profile</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required aria-invalid={fieldErrors.name ? 'true' : 'false'} aria-describedby={fieldErrors.name ? 'err-name' : undefined} />
          {fieldErrors.name && <div id="err-name" className="small" style={{ color: 'var(--danger)' }}>{fieldErrors.name}</div>}
        </label>

        <label>
          Email
          <input name="email" value={form.email} onChange={handleChange} required aria-invalid={fieldErrors.email ? 'true' : 'false'} aria-describedby={fieldErrors.email ? 'err-email' : undefined} />
          {fieldErrors.email && <div id="err-email" className="small" style={{ color: 'var(--danger)' }}>{fieldErrors.email}</div>}
        </label>

        <label>
          New Password (leave blank to keep current)
          <input name="password" type="password" value={form.password} onChange={handleChange} />
        </label>

        <label>
          Skills (comma separated)
          <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, ML" />
        </label>

        <label>
          Website
          <input name="website" value={form.website} onChange={handleChange} placeholder="https://..." aria-invalid={fieldErrors.website ? 'true' : 'false'} aria-describedby={fieldErrors.website ? 'err-website' : undefined} />
          {fieldErrors.website && <div id="err-website" className="small" style={{ color: 'var(--danger)' }}>{fieldErrors.website}</div>}
        </label>

        <label>
          LinkedIn
          <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." aria-invalid={fieldErrors.linkedin ? 'true' : 'false'} aria-describedby={fieldErrors.linkedin ? 'err-linkedin' : undefined} />
          {fieldErrors.linkedin && <div id="err-linkedin" className="small" style={{ color: 'var(--danger)' }}>{fieldErrors.linkedin}</div>}
        </label>

        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
          <button type="button" className="btn btn-outline" onClick={() => {
            const shareUrl = `${window.location.origin}/portfolio?user=${user._id}`;
            try { navigator.clipboard.writeText(shareUrl); alert('Profile link copied to clipboard'); } catch (e) { prompt('Copy this link', shareUrl); }
          }}>Share Profile</button>
        </div>

        <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Profile'}</button>
        {status && <p className="muted">{status}</p>}
      </form>
    </div>
  );
};

export default Profile;
