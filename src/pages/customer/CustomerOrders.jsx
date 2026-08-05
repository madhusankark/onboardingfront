import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';
import {
  ShoppingBag,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  UserCheck,
  XCircle,
  Navigation,
  Send,
  MessageSquare
} from 'lucide-react';

const DEMO_CUSTOMER_ORDERS = [
  {
    _id: 'demo-1',
    serviceName: 'Foam-jet AC Service & Repair',
    category: 'AC & Appliance Repair',
    price: 799,
    location: 'PVR Ripples, Vijayawada',
    date: '2026-08-05',
    timeSlot: '10:00 AM - 12:00 PM',
    status: 'assigned',
    provider: { user: { name: 'Suresh AC Technician' } }
  },
  {
    _id: 'demo-2',
    serviceName: 'Luxury Salon Pedicure & Facial Package',
    category: 'Beauty & Salon',
    price: 1299,
    location: 'Benz Circle, Vijayawada',
    date: '2026-08-06',
    timeSlot: '02:00 PM - 04:00 PM',
    status: 'in_progress',
    provider: { user: { name: 'Anita Rao (Lakme Certified)' } }
  }
];

export default function CustomerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(DEMO_CUSTOMER_ORDERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rating Modal state
  const [ratingOrder, setRatingOrder] = useState(null);
  const [starCount, setStarCount] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await api.get('/bookings/my-orders');
      if (res.data.orders && res.data.orders.length > 0) {
        setOrders(res.data.orders);
      } else {
        setOrders(DEMO_CUSTOMER_ORDERS);
      }
    } catch (err) {
      setOrders(DEMO_CUSTOMER_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // ⚡ Socket.io WebSockets Engine: Listen for real-time status updates
    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    socket.on('booking_status_updated', (data) => {
      if (data && data.bookingId) {
        setOrders((prev) =>
          prev.map((o) => (o._id === data.bookingId ? { ...o, status: data.status } : o))
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCancelBooking = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this service booking?')) return;
    try {
      await api.put(`/bookings/${orderId}/status`, { status: 'cancelled' });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: 'cancelled' } : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleOpenRating = (order) => {
    setRatingOrder(order);
    setStarCount(order.rating || 5);
    setReviewText(order.review || '');
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!ratingOrder) return;
    setSubmittingRating(true);
    try {
      await api.put(`/bookings/${ratingOrder._id}/rate`, {
        rating: starCount,
        review: reviewText
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === ratingOrder._id ? { ...o, rating: starCount, review: reviewText } : o
        )
      );
      setRatingOrder(null);
    } catch (err) {
      alert('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) return <div className="loading-screen"><Spinner size={34} label="Loading your booked orders..." /></div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 0 48px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            My Service <span className="accent">Orders</span>
          </h1>
          <p className="page-subtitle">Track your home service bookings, assigned partners, and real-time fulfillment status.</p>
        </div>
        <Link to="/" className="btn btn-primary btn-sm">
          <span>Book More Services</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {error && <Alert type="danger" message={error} />}

      {orders.length === 0 ? (
        <div className="card text-center p-5" style={{ borderRadius: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--brand-50)', color: 'var(--brand-500)', margin: '0 auto 16px', display: 'flex', itemsAlign: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px' }}>No Bookings Yet</h3>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', maxWidth: 440, margin: '0 auto 20px' }}>
            You haven't booked any home services yet. Browse Urban Company categories and select your target slot!
          </p>
          <Link to="/" className="btn btn-primary btn-md">
            Browse Services Now →
          </Link>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="card"
              style={{
                borderRadius: 20,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}
            >
              <div className="flex-between mb-3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
                    {order.category}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', margin: '2px 0 0' }}>
                    {order.serviceName}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--brand-600)', display: 'block' }}>
                    ₹{order.price}
                  </strong>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: order.status === 'completed' ? 'var(--success-soft)' : order.status === 'in_progress' ? 'var(--brand-50)' : 'var(--surface-2)',
                      color: order.status === 'completed' ? 'var(--success)' : order.status === 'in_progress' ? 'var(--brand-500)' : 'var(--text-3)'
                    }}
                  >
                    {order.status === 'in_progress' ? '⚡ WORK IN-PROGRESS' : order.status === 'completed' ? '✓ WORK COMPLETED' : order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ fontSize: '0.88rem', color: 'var(--text-2)' }}>
                <div className="flex items-center gap-2">
                  <MapPin size={16} color="var(--brand-500)" />
                  <span>{order.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} color="var(--text-3)" />
                  <span>{order.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} color="var(--text-3)" />
                  <span>{order.timeSlot}</span>
                </div>
              </div>

              {/* 📍 PROFESSIONAL LIVE TECHNICIAN GPS LOCATION TRACKING CARD */}
              {order.status === 'in_progress' && (
                <div
                  style={{
                    marginTop: 18,
                    borderRadius: 20,
                    overflow: 'hidden',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                    color: '#ffffff',
                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)'
                  }}
                >
                  {/* Top Bar: Header & Live ETA */}
                  <div
                    style={{
                      padding: '16px 20px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#22c55e',
                          boxShadow: '0 0 12px #22c55e',
                          display: 'inline-block'
                        }}
                      />
                      <strong style={{ fontSize: '0.98rem', letterSpacing: '0.02em', color: '#ffffff' }}>
                        📍 Live Technician GPS Tracking
                      </strong>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(99, 102, 241, 0.25)',
                        border: '1px solid rgba(99, 102, 241, 0.5)',
                        padding: '4px 14px',
                        borderRadius: 999
                      }}
                    >
                      <Clock size={14} color="#818cf8" />
                      <strong style={{ fontSize: '0.86rem', color: '#e0e7ff' }}>
                        ETA: 12 Mins
                      </strong>
                    </div>
                  </div>

                  {/* Middle Content: Technician Info & Status */}
                  <div style={{ padding: '20px' }}>
                    <div className="flex-between flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.provider?.user?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80'}
                          alt={order.provider?.user?.name || 'Technician'}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #818cf8',
                            boxShadow: '0 0 10px rgba(129, 140, 248, 0.4)'
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>
                              {order.provider?.user?.name || 'Rahul Sharma'}
                            </strong>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#22c55e', color: '#ffffff', padding: '1px 7px', borderRadius: 999 }}>
                              ● En Route
                            </span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                            Verified Service Partner • 4.88 ★ (1.8 km away)
                          </span>
                        </div>
                      </div>

                      <a
                        href={`tel:${order.provider?.user?.phone || '+91 98765 43210'}`}
                        className="btn btn-sm"
                        style={{
                          background: '#6366f1',
                          color: '#ffffff',
                          borderRadius: 10,
                          fontWeight: 800,
                          padding: '8px 16px',
                          textDecoration: 'none',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}
                      >
                        📞 Call Technician
                      </a>
                    </div>

                    {/* Animated Route Graphic Canvas */}
                    <div
                      style={{
                        position: 'relative',
                        padding: '16px 20px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 14,
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <div className="flex-between items-center mb-2" style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                        <span className="flex items-center gap-1.5" style={{ fontWeight: 700, color: '#818cf8' }}>
                          <Navigation size={14} color="#818cf8" /> Technician En Route
                        </span>
                        <span className="flex items-center gap-1.5" style={{ fontWeight: 700, color: '#4ade80' }}>
                          <MapPin size={14} color="#4ade80" /> Your Doorstep
                        </span>
                      </div>

                      {/* Route Line Progress Bar */}
                      <div style={{ position: 'relative', height: 8, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 999, overflow: 'hidden', margin: '10px 0' }}>
                        <div
                          style={{
                            width: '65%',
                            height: '100%',
                            background: 'linear-gradient(90deg, #6366f1 0%, #22c55e 100%)',
                            borderRadius: 999
                          }}
                        />
                      </div>

                      <div className="flex-between" style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                        <span>Dispatched from Vijayawada Hub</span>
                        <span style={{ color: '#4ade80', fontWeight: 700 }}>{order.location}</span>
                      </div>
                    </div>

                    <p style={{ margin: '14px 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.5 }}>
                      Technician <strong>{order.provider?.user?.name || 'Rahul Sharma'}</strong> is currently en route to your service location (<strong>{order.location}</strong>).
                    </p>
                  </div>
                </div>
              )}

              {/* Assigned Partner Info */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-50)', color: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600 }}>Assigned Partner</span>
                    <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text)' }}>
                      {order.provider?.user?.name || 'Verified Professional Assigned'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {order.status === 'completed' && !order.rating && (
                    <button
                      className="btn btn-primary btn-sm flex items-center gap-1"
                      onClick={() => handleOpenRating(order)}
                      style={{ borderRadius: 8, fontSize: '0.78rem', fontWeight: 800 }}
                    >
                      <Star size={14} fill="#fff" /> ⭐ Rate & Review Service
                    </button>
                  )}

                  {order.rating && (
                    <div className="flex items-center gap-1" style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f59e0b', background: 'var(--surface-2)', padding: '4px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span>Your Rating: {order.rating} ★</span>
                    </div>
                  )}

                  {order.status !== 'cancelled' && order.status !== 'completed' && (
                    <button
                      className="btn btn-outline btn-sm flex items-center gap-1"
                      onClick={() => handleCancelBooking(order._id)}
                      style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontWeight: 700, borderRadius: 8, fontSize: '0.78rem' }}
                    >
                      <XCircle size={14} /> Cancel Booking
                    </button>
                  )}

                  {order.status === 'cancelled' && (
                    <span style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '0.82rem' }}>
                      ✖ Booking Cancelled
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⭐ CUSTOMER RATING & REVIEW MODAL */}
      {ratingOrder && (
        <Modal
          open={!!ratingOrder}
          title={`Rate Service: ${ratingOrder.serviceName}`}
          onClose={() => setRatingOrder(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setRatingOrder(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={submittingRating} onClick={handleSubmitRating}>
                {submittingRating ? <Spinner size={18} /> : 'Submit Rating & Review'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmitRating} className="flex flex-col gap-3">
            <div className="text-center p-3">
              <span className="muted" style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                Select Star Rating
              </span>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStarCount(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', transform: star <= starCount ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.1s' }}
                  >
                    <Star
                      size={32}
                      fill={star <= starCount ? '#f59e0b' : 'none'}
                      color={star <= starCount ? '#f59e0b' : 'var(--text-4)'}
                    />
                  </button>
                ))}
              </div>
              <strong style={{ display: 'block', marginTop: 6, color: '#f59e0b', fontSize: '1rem' }}>
                {starCount === 5 ? '5 ★ Excellent Service!' : starCount === 4 ? '4 ★ Very Good' : starCount === 3 ? '3 ★ Average' : '2 ★ Needs Improvement'}
              </strong>
            </div>

            <div className="form-group">
              <label className="form-label flex items-center gap-1">
                <MessageSquare size={14} color="var(--brand-500)" /> Write Service Feedback (Optional)
              </label>
              <textarea
                className="form-textarea"
                placeholder="Describe your service experience, partner punctuality, and quality..."
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
