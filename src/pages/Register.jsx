import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pwStrength, setPwStrength] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // simpler captcha: single operator, small numbers for better UX
  const makeCaptcha = () => {
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const op = ['+','-','*'][Math.floor(Math.random() * 3)];
    let a, b, q, ans;
    if (op === '+') {
      a = rand(1, 12);
      b = rand(1, 12);
      q = `${a} + ${b}`;
      ans = a + b;
    } else if (op === '-') {
      a = rand(5, 20);
      b = rand(1, Math.min(9, a));
      q = `${a} - ${b}`;
      ans = a - b;
    } else {
      a = rand(2, 8);
      b = rand(2, 6);
      q = `${a} × ${b}`;
      ans = a * b;
    }
    return { q, ans: String(ans) };
  };
  const [captcha, setCaptcha] = useState(makeCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const calcStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score += 30;
    if (/[A-Z]/.test(pw)) score += 20;
    if (/[0-9]/.test(pw)) score += 20;
    if (/[^A-Za-z0-9]/.test(pw)) score += 30;
    return Math.min(100, score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    // client-side validation
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) errs.email = 'Please enter a valid email.';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!captchaInput.trim()) errs.captcha = 'Please solve the CAPTCHA.';
    if (captchaInput.trim() !== (captcha.ans || '').toString()) errs.captcha = 'CAPTCHA incorrect.';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError('Please fix the highlighted errors.');
      return;
    }
    setLoading(true);
    // (captcha already validated above)
    try {
      const data = await apiRequest("/auth/register", "POST", form);
      const { token, ...user } = data;
      login(user, token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>Create Account</h2>
        <p className="muted">
          Students upload projects, admins review and approve them.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        

        <form className="form" onSubmit={handleSubmit}>
          <label>
            <span className="label-text">Full Name</span>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              aria-invalid={fieldErrors.name ? 'true' : 'false'}
              aria-describedby={fieldErrors.name ? 'err-name' : undefined}
            />
            {fieldErrors.name && <div id="err-name" className="small" style={{ color: 'var(--danger)' }}>{fieldErrors.name}</div>}
          </label>

          <label>
            <span className="label-text">Email</span>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label>
            <span className="label-text">Password</span>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={(e) => { handleChange(e); setPwStrength(calcStrength(e.target.value)); }}
              aria-invalid={fieldErrors.password ? 'true' : 'false'}
              aria-describedby={fieldErrors.password ? 'err-password' : undefined}
            />
            <div className="pw-strength"><div className="pw-fill" style={{ width: pwStrength + '%' }} /></div>
            {fieldErrors.password && <div id="err-password" className="small" style={{ color: 'var(--danger)' }}>{fieldErrors.password}</div>}
          </label>

          {/* CAPTCHA challenge placed below password */}
          <div style={{ marginTop: '0.25rem', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <div className="captcha-box">Solve: <strong>{captcha.q}</strong></div>
              <input className="input-search" placeholder="Answer" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} aria-invalid={fieldErrors.captcha ? 'true' : 'false'} aria-describedby={fieldErrors.captcha ? 'err-captcha' : undefined} />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setCaptcha(makeCaptcha()); setCaptchaInput(''); }}>Refresh</button>
            </div>
            {fieldErrors.captcha && <div id="err-captcha" className="small" style={{ color: 'var(--danger)', marginTop: 6 }}>{fieldErrors.captcha}</div>}
          </div>

          <label>
            <span className="label-text">Role</span>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="admin">Admin (Teacher)</option>
            </select>
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Register'}
          </button>
        </form>

        <p className="muted small">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
