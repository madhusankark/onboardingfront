import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, uploadDocuments, deleteDocument, submitApplication } from '../../api/provider';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Eye,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  X,
  FileCheck,
  FolderOpen,
  Send
} from 'lucide-react';

const DOC_TYPES = [
  { field: 'profile_photo', label: 'Profile Photo', max: 1, required: true, hint: 'Clear, front-facing photo (JPG/PNG, max 10MB)' },
  { field: 'government_id', label: 'Government ID', max: 3, required: true, hint: 'Aadhaar / PAN / Passport / Driving License (PDF or JPG)' },
  { field: 'address_proof', label: 'Address Proof', max: 3, required: true, hint: 'Electricity bill / Bank statement / Rental agreement (PDF or JPG)' },
  { field: 'certification', label: 'Certifications', max: 5, required: false, hint: 'Trade license / Professional skill certificates (optional)' },
  { field: 'background_check', label: 'Background Check', max: 3, required: false, hint: 'Police clearance certificate / References (optional)' },
  { field: 'other', label: 'Other Credentials', max: 5, required: false, hint: 'Any supporting documents for quick verification' }
];

const isImage = (doc) => doc.mimeType?.startsWith('image/');

export default function Documents() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [lightbox, setLightbox] = useState(null);
  const [locked, setLocked] = useState(false);

  const load = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data.provider);
      setDocs(data.documents);
      setLocked(data.provider.status === 'approved');
      setSelected({});
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load documents.' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFile = (field, files) => {
    setSelected((s) => ({ ...s, [field]: Array.from(files) }));
  };

  const handleUpload = async (field) => {
    const files = selected[field];
    if (!files?.length) return;

    const formData = new FormData();
    files.forEach((f) => formData.append(field, f));
    setUploading(true);
    setAlert({ type: '', message: '' });
    try {
      const { data } = await uploadDocuments(formData);
      setAlert({ type: 'success', message: data.message });
      await load();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.label}"? This action cannot be undone.`)) return;
    try {
      await deleteDocument(doc.id);
      setAlert({ type: 'success', message: 'Document removed.' });
      await load();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Delete failed.' });
    }
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setAlert({ type: '', message: '' });
    try {
      const { data } = await submitApplication();
      setAlert({ type: 'success', message: data.message || 'Application submitted successfully for Admin review!' });
      await load();
      setTimeout(() => {
        navigate('/status');
      }, 1500);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to submit application.' });
    } finally {
      setSubmitting(false);
    }
  };

  const byType = (field) => docs.filter((d) => d.documentType === field);

  if (!profile) return <div className="loading-screen"><Spinner size={34} label="Loading documents..." /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Verification</h1>
          <p className="page-subtitle">
            Upload profile photo & verification credentials. Government ID and Address Proof are required for approval.
          </p>
        </div>
        <StatusBadge status={profile.status} />
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      {locked && (
        <Alert type="info" message="Your provider account is approved. Document management is locked." />
      )}

      {profile.documentNotifications?.length > 0 && (
        <div
          className="card mb-4"
          style={{
            background: 'var(--surface-2)',
            border: '1.5px solid var(--danger)',
            borderRadius: 14,
            padding: 18
          }}
        >
          <div className="flex items-start gap-3">
            <ShieldAlert size={24} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, color: 'var(--danger)', fontSize: '0.98rem', fontWeight: 800 }}>
                🚨 Admin Action Required: Document Removed
              </h4>
              <div className="flex flex-col gap-1.5 mt-2">
                {profile.documentNotifications.map((notif, idx) => (
                  <p key={idx} style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.4 }}>
                    • Admin removed <strong>{notif.label || notif.documentType}</strong>. Remark: <em>"{notif.remark}"</em>
                  </p>
                ))}
              </div>
              <p className="muted mt-2" style={{ fontSize: '0.82rem', fontWeight: 600, margin: '8px 0 0' }}>
                Please upload a valid replacement document below so Admin can process your application.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-col gap-4">
        {DOC_TYPES.map((dt) => {
          const existing = byType(dt.field);
          return (
            <div className="card" key={dt.field}>
              <div className="flex-between">
                <div className="flex items-center gap-2">
                  <h3 className="card-title" style={{ margin: 0 }}>
                    {dt.label}
                  </h3>
                  {dt.required && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 999, background: 'var(--brand-50)', color: 'var(--brand-600)', fontWeight: 600 }}>
                      Required
                    </span>
                  )}
                </div>
                <span className="muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {existing.length}/{dt.max} files
                </span>
              </div>
              <p className="muted" style={{ fontSize: '0.86rem', marginTop: 2, marginBottom: 16 }}>{dt.hint}</p>

              {existing.length > 0 && (
                <div className="doc-grid mb-3">
                  {existing.map((doc) => (
                    <div className="doc-tile" key={doc.id}>
                      <div className="doc-preview" onClick={() => isImage(doc) && setLightbox(doc)}>
                        {isImage(doc) ? (
                          <img
                            src={doc.url}
                            alt={doc.label}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        ) : (

                          <div className="flex flex-col items-center justify-center p-3 text-center" style={{ color: 'var(--brand-600)' }}>
                            <FileText size={32} />
                            <span style={{ fontSize: '0.72rem', marginTop: 4, fontWeight: 600 }}>PDF Document</span>
                          </div>
                        )}
                      </div>
                      <div className="doc-meta">
                        <span className="doc-label" title={doc.filename}>{doc.label || doc.filename}</span>
                        <div className="mt-1"><StatusBadge status={doc.status} /></div>
                        {doc.adminRemark && <span className="text-xs danger mt-1">{doc.adminRemark}</span>}
                        <span className="muted mt-1" style={{ fontSize: '0.72rem' }}>
                          {(doc.size / 1024).toFixed(0)} KB
                        </span>
                        <div className="flex gap-2 mt-2">
                          <a className="btn btn-outline btn-sm grow" href={doc.url} target="_blank" rel="noreferrer">
                            <Eye size={13} /> View
                          </a>
                          {!locked && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc)} title="Delete document">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!locked && existing.length < dt.max && (
                <div className="flex gap-2" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept={dt.field === 'profile_photo' ? 'image/*' : 'image/*,.pdf'}
                    multiple={dt.max > 1}
                    onChange={(e) => handleFile(dt.field, e.target.files)}
                    className="form-input grow"
                    style={{ flex: 1, minWidth: 220, padding: '8px 12px' }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={!selected[dt.field]?.length || uploading}
                    onClick={() => handleUpload(dt.field)}
                  >
                    {uploading ? <Spinner size={16} /> : (
                      <>
                        <UploadCloud size={15} /> Upload File
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {docs.length === 0 && !locked && (
        <div className="card mt-4">
          <EmptyState icon={FolderOpen} title="No verification documents uploaded" subtitle="Upload your profile photo, Government ID, and Address Proof to complete your application." />
        </div>
      )}

      {/* Submit Application Action Banner */}
      {!locked && (
        <div
          className="card mt-4"
          style={{
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
            border: '1.5px solid var(--brand-500)',
            padding: 24,
            borderRadius: 16
          }}
        >
          <div className="flex-between flex-wrap gap-3">
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                Ready to Submit Your Application?
              </h3>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                After uploading your required profile photo, Government ID, and Address Proof, click below to submit your application for Admin approval.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-success"
              disabled={submitting}
              onClick={handleSubmitApplication}
              style={{ padding: '12px 24px', fontSize: '0.95rem', fontWeight: 800, borderRadius: 12 }}
            >
              {submitting ? (
                <Spinner size={18} />
              ) : (
                <>
                  <Send size={18} /> Submit Application
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="close" onClick={() => setLightbox(null)} aria-label="Close Lightbox">
            <X size={20} />
          </button>
          <img
            src={lightbox.url}
            alt={lightbox.label}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80';
            }}
          />

        </div>
      )}
    </div>
  );
}