import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { Eye, EyeOff, Sparkles, UserPlus, ArrowRight, Target, TrendingUp, ShieldCheck } from 'lucide-react';

function AuthVisual() {
  return (
    <div className="auth-visual">
      <div className="v-logo">
        <span className="brand-mark" style={{ boxShadow: 'none' }}>
          <Sparkles size={20} />
        </span>
        OnboardHub
      </div>
      <div>
        <h2>Start earning as a verified professional</h2>
        <p>
          Create your account in minutes and begin your journey toward verified status.
        </p>
        <div className="v-proof">
          <div className="vp-row">
            <span className="vp-check">
              <Target size={18} />
            </span>
            <div>
              <strong>Choose your services</strong>
              <span>From plumbing & electrical to beauty, cleaning & repair</span>
            </div>
          </div>
          <div className="vp-row">
            <span className="vp-check">
              <TrendingUp size={18} />
            </span>
            <div>
              <strong>Build your digital profile</strong>
              <span>Showcase your skill tags, experience, and service locations</span>
            </div>
          </div>
          <div className="vp-row">
            <span className="vp-check">
              <ShieldCheck size={18} />
            </span>
            <div>
              <strong>Get admin verified</strong>
              <span>Our team verifies your document credentials swiftly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isProvider = searchParams.get('role') === 'provider';
  const role = isProvider ? 'provider' : 'customer';

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(form.password))
      e.password = 'Password must contain letters and numbers';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
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
      await register({ name: form.name.trim(), email: form.email, password: form.password, role });
      navigate('/login', {
        state: {
          registeredEmail: form.email,
          message: `🎉 ${isProvider ? 'Partner' : 'Customer'} account created successfully! Please sign in with your email and password.`
        }
      });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <AuthVisual />

      <div className="auth-form">
        <div className="auth-card">
          <span className="eyebrow">
            <UserPlus size={13} /> Get started free
          </span>
          <h2>Create your {isProvider ? 'partner' : 'customer'} account</h2>
          <p className="sub">Takes less than a minute. You can sign in with your registered credentials right after.</p>

          <Alert type="danger" message={apiError} onClose={() => setApiError('')} />

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full name <span className="req">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'invalid' : ''}`}
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address <span className="req">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'invalid' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <div className="form-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password <span className="req">*</span>
              </label>
              <div className="input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'invalid' : ''}`}
                  placeholder="Min 8 chars, letters & numbers"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <div className="form-error">⚠ {errors.password}</div>}
              <div className="form-hint">Must be at least 8 characters long with letters and numbers.</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm password <span className="req">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'invalid' : ''}`}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <div className="form-error">⚠ {errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              {submitting ? <Spinner size={20} /> : (
                <>
                  <span>Create provider account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="divider">Already registered?</div>

          <Link to="/login" className="btn btn-outline btn-block">
            Sign in to existing account
          </Link>
        </div>
      </div>
    </div>
  );
}