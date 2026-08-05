import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import {
  User,
  Mail,
  Shield,
  Camera,
  Save,
  CheckCircle2,
  Briefcase,
  ShoppingCart,
  LayoutDashboard,
  Tag,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function UserProfile() {
  const { user, refreshMe } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setAlert({ type: 'danger', message: 'Name cannot be empty.' });
      return;
    }

    setSaving(true);
    setAlert({ type: '', message: '' });

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      const token = localStorage.getItem('token');
      const { data } = await axios.put('/api/auth/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setAlert({ type: 'success', message: data.message || 'Profile updated successfully!' });
      await refreshMe();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="loading-screen"><Spinner size={34} label="Loading profile..." /></div>;

  const roleTitle = user.role === 'admin' ? 'Admin Portal Account' : user.role === 'provider' ? 'Service Provider Account' : 'Customer Account';

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div className="page-header flex-between flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <User size={24} color="var(--brand-500)" /> My Profile & Account Settings
          </h1>
          <p className="page-subtitle">
            Manage your personal profile details, change display name, and upload custom avatar photo from your device.
          </p>
        </div>
        <span
          style={{
            background: user.role === 'admin' ? 'var(--brand-50)' : user.role === 'provider' ? 'var(--brand-50)' : 'var(--surface-2)',
            color: 'var(--brand-500)',
            fontWeight: 800,
            fontSize: '0.85rem',
            padding: '6px 16px',
            borderRadius: 999,
            border: '1px solid var(--brand-200)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {user.role} Role
        </span>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Profile Avatar Card */}
        <div className="card text-center flex flex-col items-center p-4">
          <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 14 }}>
            <img
              src={preview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={user.name}
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--brand-500)',
                boxShadow: 'var(--shadow-md)'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload new photo from device"
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--brand-500)',
                color: '#ffffff',
                border: '2px solid var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <Camera size={18} />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => fileInputRef.current?.click()}
            style={{ fontWeight: 700, borderRadius: 10, marginBottom: 4 }}
          >
            📷 Upload Profile Picture from Device
          </button>
          <span className="muted" style={{ fontSize: '0.78rem' }}>Supports JPG, PNG, WEBP (Max 10MB)</span>
        </div>

        {/* Basic Account Info */}
        <div className="card">
          <h3 className="card-title mb-3">Account Details</h3>

          <div className="form-group mb-3">
            <label className="form-label flex items-center gap-1">
              <User size={15} color="var(--brand-500)" /> Full Display Name <span className="req">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              style={{ height: 46, borderRadius: 12, fontSize: '0.95rem' }}
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label flex items-center gap-1">
              <Mail size={15} color="var(--text-3)" /> Email Address (Read-only)
            </label>
            <input
              type="email"
              className="form-input"
              value={user.email}
              disabled
              style={{ height: 46, borderRadius: 12, background: 'var(--surface-2)', opacity: 0.8 }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block flex justify-center items-center gap-2 mt-3"
            disabled={saving}
            style={{ height: 48, borderRadius: 12, fontWeight: 800, fontSize: '0.96rem' }}
          >
            {saving ? <Spinner size={18} /> : (
              <>
                <Save size={18} /> Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Role-Specific Dashboard & Shortcut Cards */}
      <div className="card mt-4">
        <h3 className="card-title mb-3 flex items-center gap-2">
          <Shield size={18} color="var(--brand-500)" /> {roleTitle} Quick Links
        </h3>

        {user.role === 'admin' && (
          <div className="flex gap-3 flex-wrap">
            <Link to="/admin" className="btn btn-outline grow flex items-center justify-center gap-2" style={{ padding: '12px 18px', borderRadius: 12 }}>
              <LayoutDashboard size={16} /> Admin Dashboard
            </Link>
            <Link to="/admin/providers" className="btn btn-outline grow flex items-center justify-center gap-2" style={{ padding: '12px 18px', borderRadius: 12 }}>
              <User size={16} /> Manage Providers
            </Link>
            <Link to="/admin/services" className="btn btn-outline grow flex items-center justify-center gap-2" style={{ padding: '12px 18px', borderRadius: 12 }}>
              <Tag size={16} /> Services & Pricing
            </Link>
          </div>
        )}

        {user.role === 'customer' && (
          <div className="flex gap-3 flex-wrap">
            <Link to="/customer/orders" className="btn btn-outline grow flex items-center justify-center gap-2" style={{ padding: '12px 18px', borderRadius: 12 }}>
              <ShoppingCart size={16} /> My Booking Orders
            </Link>
            <Link to="/" className="btn btn-primary grow flex items-center justify-center gap-2" style={{ padding: '12px 18px', borderRadius: 12 }}>
              Explore Services <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {user.role === 'provider' && (
          <div className="flex gap-3 flex-wrap">
            <Link to="/profile" className="btn btn-primary grow flex items-center justify-center gap-2" style={{ padding: '12px 18px', borderRadius: 12 }}>
              <Briefcase size={16} /> Service Skills & Locations Profile
            </Link>
            <Link to="/documents" className="btn btn-outline grow flex items-center justify-center gap-2" style={{ padding: '12px 18px', borderRadius: 12 }}>
              Verification Documents
            </Link>
            <Link to="/dashboard" className="btn btn-outline grow flex items-center justify-center gap-2" style={{ padding: '12px 18px', borderRadius: 12 }}>
              <LayoutDashboard size={16} /> Provider Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
