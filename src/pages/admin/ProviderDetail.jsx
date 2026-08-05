import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProviderDetail, reviewApplication, reviewDocument, removeDocument } from '../../api/admin';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Check,
  X,
  ShieldCheck,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  Trash2
} from 'lucide-react';

const isImage = (mime) => mime?.startsWith('image/');

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('approved');
  const [remarks, setRemarks] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [docDeleteModal, setDocDeleteModal] = useState({ open: false, doc: null, remark: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data: res } = await getProviderDetail(id);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load provider details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const openReview = (action) => {
    setReviewAction(action);
    setRemarks('');
    setReviewOpen(true);
  };

  const confirmReview = async () => {
    if (reviewAction === 'rejected' && !remarks.trim()) {
      setError('Rejection remarks are required.');
      return;
    }
    setReviewing(true);
    setError('');
    try {
      const { data: res } = await reviewApplication(id, {
        status: reviewAction,
        remarks: remarks.trim()
      });
      setReviewOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Review action failed.');
    } finally {
      setReviewing(false);
    }
  };

  const handleDocReview = async (doc, status) => {
    try {
      await reviewDocument(id, doc.id, { status, remark: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Document review failed.');
    }
  };

  const handleRemoveDoc = async () => {
    if (!docDeleteModal.doc) return;
    try {
      await removeDocument(id, docDeleteModal.doc.id, {
        remark: docDeleteModal.remark.trim() || `Admin removed your uploaded document (${docDeleteModal.doc.label || docDeleteModal.doc.documentType}). Please re-upload a clear copy.`
      });
      setDocDeleteModal({ open: false, doc: null, remark: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Document removal failed.');
    }
  };

  if (loading) return <div className="loading-screen"><Spinner size={34} label="Loading provider detail..." /></div>;
  if (error && !data) return <Alert type="danger" message={error} />;
  if (!data) return null;

  const p = data.provider;
  const docs = data.documents;
  const categoryNames = (p.categories || []).map((c) => c.name);

  return (
    <div>
      <div className="page-header">
        <div className="flex gap-3" style={{ alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm flex items-center gap-1" onClick={() => navigate('/admin/providers')}>
            <ArrowLeft size={16} /> Back to Providers
          </button>
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>{p.user?.name}</h1>
            <p className="page-subtitle">{p.user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2" style={{ alignItems: 'center' }}>
          <StatusBadge status={p.status} />
          {p.status !== 'approved' && (
            <>
              <button className="btn btn-success btn-sm flex items-center gap-1" onClick={() => openReview('approved')}>
                <CheckCircle2 size={16} /> Approve Provider
              </button>
              <button className="btn btn-danger btn-sm flex items-center gap-1" onClick={() => openReview('rejected')}>
                <XCircle size={16} /> Reject Application
              </button>
            </>
          )}
        </div>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {p.rejectionRemarks && (
        <Alert type="danger" message={`Rejection Remarks: ${p.rejectionRemarks}`} />
      )}

      <div className="form-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 className="card-title mb-3">Profile Overview</h3>
          <div className="detail-list">
            <div className="detail-item">
              <div className="d-label flex items-center gap-1"><Phone size={14} /> Phone</div>
              <div>{p.phone || '—'}</div>
            </div>
            <div className="detail-item">
              <div className="d-label flex items-center gap-1"><MapPin size={14} /> Location</div>
              <div>{[p.address, p.city].filter(Boolean).join(', ') || '—'}</div>
            </div>
            <div className="detail-item">
              <div className="d-label flex items-center gap-1"><Briefcase size={14} /> Categories</div>
              <div>
                {categoryNames.length ? (
                  <div className="chips" style={{ marginTop: 0 }}>
                    {categoryNames.map((c) => (
                      <span key={c} className="chip">{c}</span>
                    ))}
                  </div>
                ) : (
                  '—'
                )}
              </div>
            </div>
            <div className="detail-item">
              <div className="d-label flex items-center gap-1"><Award size={14} /> Skills</div>
              <div>
                {p.skills?.length ? (
                  <div className="chips" style={{ marginTop: 0 }}>
                    {p.skills.map((s) => (
                      <span key={s} className="chip">{s}</span>
                    ))}
                  </div>
                ) : (
                  '—'
                )}
              </div>
            </div>
            <div className="detail-item">
              <div className="d-label">Experience</div>
              <div>{p.experienceYears ? `${p.experienceYears} Years` : '—'}</div>
            </div>
            <div className="detail-item">
              <div className="d-label">Experience Summary</div>
              <div>{p.experienceSummary || '—'}</div>
            </div>
            <div className="detail-item">
              <div className="d-label">Service Areas</div>
              <div>
                {p.serviceLocations?.length ? (
                  <div className="chips" style={{ marginTop: 0 }}>
                    {p.serviceLocations.map((l) => (
                      <span key={l} className="chip">{l}</span>
                    ))}
                  </div>
                ) : (
                  '—'
                )}
              </div>
            </div>
            <div className="detail-item">
              <div className="d-label">Completion</div>
              <div className="grow">
                <div className="progress-bar" style={{ maxWidth: 220, height: 6 }}>
                  <div className="progress-fill" style={{ width: `${p.profileCompletion}%` }} />
                </div>
                <span className="muted font-semibold" style={{ fontSize: '0.78rem' }}>{p.profileCompletion}%</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="d-label flex items-center gap-1"><Calendar size={14} /> Submitted</div>
              <div>{p.submittedAt ? new Date(p.submittedAt).toLocaleString('en-IN') : 'Not submitted'}</div>
            </div>
            <div className="detail-item">
              <div className="d-label">Reviewed</div>
              <div>{p.reviewedAt ? new Date(p.reviewedAt).toLocaleString('en-IN') : 'Awaiting review'}</div>
            </div>
            <div className="detail-item">
              <div className="d-label">Bio</div>
              <div>{p.bio || '—'}</div>
            </div>
          </div>
        </div>

        <div className="flex-col gap-4">
          <div className="card">
            <h3 className="card-title mb-3">Profile Photo</h3>
            {p.profilePhoto ? (
              <img
                src={p.profilePhoto}
                alt="Profile"
                style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 12, cursor: 'pointer', border: '1px solid var(--border)' }}
                onClick={() => setLightbox({ url: p.profilePhoto, label: 'Profile Photo' })}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                }}
              />
            ) : (

              <p className="muted">No profile photo uploaded.</p>
            )}
          </div>

          <div className="card">
            <h3 className="card-title mb-3">Admin Actions</h3>
            <div className="flex-col gap-2">
              <button
                className="btn btn-success btn-block flex justify-center items-center gap-2"
                disabled={p.status === 'approved'}
                onClick={() => openReview('approved')}
              >
                <CheckCircle2 size={18} /> Approve Application
              </button>
              <button
                className="btn btn-danger btn-block flex justify-center items-center gap-2"
                disabled={p.status === 'rejected'}
                onClick={() => openReview('rejected')}
              >
                <XCircle size={18} /> Reject Application
              </button>
            </div>
            <p className="form-hint mt-3">
              Rejection remarks are stored in audit history and emailed directly to the provider.
            </p>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="flex-between mb-3">
          <h3 className="card-title" style={{ margin: 0 }}>Uploaded Documents ({docs.length})</h3>
        </div>
        {docs.length === 0 ? (
          <p className="muted">No verification documents uploaded yet.</p>
        ) : (
          <div className="doc-grid">
            {docs.map((doc) => (
              <div className="doc-tile" key={doc.id}>
                <div className="doc-preview" onClick={() => isImage(doc.mimeType) && setLightbox({ url: doc.url, label: doc.label })}>
                  {isImage(doc.mimeType) ? (
                    <img src={doc.url} alt={doc.label} />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center" style={{ color: 'var(--brand-600)' }}>
                      <FileText size={36} />
                      <span style={{ fontSize: '0.72rem', marginTop: 4, fontWeight: 600 }}>PDF Document</span>
                    </div>
                  )}
                </div>
                <div className="doc-meta">
                  <span className="doc-label" title={doc.filename}>{doc.label || doc.filename}</span>
                  <div className="mt-1"><StatusBadge status={doc.status} /></div>
                  <span className="muted mt-1" style={{ fontSize: '0.72rem' }}>
                    {(doc.size / 1024).toFixed(0)} KB · {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  {doc.adminRemark && <span className="text-xs danger mt-1">{doc.adminRemark}</span>}
                  <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
                    <a className="btn btn-outline btn-sm grow flex items-center justify-center gap-1" href={doc.url} target="_blank" rel="noreferrer">
                      <Eye size={13} /> View
                    </a>
                    {doc.status !== 'verified' && (
                      <button className="btn btn-success btn-sm" onClick={() => handleDocReview(doc, 'verified')} title="Mark as Verified">
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-sm flex items-center gap-1"
                      onClick={() => setDocDeleteModal({ open: true, doc, remark: '' })}
                      title="Remove document and send re-upload notification to provider"
                      style={{ background: '#dc2626', color: '#ffffff', border: 'none' }}
                    >
                      <X size={14} /> Remove & Notify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={reviewOpen}
        title={reviewAction === 'approved' ? 'Approve Provider Application' : 'Reject Application'}
        onClose={() => setReviewOpen(false)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setReviewOpen(false)}>Cancel</button>
            <button
              className={`btn ${reviewAction === 'approved' ? 'btn-success' : 'btn-danger'}`}
              onClick={confirmReview}
              disabled={reviewing}
            >
              {reviewing ? <Spinner size={18} /> : reviewAction === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </>
        }
      >
        {reviewAction === 'approved' ? (
          <p>
            Approve <strong>{p.user?.name}</strong>'s application? This will activate their provider status,
            mark documents as verified, and issue an approval notification.
          </p>
        ) : (
          <>
            <p>
              Reject <strong>{p.user?.name}</strong>'s application? Please enter clear rejection remarks to inform the provider of needed corrections.
            </p>
            <div className="form-group mt-3">
              <label className="form-label">Rejection Remarks <span className="req">*</span></label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Government ID image is blurry or expired. Please upload a clear copy of Aadhaar/PAN card."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Delete Document Confirmation Modal */}
      <Modal
        open={docDeleteModal.open}
        title="Remove Document & Notify Provider"
        onClose={() => setDocDeleteModal({ open: false, doc: null, remark: '' })}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDocDeleteModal({ open: false, doc: null, remark: '' })}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleRemoveDoc}>
              Confirm Removal & Send Re-Upload Alert
            </button>
          </>
        }
      >
        <p style={{ marginTop: 0 }}>
          Remove uploaded document <strong>"{docDeleteModal.doc?.label || docDeleteModal.doc?.filename}"</strong>?
        </p>
        <p className="muted" style={{ fontSize: '0.88rem' }}>
          This will permanently delete the uploaded document file and trigger an immediate <strong>re-upload alert notification</strong> on <strong>{p.user?.name}</strong>'s provider portal.
        </p>
        <div className="form-group mt-3">
          <label className="form-label">Re-Upload Instructions / Remark for Provider</label>
          <input
            className="form-input"
            placeholder="e.g. Image was blurry or unreadable. Please re-upload a clear copy."
            value={docDeleteModal.remark}
            onChange={(e) => setDocDeleteModal((s) => ({ ...s, remark: e.target.value }))}
          />
        </div>
      </Modal>

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
              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
            }}
          />

        </div>
      )}
    </div>
  );
}