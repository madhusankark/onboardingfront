import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStatus } from '../../api/provider';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Calendar,
  RefreshCw,
  ArrowRight,
  Edit3,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

export default function ApplicationStatus() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await getStatus();
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load application status.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-screen"><Spinner size={34} label="Loading status..." /></div>;
  if (error) return <Alert type="danger" message={error} />;

  const { status } = data;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Application Timeline</h1>
          <p className="page-subtitle">Detailed verification breakdown and admin review logs.</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="card mb-4">
        {status === 'approved' && (
          <Alert type="success" message="Congratulations! Your application has been approved. You can now receive customer bookings on OnboardHub." />
        )}
        {status === 'rejected' && (
          <>
            <Alert type="danger" message="Your application was rejected by the admin team." />
            <div className="detail-list mt-3 p-3 bg-surface-2 rounded-xl" style={{ border: '1px solid var(--border)' }}>
              <div className="detail-item">
                <div className="d-label font-semibold text-danger flex items-center gap-1">
                  <XCircle size={15} /> Rejection Remarks:
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {data.rejectionRemarks || 'No specific remarks provided.'}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link to="/profile" className="btn btn-primary btn-sm">
                <Edit3 size={15} /> Update Profile & Resubmit
              </Link>
            </div>
            <p className="form-hint mt-3">
              Update your profile details or uploaded documents, then click "Submit Application" again. Your rejection status will reset to Pending for re-review.
            </p>
          </>
        )}
        {status === 'pending' && (
          <Alert type="warning" message="Your application is pending admin review. Turnaround time is typically within 24 hours." />
        )}
        {status === 'in_review' && (
          <Alert type="info" message="An admin manager is currently inspecting your profile and documents." />
        )}
      </div>

      <div className="card">
        <h3 className="card-title mb-3">Verification Details</h3>
        <div className="detail-list">
          <div className="detail-item">
            <div className="d-label">Application Status</div>
            <div><StatusBadge status={status} /></div>
          </div>
          <div className="detail-item">
            <div className="d-label">Submission Date</div>
            <div>{data.submittedAt ? new Date(data.submittedAt).toLocaleString('en-IN') : 'Not submitted yet'}</div>
          </div>
          <div className="detail-item">
            <div className="d-label">Last Reviewed</div>
            <div>{data.reviewedAt ? new Date(data.reviewedAt).toLocaleString('en-IN') : 'Awaiting Review'}</div>
          </div>
          <div className="detail-item">
            <div className="d-label">Profile Completion</div>
            <div style={{ fontWeight: 700, color: 'var(--brand-600)' }}>{data.profileCompletion}%</div>
          </div>
        </div>
        <hr className="divider my-4" />
        <h3 className="card-title mb-3">Document Verification Checklist</h3>
        <div className="flex-col gap-2">
          {[
            { label: 'Government ID (Aadhaar/PAN)', ok: data.documentSummary.governmentId },
            { label: 'Address Proof (Utility/Bank)', ok: data.documentSummary.addressProof },
            { label: 'Trade Certification', ok: data.documentSummary.certification, optional: true },
            { label: 'Background Check', ok: data.documentSummary.backgroundCheck, optional: true }
          ].map((item) => (
            <div key={item.label} className="flex-between p-2 rounded-lg bg-surface-2">
              <span className="flex items-center gap-2" style={{ fontSize: '0.9rem' }}>
                <FileCheck size={16} color="var(--brand-500)" />
                {item.label} {item.optional && <span className="muted text-xs">(optional)</span>}
              </span>
              {item.ok ? (
                <span className="flex items-center gap-1 font-semibold text-xs text-success" style={{ color: 'var(--success)' }}>
                  <CheckCircle2 size={14} /> Uploaded
                </span>
              ) : (
                <span className="muted text-xs">— Missing</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}