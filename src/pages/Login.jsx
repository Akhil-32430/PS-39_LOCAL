import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  // simpler, compact captcha: single operator, small numbers
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    // client-side validation
    const errs = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) errs.email = 'Please enter a valid email.';
    if (!password) errs.password = 'Please enter your password.';
    if (!captchaInput.trim()) errs.captcha = 'Please solve the CAPTCHA.';
    if (captchaInput.trim() !== (captcha.ans || '').toString()) errs.captcha = 'CAPTCHA incorrect.';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError('Please fix the highlighted errors.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", "POST", { email, password });
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
        <h2>Welcome Back</h2>
        <p className="muted">Login to track your projects and portfolio.</p>

        {error && <div className="alert alert-error">{error}</div>}

        {/* CAPTCHA is shown below password for improved UX (moved into form) */}

        <form className="form" onSubmit={handleSubmit}>
          <label>
            <span className="label-text">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={fieldErrors.email ? 'true' : 'false'}
              aria-describedby={fieldErrors.email ? 'err-email' : undefined}
            />
            {fieldErrors.email && <div id="err-email" className="small" style={{ color: 'var(--danger)' }}>{fieldErrors.email}</div>}
          </label>

          <label>
            <span className="label-text">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={fieldErrors.password ? 'true' : 'false'}
              aria-describedby={fieldErrors.password ? 'err-password' : undefined}
            />
            {fieldErrors.password && <div id="err-password" className="small" style={{ color: 'var(--danger)' }}>{fieldErrors.password}</div>}
          </label>

          {/* CAPTCHA challenge placed below password */}
          <div style={{ marginTop: '0.25rem', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div className="captcha-box" style={{ fontSize: '0.9rem', padding: '0.25rem 0.45rem' }}>Solve: <strong>{captcha.q}</strong></div>
                    <input className="captcha-input" placeholder="Answer" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} aria-invalid={fieldErrors.captcha ? 'true' : 'false'} aria-describedby={fieldErrors.captcha ? 'err-captcha' : undefined} />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setCaptcha(makeCaptcha()); setCaptchaInput(''); }}>Refresh</button>
              </div>
          </div>
                  {fieldErrors.captcha && <div id="err-captcha" className="small" style={{ color: 'var(--danger)', marginTop: 6 }}>{fieldErrors.captcha}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Login'}
          </button>
        </form>

        <p className="muted small">
          New user? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
