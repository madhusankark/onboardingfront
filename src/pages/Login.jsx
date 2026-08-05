import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import {
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Zap
} from 'lucide-react';

function AuthVisual() {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
        color: '#ffffff',
        padding: '56px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
            Onboard<span style={{ color: '#818cf8' }}>Hub</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '4px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-block', marginBottom: 16 }}>
            🔐 Secure Portal Gateway
          </span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Welcome Back to OnboardHub
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: 32 }}>
            Sign in with your registered email and password to access your dashboard, track service applications, manage bookings, or access administrative operations.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: 14, backdropFilter: 'blur(6px)' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <div>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>256-bit Encrypted Security</strong>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>End-to-end credential protection</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: 14, backdropFilter: 'blur(6px)' }}>
            <ShieldCheck size={20} color="#38bdf8" />
            <div>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>Verified Role Routing</strong>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Automatic dashboard assignment</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 20 }}>
        © {new Date().getFullYear()} OnboardHub Enterprise Portal. All rights reserved.
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [form, setForm] = useState({ email: location.state?.registeredEmail || '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    setApiError('');
    try {
      const user = await login({ email: form.email, password: form.password });
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'customer') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please check your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 72px)', background: 'var(--bg)' }}>
      {/* LEFT COLUMN VISUAL */}
      <AuthVisual />

      {/* RIGHT COLUMN FORM */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Sign In to Your Account
            </h2>
            <p style={{ color: 'var(--text-3)', fontSize: '0.92rem', margin: 0 }}>
              Enter your registered email address and password below to log in.
            </p>
          </div>

          {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
          <Alert type="danger" message={apiError} onClose={() => setApiError('')} />

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                Email Address <span style={{ color: 'var(--danger-red)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-4)" style={{ position: 'absolute', left: 14, top: 13 }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-input ${errors.email ? 'invalid' : ''}`}
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  style={{ paddingLeft: 42, height: 46, borderRadius: 12 }}
                />
              </div>
              {errors.email && <div className="form-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <div className="flex-between mb-1">
                <label className="form-label" htmlFor="password" style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0 }}>
                  Password <span style={{ color: 'var(--danger-red)' }}>*</span>
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-4)" style={{ position: 'absolute', left: 14, top: 13 }} />
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'invalid' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  style={{ paddingLeft: 42, paddingRight: 42, height: 46, borderRadius: 12 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 13,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-3)'
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="form-error">⚠ {errors.password}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={submitting}
              style={{ height: 48, borderRadius: 12, fontWeight: 800, fontSize: '0.95rem' }}
            >
              {submitting ? <Spinner size={20} /> : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 32, paddingTop: 24, textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-3)' }}>
            Don't have an account yet?
            <div className="flex justify-center gap-3 mt-3">
              <Link to="/register" style={{ color: 'var(--primary-indigo)', fontWeight: 800, textDecoration: 'none' }}>
                Register as Customer
              </Link>
              <span>•</span>
              <Link to="/register?role=provider" style={{ color: 'var(--secondary-emerald)', fontWeight: 800, textDecoration: 'none' }}>
                Register as Partner →
              </Link>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}