import { useEffect, useState } from 'react';
import { getAdminBookings, updateAdminBookingStatus } from '../../api/admin';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import {
  Activity,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Search,
  Briefcase,
  RefreshCw,
  Sparkles,
  Calendar
} from 'lucide-react';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateAdminBookingStatus(bookingId, { status: newStatus });
      setAlert({ type: 'success', message: `Updated booking status to "${newStatus}"!` });
      await load();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update booking status' });
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      (b.serviceName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.location || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const inProgressCount = bookings.filter((b) => b.status === 'in_progress').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  if (loading) return <div className="loading-screen"><Spinner size={34} label="Loading live booking work tracking..." /></div>;

  return (
    <div>
      <div className="page-header flex-between flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Activity size={24} color="var(--brand-500)" /> Work Tracking & Order Fulfillment
          </h1>
          <p className="page-subtitle">
            Monitor real-time customer bookings, assigned service providers, and work progress across your platform.
          </p>
        </div>
        <button className="btn btn-outline flex items-center gap-2" onClick={load}>
          <RefreshCw size={16} /> Refresh Feed
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Metrics Banner */}
      <div className="stats-grid mb-4">
        <div className="card text-center p-3">
          <span className="muted" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Total Bookings</span>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand-500)' }}>{bookings.length}</h2>
        </div>
        <div className="card text-center p-3">
          <span className="muted" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Work In-Progress</span>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#6366f1' }}>{inProgressCount}</h2>
        </div>
        <div className="card text-center p-3">
          <span className="muted" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Work Finished</span>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.6rem', fontWeight: 900, color: 'var(--success)' }}>{completedCount}</h2>
        </div>
        <div className="card text-center p-3">
          <span className="muted" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Total GMV Revenue</span>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }}>₹{totalRevenue}</h2>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="card mb-4 flex-between flex-wrap gap-3" style={{ padding: '16px 20px' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} color="var(--text-3)" style={{ position: 'absolute', left: 14, top: 13 }} />
          <input
            type="text"
            placeholder="Search customer name, service or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 40, height: 42, borderRadius: 10 }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-3)' }}>Filter Status:</span>
          {['All', 'assigned', 'in_progress', 'completed', 'pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 999, padding: '4px 14px', fontSize: '0.78rem', textTransform: 'capitalize' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="card text-center p-5">
          <p className="muted">No customer bookings match your filter criteria.</p>
        </div>
      ) : (
        <div className="flex-col gap-3">
          {filtered.map((b) => (
            <div
              key={b._id}
              className="card"
              style={{
                borderRadius: 16,
                padding: 20,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div className="flex-between flex-wrap gap-2">
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {b.category || 'Home Service'}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', margin: '2px 0 0' }}>
                    {b.serviceName}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--brand-600)', display: 'block' }}>₹{b.price}</strong>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: 999,
                      background:
                        b.status === 'completed'
                          ? 'var(--success-soft)'
                          : b.status === 'in_progress'
                          ? 'var(--brand-50)'
                          : 'var(--surface-2)',
                      color:
                        b.status === 'completed'
                          ? 'var(--success)'
                          : b.status === 'in_progress'
                          ? 'var(--brand-500)'
                          : 'var(--text-3)',
                      textTransform: 'uppercase'
                    }}
                  >
                    ● {b.status?.replace('_', ' ') || 'pending'}
                  </span>
                </div>
              </div>

              {/* Order Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 14,
                  background: 'var(--surface-2)',
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid var(--border)'
                }}
              >
                {/* Customer */}
                <div>
                  <span className="muted" style={{ fontSize: '0.74rem', fontWeight: 700, display: 'block' }}>CUSTOMER DETAILS</span>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={15} color="var(--brand-500)" />
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{b.customerName || b.customer?.name || 'Urban Customer'}</strong>
                  </div>
                  <div className="flex items-center gap-2 mt-1 muted" style={{ fontSize: '0.8rem' }}>
                    <Phone size={13} color="var(--success)" /> {b.customerPhone || '+91 98765 43210'}
                  </div>
                </div>

                {/* Assigned Provider */}
                <div>
                  <span className="muted" style={{ fontSize: '0.74rem', fontWeight: 700, display: 'block' }}>ASSIGNED SERVICE PARTNER</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase size={15} color="var(--brand-500)" />
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>
                      {b.provider?.user?.name || b.providerName || 'Pending Provider Assignment'}
                    </strong>
                  </div>
                  {b.provider?.user?.phone && (
                    <div className="flex items-center gap-2 mt-1 muted" style={{ fontSize: '0.8rem' }}>
                      <Phone size={13} /> {b.provider.user.phone}
                    </div>
                  )}
                </div>

                {/* Location & Slot */}
                <div>
                  <span className="muted" style={{ fontSize: '0.74rem', fontWeight: 700, display: 'block' }}>LOCATION & TIME SLOT</span>
                  <div className="flex items-center gap-1 mt-1 muted" style={{ fontSize: '0.82rem' }}>
                    <MapPin size={14} color="var(--brand-500)" /> {b.location}
                  </div>
                  <div className="flex items-center gap-1 mt-1 muted" style={{ fontSize: '0.82rem' }}>
                    <Calendar size={14} /> {b.date} ({b.timeSlot})
                  </div>
                </div>
              </div>

              {/* Admin Action Controls */}
              <div className="flex-between flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="muted" style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>
                  Booking ID: #{b._id}
                </span>

                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-3)' }}>Admin Status Override:</span>
                  <button
                    className={`btn btn-sm ${b.status === 'in_progress' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleStatusChange(b._id, 'in_progress')}
                    style={{ fontSize: '0.76rem', borderRadius: 8 }}
                  >
                    ▶ Mark In-Progress
                  </button>
                  <button
                    className={`btn btn-sm ${b.status === 'completed' ? 'btn-success' : 'btn-outline'}`}
                    onClick={() => handleStatusChange(b._id, 'completed')}
                    style={{ fontSize: '0.76rem', borderRadius: 8, background: b.status === 'completed' ? 'var(--success)' : 'transparent', color: b.status === 'completed' ? '#fff' : 'inherit' }}
                  >
                    ✓ Mark Completed
                  </button>
                  <button
                    className={`btn btn-sm ${b.status === 'cancelled' ? 'btn-danger' : 'btn-outline'}`}
                    onClick={() => {
                      if (window.confirm('Cancel this booking?')) {
                        handleStatusChange(b._id, 'cancelled');
                      }
                    }}
                    style={{ fontSize: '0.76rem', borderRadius: 8, borderColor: 'var(--danger)', color: b.status === 'cancelled' ? '#fff' : 'var(--danger)', background: b.status === 'cancelled' ? 'var(--danger)' : 'transparent' }}
                  >
                    ✖ Cancel Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
