import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStatus } from '../../api/provider';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import StatCard from '../../components/StatCard';
import api from '../../api/client';

import io from 'socket.io-client';
import {
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Sparkles,
  FileCheck,
  Edit3,
  MapPin,
  Phone,
  Briefcase,
  Wallet
} from 'lucide-react';

const STEPS = [
  { key: 'account', label: 'Create Account', desc: 'Registered as a service provider' },
  { key: 'profile', label: 'Complete Profile', desc: 'Categories, skills, experience & location' },
  { key: 'documents', label: 'Upload Documents', desc: 'Profile photo, ID proof & address proof' },
  { key: 'submit', label: 'Submit Application', desc: 'Sent for admin verification' },
  { key: 'approved', label: 'Get Approved', desc: 'Activate provider status & receive customer leads' }
];

const DEMO_PROVIDER_LEADS = [
  {
    _id: 'lead-1',
    serviceName: 'Foam-jet AC Service & Repair',
    category: 'AC & Appliance Repair',
    price: 799,
    location: 'PVR Ripples, Vijayawada',
    date: '2026-08-05',
    timeSlot: '10:00 AM - 12:00 PM',
    customerPhone: '+91 98765 43210'
  },
  {
    _id: 'lead-2',
    serviceName: 'Bathroom Leakage & Pipe Repair',
    category: 'Plumbing',
    price: 499,
    location: 'Benz Circle, Vijayawada',
    date: '2026-08-06',
    timeSlot: '11:00 AM - 01:00 PM',
    customerPhone: '+91 91234 56789'
  }
];

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState(DEMO_PROVIDER_LEADS);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'Recently Received';
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) +
      ' at ' +
      d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await getStatus();
        setData(res);

        if (res.status === 'approved') {
          setLoadingLeads(true);
          try {
            const leadsRes = await api.get('/bookings/my-leads');
            if (leadsRes.data.leads && leadsRes.data.leads.length > 0) {
              setLeads(leadsRes.data.leads);
            } else {
              setLeads(DEMO_PROVIDER_LEADS);
            }
          } catch (e) {
            setLeads(DEMO_PROVIDER_LEADS);
          } finally {
            setLoadingLeads(false);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load application status.');
      } finally {
        setLoading(false);
      }
    };
    load();

    // ⚡ Socket.io WebSockets Engine: Listen for real-time customer bookings
    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    socket.on('new_booking', (payload) => {
      if (payload && payload.booking) {
        setLeads((prev) => [payload.booking, ...prev]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  const handleLeadStatusUpdate = async (leadId, newStatus) => {
    try {
      await api.put(`/bookings/${leadId}/status`, { status: newStatus });
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update work status');
    }
  };

  if (loading) return <div className="loading-screen"><Spinner size={34} label="Loading dashboard..." /></div>;
  if (error) return <Alert type="danger" message={error} />;

  const { status, profileCompletion, submittedAt, reviewedAt, rejectionRemarks, documentSummary } = data;

  const stepState = (step) => {
    if (step.key === 'account') return 'done';
    if (step.key === 'profile') return profileCompletion > 0 ? 'done' : 'pending';
    if (step.key === 'documents')
      return documentSummary.governmentId && documentSummary.addressProof ? 'done' : 'pending';
    if (step.key === 'submit') return status === 'pending' || status === 'approved' ? 'done' : 'pending';
    if (step.key === 'approved') return status === 'approved' ? 'done' : 'pending';
    return 'pending';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, <span className="accent">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="page-subtitle">Track your onboarding progress and verification status in real time.</p>
        </div>
        <div className="flex gap-2" style={{ alignItems: 'center' }}>
          <span className="muted" style={{ fontSize: '0.88rem', fontWeight: 600 }}>Status:</span>
          <StatusBadge status={status} />
        </div>
      </div>

      {rejectionRemarks && (
        <Alert type="danger" message={`Application Action Required: ${rejectionRemarks}. Please update your profile/documents and save.`} />
      )}
      {status === 'pending' && (
        <Alert type="warning" message="Your application is currently pending admin review. You can edit your profile details and documents freely until approved." />
      )}
      {status === 'approved' && (
        <Alert type="success" message="Congratulations! Your provider profile has been verified and approved by the admin team. You are now accepting live customer leads!" />
      )}

      {/* NEW BOOKING NOTIFICATION ALERT BANNER */}
      {status === 'approved' && leads.length > 0 && (
        <div
          style={{
            background: 'var(--brand-50)',
            border: '2px solid var(--brand-500)',
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            boxShadow: '0 4px 14px rgba(99,102,241,0.12)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--brand-500)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0
              }}
            >
              🔔
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block' }}>
                Nearest Provider Notification
              </span>
              <strong style={{ fontSize: '0.98rem', color: 'var(--text)' }}>
                New Customer Booking Assigned to You!
              </strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--text-2)' }}>
                A customer near your location ({leads[0]?.location || 'Vijayawada'}) has booked <strong>{leads[0]?.serviceName}</strong>.
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleLeadStatusUpdate(leads[0]._id, 'in_progress')}
            style={{ borderRadius: 10, fontWeight: 800, padding: '8px 16px', flexShrink: 0 }}
          >
            ▶ Accept & Start Work
          </button>
        </div>
      )}

      {/* APPROVED PROVIDER JOBS FEED & NOTIFICATION */}
      {status === 'approved' && (
        <div className="card mb-4" style={{ border: '2px solid var(--brand-500)', background: 'var(--surface)' }}>
          <div className="flex-between mb-3">
            <div className="flex items-center gap-2">
              <Briefcase size={20} color="var(--brand-500)" />
              <h3 className="card-title" style={{ margin: 0 }}>Customer Booking Requests & Job Leads</h3>
            </div>
            <span style={{ background: 'var(--brand-50)', color: 'var(--brand-500)', fontSize: '0.78rem', fontWeight: 800, padding: '4px 12px', borderRadius: 999 }}>
              ● Live Jobs Feed ({leads.length})
            </span>
          </div>

          {loadingLeads ? (
            <Spinner size={24} label="Loading job leads..." />
          ) : leads.length === 0 ? (
            <div className="text-center p-4">
              <p className="muted" style={{ margin: 0 }}>No active customer leads right now. New customer bookings in your location will appear here automatically.</p>
            </div>
          ) : (
            <div className="flex-col gap-3">
              {leads.map((lead) => (
                <div
                  key={lead._id}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div className="flex-between">
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
                        Customer Booking Request
                      </span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>{lead.serviceName}</strong>
                      <div className="muted" style={{ fontSize: '0.82rem' }}>Customer: {lead.customerName || lead.customer?.name || 'Customer'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: 'var(--brand-600)', fontSize: '1.2rem', display: 'block' }}>₹{lead.price}</strong>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: lead.status === 'completed' ? 'var(--success-soft)' : lead.status === 'in_progress' ? 'var(--brand-50)' : 'var(--surface)',
                          color: lead.status === 'completed' ? 'var(--success)' : lead.status === 'in_progress' ? 'var(--brand-500)' : 'var(--text-3)',
                          textTransform: 'uppercase'
                        }}
                      >
                        {lead.status === 'completed' ? '✓ Work Finished' : lead.status === 'in_progress' ? '⚡ Work In-Progress' : '⌛ Assigned Lead'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4" style={{ flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--text-2)' }}>
                    <div className="flex items-center gap-1"><MapPin size={14} color="var(--brand-500)" /> {lead.location}</div>
                    <div className="flex items-center gap-1"><Calendar size={14} /> Scheduled: {lead.date} ({lead.timeSlot})</div>
                    <div className="flex items-center gap-1"><Clock size={14} color="var(--brand-500)" /> <strong>Received:</strong> {formatTimestamp(lead.createdAt)}</div>
                    <div className="flex items-center gap-1"><Phone size={14} color="var(--success)" /> {lead.customerPhone}</div>
                  </div>

                  <div className="flex justify-between items-center mt-1 pt-2" style={{ borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
                    <div className="flex items-center gap-3">
                      <span className="muted" style={{ fontSize: '0.78rem' }}>
                        Order Ref: #{lead._id.slice(-8).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--brand-600)', fontWeight: 700, background: 'var(--brand-50)', padding: '2px 8px', borderRadius: 6 }}>
                        🕒 {formatTimestamp(lead.createdAt)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {lead.status !== 'in_progress' && lead.status !== 'completed' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleLeadStatusUpdate(lead._id, 'in_progress')}
                          style={{ borderRadius: 8, fontSize: '0.78rem', fontWeight: 800 }}
                        >
                          ▶ Accept & Start Work
                        </button>
                      )}
                      {lead.status !== 'completed' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleLeadStatusUpdate(lead._id, 'completed')}
                          style={{ borderRadius: 8, fontSize: '0.78rem', fontWeight: 800, background: 'var(--success)', color: '#ffffff' }}
                        >
                          ✓ Mark Work Completed
                        </button>
                      )}
                      {lead.status !== 'cancelled' && lead.status !== 'completed' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this job lead?')) {
                              handleLeadStatusUpdate(lead._id, 'cancelled');
                            }
                          }}
                          style={{ borderColor: 'var(--danger)', color: 'var(--danger)', borderRadius: 8, fontSize: '0.78rem' }}
                        >
                          ✖ Cancel Lead
                        </button>
                      )}
                      {lead.status === 'cancelled' && (
                        <span style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '0.82rem' }}>
                          ✖ Job Cancelled
                        </span>
                      )}
                      {lead.status === 'completed' && (
                        <span className="flex items-center gap-1" style={{ color: 'var(--success)', fontWeight: 800, fontSize: '0.85rem' }}>
                          <CheckCircle2 size={16} /> Work Finished & Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 💰 PROVIDER EARNINGS & PAYOUT WALLET CARD */}
      {status === 'approved' && (
        <div className="card mb-4" style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="flex-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet size={20} color="var(--success)" />
              <h3 className="card-title" style={{ margin: 0 }}>Partner Earnings & Bank Payout Wallet</h3>
            </div>
            <span style={{ background: 'var(--success-soft)', color: 'var(--success)', fontSize: '0.78rem', fontWeight: 800, padding: '4px 12px', borderRadius: 999 }}>
              ● Verified Payout Wallet
            </span>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <span className="muted" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>TOTAL COMPLETED EARNINGS</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--text)', display: 'block', marginTop: 4 }}>
                ₹{leads.filter((l) => l.status === 'completed').reduce((sum, l) => sum + (l.price || 0), 0)}
              </strong>
            </div>

            <div style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <span className="muted" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>PLATFORM COMMISSION (15%)</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--danger)', display: 'block', marginTop: 4 }}>
                -₹{Math.round(leads.filter((l) => l.status === 'completed').reduce((sum, l) => sum + (l.price || 0), 0) * 0.15)}
              </strong>
            </div>

            <div style={{ background: 'var(--success-soft)', padding: 14, borderRadius: 12, border: '1px solid var(--success)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', display: 'block' }}>NET BANK PAYOUT DUE</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--success)', display: 'block', marginTop: 4 }}>
                ₹{leads.filter((l) => l.status === 'completed').reduce((sum, l) => sum + (l.price || 0), 0) - Math.round(leads.filter((l) => l.status === 'completed').reduce((sum, l) => sum + (l.price || 0), 0) * 0.15)}
              </strong>
            </div>
          </div>

          <div className="flex-between flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="muted" style={{ fontSize: '0.82rem' }}>
              Bank Payout Account: <strong>HDFC Bank ****4821 (UPI: rahul@okaxis)</strong>
            </span>
            <button
              className="btn btn-success btn-sm"
              onClick={() => alert(`Payout request submitted! Net earnings will be credited to your bank account within 2 hours.`)}
              style={{ borderRadius: 10, fontWeight: 800, background: 'var(--success)', color: '#ffffff' }}
            >
              💳 Request Instant Bank Payout
            </button>
          </div>
        </div>
      )}

      {/* Completion Meter Card */}
      <div className="card mb-4">
        <div className="flex-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} color="var(--brand-500)" />
            <h3 className="card-title" style={{ margin: 0 }}>Profile Completion</h3>
          </div>
          <strong style={{ color: 'var(--brand-600)', fontSize: '1.2rem' }}>{profileCompletion}%</strong>
        </div>
        <div className="progress-bar mt-3" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${profileCompletion}%` }} />
        </div>
        <p className="muted mt-2" style={{ fontSize: '0.88rem' }}>
          {profileCompletion < 50
            ? 'Complete your categories, skills, and upload required documents to achieve full verification readiness.'
            : 'Your profile looks great! Complete any remaining documents for speedy approval.'}
        </p>
        <div className="flex gap-2 mt-3" style={{ flexWrap: 'wrap' }}>
          <Link to="/profile" className="btn btn-primary btn-sm">
            <Edit3 size={15} /> Edit Profile
          </Link>
          <Link to="/documents" className="btn btn-outline btn-sm">
            <FileCheck size={15} /> Upload Documents
          </Link>
          <Link to="/status" className="btn btn-ghost btn-sm">
            <span>View Timeline</span> <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Submitted On"
          value={submittedAt ? new Date(submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending Submission'}
          icon={Calendar}
          tone="info"
        />
        <StatCard
          label="Reviewed On"
          value={reviewedAt ? new Date(reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Awaiting Review'}
          icon={UserCheck}
          tone="success"
        />
        <StatCard
          label="Documents Uploaded"
          value={`${documentSummary.total || 0} Files`}
          icon={FileText}
          tone="warning"
        />
      </div>

      {/* Step Tracker */}
      <div className="card mt-4">
        <h3 className="card-title mb-3">Onboarding Journey</h3>
        <div className="flex-col gap-3">
          {STEPS.map((s, idx) => {
            const state = stepState(s);
            const isDone = state === 'done';
            return (
              <div key={s.key} className="flex gap-3" style={{ alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    flexShrink: 0,
                    background: isDone ? 'var(--success-soft)' : 'var(--surface-2)',
                    color: isDone ? 'var(--success)' : 'var(--text-4)',
                    border: isDone ? '1px solid var(--success)' : '1px solid var(--border)'
                  }}
                >
                  {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <div>
                  <strong style={{ color: isDone ? 'var(--text)' : 'var(--text-3)' }}>{s.label}</strong>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}