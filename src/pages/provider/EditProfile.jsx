import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, updateProfile, submitApplication } from '../../api/provider';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import {
  Plus,
  X,
  Save,
  Send,
  ShieldCheck,
  MapPin,
  Wrench,
  Briefcase,
  User,
  Sparkles,
  CheckCircle2,
  FileCheck,
  ChevronDown,
  Search,
  Navigation,
  Loader2
} from 'lucide-react';

import LocationModal from '../../components/LocationModal';

const SUGGESTED_SKILLS = [
  'Problem solving', 'Customer service', 'Time management', 'Safety compliance',
  'Tool handling', 'Team management', 'Communication', 'Cleanliness', 'Punctuality', 'Tech savvy'
];

const ChipInput = ({ value = [], onChange, placeholder, suggestions }) => {
  const [text, setText] = useState('');

  const add = (item) => {
    const v = String(item || text).trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setText('');
  };

  const remove = (item) => onChange(value.filter((x) => x !== item));

  return (
    <div>
      <div className="chip-input-row">
        <input
          className="form-input"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={() => add()}>
          <Plus size={15} /> Add
        </button>
      </div>
      {suggestions?.length > 0 && (
        <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
          {suggestions
            .filter((s) => !value.includes(s))
            .map((s) => (
              <button key={s} type="button" className="btn btn-outline btn-sm" onClick={() => add(s)}>
                + {s}
              </button>
            ))}
        </div>
      )}
      {value.length > 0 && (
        <div className="chips mt-3">
          {value.map((item) => (
            <span key={item} className="chip">
              {item}
              <button type="button" onClick={() => remove(item)} aria-label={`Remove ${item}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const LocationSelectorInput = ({ value = [], onChange, disabled }) => {
  const [showModal, setShowModal] = useState(false);

  const addLocation = (locName) => {
    const target = String(locName || '').trim();
    if (target && !value.includes(target)) {
      onChange([...value, target]);
    }
  };

  const removeLocation = (locName) => {
    onChange(value.filter((x) => x !== locName));
  };

  return (
    <div>
      {/* Trigger button styled exactly like Navbar location picker */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setShowModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '12px 16px',
          borderRadius: 12,
          border: '1.5px solid var(--border-strong)',
          background: 'var(--surface-2)',
          color: 'var(--text)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MapPin size={18} color="var(--brand-500)" />
          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
            {value.length > 0
              ? `${value.length} Location(s) Selected — ${value[value.length - 1]}`
              : 'Select your service location...'}
          </span>
        </div>
        <ChevronDown size={18} color="var(--text-3)" />
      </button>

      {/* Shared LocationModal matching Home Page Navbar location selector */}
      <LocationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelectLocation={(loc) => addLocation(loc)}
        currentLocation={value}
      />

      {/* Selected Location Chips */}
      {value.length > 0 && (
        <div className="chips mt-3">
          {value.map((item) => (
            <span
              key={item}
              className="chip"
              style={{
                background: 'var(--brand-50)',
                color: 'var(--brand-700)',
                border: '1px solid var(--brand-200)',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <MapPin size={13} color="var(--brand-500)" />
              {item}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeLocation(item)}
                  aria-label={`Remove ${item}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'inherit' }}
                >
                  <X size={13} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default function EditProfile() {
  const { user, refreshMe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [provider, setProvider] = useState(null);
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProfile();
        const p = data.provider;
        setProvider(p);
        setDocuments(data.documents);
        setCategories(data.categories);
        setForm({
          phone: p.phone || '',
          bio: p.bio || '',
          address: p.address || '',
          city: p.city || '',
          categories: (p.categories || []).map((c) => c._id || c),
          skills: p.skills || [],
          experienceYears: p.experienceYears || '',
          experienceSummary: p.experienceSummary || '',
          serviceLocations: p.serviceLocations || []
        });
      } catch (err) {
        setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load profile.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const locked = provider?.status === 'approved';

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.categories?.length) e.categories = 'Select at least one service category';
    if (!form.skills?.length) e.skills = 'Add at least one skill';
    if (!form.serviceLocations?.length) e.serviceLocations = 'Add at least one service location';
    if (form.experienceYears !== '' && (Number(form.experienceYears) < 0 || Number(form.experienceYears) > 60))
      e.experienceYears = 'Experience must be between 0 and 60 years';
    return e;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    setAlert({ type: '', message: '' });
    try {
      const { data } = await updateProfile({
        ...form,
        experienceYears: form.experienceYears === '' ? 0 : Number(form.experienceYears)
      });
      setAlert({ type: 'success', message: `Profile saved successfully. Completion: ${data.profileCompletion}%` });
      const reload = await getProfile();
      setProvider(reload.data.provider);
      refreshMe();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setAlert({ type: '', message: '' });
    try {
      const { data } = await submitApplication();
      setAlert({ type: 'success', message: data.message });
      setProvider((p) => ({ ...p, status: data.provider.status, submittedAt: data.provider.submittedAt }));
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Submission failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><Spinner size={34} label="Loading profile..." /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Provider Profile</h1>
          <p className="page-subtitle">
            {locked
              ? 'Your application is approved and profile editing is locked.'
              : 'Complete your onboarding details. Fields marked * are required for verification.'}
          </p>
        </div>
        <div className="flex gap-2" style={{ alignItems: 'center' }}>
          <StatusBadge status={provider?.status} />
          <strong style={{ color: 'var(--brand-600)', fontSize: '1.1rem' }}>{provider?.profileCompletion}% Complete</strong>
        </div>
      </div>

      <div className="progress-bar mb-4" style={{ maxWidth: 480, height: 8 }}>
        <div className="progress-fill" style={{ width: `${provider?.profileCompletion || 0}%` }} />
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <form onSubmit={handleSave} noValidate>
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <User size={18} color="var(--brand-500)" />
            <h3 className="card-title" style={{ margin: 0 }}>Basic Information</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={user?.name || ''} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email || ''} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Phone <span className="req">*</span></label>
              <input
                className="form-input"
                placeholder="+91 98765 43210"
                value={form.phone || ''}
                disabled={locked}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">City <span className="req">*</span></label>
              <input
                className="form-input"
                placeholder="e.g. Mumbai"
                value={form.city || ''}
                disabled={locked}
                onChange={(e) => set('city', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              className="form-input"
              placeholder="Street, area, landmark"
              value={form.address || ''}
              disabled={locked}
              onChange={(e) => set('address', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Short Bio <span className="req">*</span></label>
            <textarea
              className="form-textarea"
              placeholder="Tell customers and verification admins about your expertise and service background..."
              maxLength={500}
              value={form.bio || ''}
              disabled={locked}
              onChange={(e) => set('bio', e.target.value)}
            />
            <div className="form-hint">{form.bio?.length || 0}/500</div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={18} color="var(--brand-500)" />
            <h3 className="card-title" style={{ margin: 0 }}>Service Categories <span className="req">*</span></h3>
          </div>
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
            Select all categories in which you provide active services.
          </p>
          <div className="checkbox-grid">
            {categories.map((cat) => {
              const checked = (form.categories || []).includes(cat._id);
              return (
                <label
                  key={cat._id}
                  className={`checkbox-card ${checked ? 'checked' : ''}`}
                  style={locked ? { pointerEvents: 'none', opacity: 0.7 } : {}}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={locked}
                    onChange={() =>
                      set(
                        'categories',
                        checked
                          ? form.categories.filter((id) => id !== cat._id)
                          : [...form.categories, cat._id]
                      )
                    }
                  />
                  <span>{cat.icon} {cat.name}</span>
                </label>
              );
            })}
          </div>
          {errors.categories && <div className="form-error mt-2">{errors.categories}</div>}
        </div>

        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={18} color="var(--brand-500)" />
            <h3 className="card-title" style={{ margin: 0 }}>Skills & Experience <span className="req">*</span></h3>
          </div>
          <div className="form-group">
            <label className="form-label">Skills & Certifications</label>
            <ChipInput
              value={form.skills || []}
              onChange={(v) => set('skills', v)}
              placeholder="Type a skill and press Enter"
              suggestions={SUGGESTED_SKILLS}
            />
            {errors.skills && <div className="form-error mt-2">{errors.skills}</div>}
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                min="0"
                max="60"
                className={`form-input ${errors.experienceYears ? 'invalid' : ''}`}
                placeholder="e.g. 5"
                value={form.experienceYears}
                disabled={locked}
                onChange={(e) => set('experienceYears', e.target.value)}
              />
              {errors.experienceYears && <div className="form-error">{errors.experienceYears}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Experience Summary</label>
              <input
                className="form-input"
                placeholder="e.g. 5+ years servicing residential & commercial projects"
                value={form.experienceSummary || ''}
                disabled={locked}
                onChange={(e) => set('experienceSummary', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} color="var(--brand-500)" />
            <h3 className="card-title" style={{ margin: 0 }}>Service Locations <span className="req">*</span></h3>
          </div>
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
            Areas and neighborhoods where you are available to work.
          </p>
          <LocationSelectorInput
            value={form.serviceLocations || []}
            onChange={(v) => set('serviceLocations', v)}
            disabled={locked}
          />
          {errors.serviceLocations && <div className="form-error mt-2">{errors.serviceLocations}</div>}
        </div>

        {!locked && (
          <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Spinner size={18} /> : (
                <>
                  <Save size={16} /> Save Profile Changes
                </>
              )}
            </button>
            <Link to="/documents" className="btn btn-outline" style={{ fontWeight: 700 }}>
              <FileCheck size={16} /> Proceed to Upload Documents →
            </Link>
          </div>
        )}
      </form>

      {documents.length > 0 && (
        <p className="muted mt-4 flex items-center gap-1" style={{ fontSize: '0.88rem' }}>
          <FileCheck size={16} color="var(--success)" />
          You have {documents.length} document(s) uploaded. Manage them on the{' '}
          <a href="/documents" style={{ fontWeight: 600 }}>Documents Page</a>.
        </p>
      )}
    </div>
  );
}