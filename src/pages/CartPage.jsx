import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight,
  CheckCircle2, Clock, Star, ShieldCheck, Tag, X,
  Package, ChevronRight
} from 'lucide-react';
import axios from '../api/client';
import { useAuth } from '../context/AuthContext';

/* ── helpers ─────────────────────────────────────────────────── */
const getCart = () => {
  try { return JSON.parse(localStorage.getItem('cart_items') || '[]'); }
  catch { return []; }
};
const saveCart = (items) => {
  localStorage.setItem('cart_items', JSON.stringify(items));
  window.dispatchEvent(new Event('cart_updated'));
};

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState(getCart);
  const [checkoutState, setCheckoutState] = useState('idle'); // idle | loading | success | error
  const [orderId, setOrderId] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');

  /* ── sync from localStorage ──────────────────────────────── */
  useEffect(() => {
    const sync = () => setItems(getCart());
    window.addEventListener('cart_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('cart_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  /* ── item actions ────────────────────────────────────────── */
  const remove = useCallback((id) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next); saveCart(next);
  }, [items]);

  const changeQty = useCallback((id, delta) => {
    const next = items
      .map((i) => i.id === id ? { ...i, qty: Math.max(1, (i.qty || 1) + delta) } : i);
    setItems(next); saveCart(next);
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]); saveCart([]);
  }, []);

  /* ── totals ──────────────────────────────────────────────── */
  const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  const platformFee = items.length > 0 ? 29 : 0;
  const total = subtotal + platformFee;

  const [paymentMethod, setPaymentMethod] = useState('upi');

  /* ── checkout ────────────────────────────────────────────── */
  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!user) { navigate('/login'); return; }
    try {
      setCheckoutState('loading');
      setCheckoutError('');

      // Create one booking per cart item
      const promises = items.map((item) =>
        axios.post('/bookings', {
          serviceName: item.name || item.title,
          category: item.category || item.dbCategory || 'General Home Service',
          price: (item.price || 0) * (item.qty || 1),
          location: localStorage.getItem('user_location') || 'Vijayawada',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          timeSlot: '10:00 AM - 12:00 PM',
          customerName: user.name,
          customerPhone: user.phone || '+91 98765 43210',
          paymentMethod: paymentMethod
        })
      );
      const results = await Promise.all(promises);
      const firstBookingId = results[0]?.data?.booking?._id || 'ORD' + Date.now();
      setOrderId(firstBookingId);
      setCheckoutState('success');
      // Clear cart after successful checkout
      setTimeout(() => { clearCart(); }, 800);
    } catch (err) {
      setCheckoutError(err?.response?.data?.message || 'Checkout failed. Please try again.');
      setCheckoutState('error');
    }
  };

  /* ── success screen ──────────────────────────────────────── */
  if (checkoutState === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{ textAlign: 'center', maxWidth: 460, width: '100%', background: 'var(--surface)', borderRadius: 28, border: '1px solid var(--border)', padding: '48px 36px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.2)' }}
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 280 }}
            style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 12px rgba(34,197,94,0.12)' }}
          >
            <CheckCircle2 size={42} color="#fff" />
          </motion.div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>
            Order Confirmed! 🎉
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.6 }}>
            Your service has been booked successfully. A background-verified professional will be assigned to you shortly.
          </p>

          <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '14px 20px', marginBottom: 28, border: '1px solid var(--border)', textAlign: 'left' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Order Reference
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>
              #{typeof orderId === 'string' ? orderId.slice(-10).toUpperCase() : orderId}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ borderRadius: 12, fontWeight: 800, height: 46 }}
              onClick={() => navigate('/customer/orders')}
            >
              <Package size={18} /> View My Orders
            </button>
            <button
              className="btn btn-outline"
              style={{ borderRadius: 12, fontWeight: 700, height: 46 }}
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── empty cart ──────────────────────────────────────────── */
  if (items.length === 0 && checkoutState !== 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', maxWidth: 400 }}
        >
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--surface-2)', border: '2px dashed var(--border)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={40} color="var(--text-4)" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-3)', marginBottom: 24, fontSize: '0.9rem' }}>
            Browse services and add them to your cart to book professionals.
          </p>
          <button className="btn btn-primary" style={{ borderRadius: 12, fontWeight: 800, padding: '12px 28px' }} onClick={() => navigate('/')}>
            Browse Services
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── main cart ───────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '18px 24px', position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShoppingCart size={22} color="var(--brand-500)" />
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)', margin: 0 }}>My Cart</h1>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0 }}>{items.length} service{items.length !== 1 ? 's' : ''} added</p>
            </div>
          </div>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
            onClick={clearCart}
          >
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '28px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => (
              <motion.div
                key={item.id || item.title || item.name || idx}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ delay: idx * 0.04 }}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start' }}
              >
                {/* Thumbnail */}
                <img
                  src={item.img || `https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80`}
                  alt={item.name || item.title}
                  style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                />

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      {item.category && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {item.category}
                        </span>
                      )}
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', margin: '2px 0 4px', lineHeight: 1.25 }}>
                        {item.name || item.title}
                      </h3>
                      {item.time && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', color: 'var(--text-3)' }}>
                          <Clock size={11} /> {item.time}
                        </span>
                      )}
                      {item.rating && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', color: '#f59e0b', marginLeft: 10, fontWeight: 700 }}>
                          <Star size={11} fill="#f59e0b" /> {item.rating}
                        </span>
                      )}
                    </div>
                    {/* Remove button */}
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 4, borderRadius: 8, transition: 'color 0.12s' }}
                      onClick={() => remove(item.id)}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-4)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Price + Qty stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <div>
                      <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                        ₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}
                      </span>
                      {item.originalPrice && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-4)', textDecoration: 'line-through', marginLeft: 6 }}>
                          ₹{((item.originalPrice) * (item.qty || 1)).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {/* Qty stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                      <button
                        style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', transition: 'background 0.1s' }}
                        onClick={() => changeQty(item.id, -1)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '0 10px', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)', minWidth: 24, textAlign: 'center' }}>
                        {item.qty || 1}
                      </span>
                      <button
                        style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', transition: 'background 0.1s' }}
                        onClick={() => changeQty(item.id, 1)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add more services link */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            style={{ background: 'none', border: '2px dashed var(--border)', borderRadius: 16, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--brand-500)', fontWeight: 700, fontSize: '0.88rem', transition: 'border-color 0.2s' }}
            onClick={() => navigate('/')}
          >
            <Plus size={18} /> Add More Services
          </motion.button>
        </div>

        {/* Order Summary */}
        <div style={{ position: 'sticky', top: 88 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '22px 20px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: 18 }}>Order Summary</h3>

            {/* Service lines */}
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-2)', flex: 1, marginRight: 8 }}>
                  {(item.name || item.title)?.slice(0, 28)}{(item.name || item.title)?.length > 28 ? '…' : ''} {item.qty > 1 ? `× ${item.qty}` : ''}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.84rem', color: 'var(--text-3)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.84rem', color: 'var(--text-3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Tag size={12} /> Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontWeight: 900, fontSize: '1.05rem', color: 'var(--text)' }}>
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Admin Approved badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '10px 12px', background: 'var(--success-soft)', borderRadius: 10, marginBottom: 16, border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)' }}>
              <ShieldCheck size={16} color="var(--success-dark, var(--success))" />
              <span style={{ fontSize: '0.78rem', color: 'var(--success-dark, var(--success))', fontWeight: 700 }}>All professionals are admin-verified</span>
            </div>

            {/* Payment Gateway Selector */}
            <div style={{ marginTop: 14, marginBottom: 14 }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Select Integrated Payment Gateway
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { id: 'upi', label: '📱 Instant UPI', desc: 'GPay / PhonePe / Paytm' },
                  { id: 'card', label: '💳 Credit / Debit', desc: 'Visa / MasterCard / RuPay' },
                  { id: 'netbanking', label: '🏦 NetBanking', desc: 'HDFC / ICICI / SBI' },
                  { id: 'cod', label: '💵 Pay After Work', desc: 'Cash / Post-Service' }
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: paymentMethod === m.id ? '2px solid var(--brand-500)' : '1px solid var(--border)',
                      background: paymentMethod === m.id ? 'var(--brand-50)' : 'var(--surface-2)',
                      cursor: 'pointer'
                    }}
                  >
                    <strong style={{ fontSize: '0.78rem', display: 'block', color: 'var(--text)' }}>{m.label}</strong>
                    <span style={{ fontSize: '0.67rem', color: 'var(--text-3)' }}>{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {checkoutError && (
              <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--danger-soft)', border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)', borderRadius: 10, color: 'var(--danger)', fontSize: '0.82rem', fontWeight: 600 }}>
                {checkoutError}
              </div>
            )}

            <button
              className="btn btn-primary btn-block"
              style={{ borderRadius: 12, fontWeight: 900, height: 50, fontSize: '1rem', gap: 8 }}
              onClick={handleCheckout}
              disabled={checkoutState === 'loading'}
            >
              {checkoutState === 'loading' ? (
                <><span className="spinner-sm" /> Placing Order...</>
              ) : (
                <>Proceed to Checkout <ArrowRight size={18} /></>
              )}
            </button>

            <p style={{ fontSize: '0.74rem', color: 'var(--text-4)', textAlign: 'center', marginTop: 10 }}>
              By confirming, you agree to our{' '}
              <span style={{ color: 'var(--brand-500)', cursor: 'pointer' }}>Terms of Service</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
