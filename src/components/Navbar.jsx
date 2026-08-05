import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import LocationModal from './LocationModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  MapPin,
  ChevronDown,
  Search,
  ShoppingCart,
  Shield,
  LayoutDashboard,
  User,
  FileText,
  Clock,
  LogOut,
  Users,
  Sun,
  Moon,
  Navigation,
  Loader2,
  X,
  Package,
  Tag,
  Activity
} from 'lucide-react';

const POPULAR_CITIES = [
  'PVR Ripples, Vijayawada',
  'MG Road, Vijayawada',
  'Benz Circle, Vijayawada',
  'Madhapur, Hyderabad',
  'Koramangala, Bengaluru',
  'Connaught Place, New Delhi',
  'Bandra West, Mumbai',
  'T. Nagar, Chennai'
];

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    () => localStorage.getItem('user_location') || 'PVR Ripples, Vijayawada'
  );
  const [detecting, setDetecting] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [cartCount, setCartCount] = useState(() => {
    try {
      const items = JSON.parse(localStorage.getItem('cart_items') || '[]');
      return items.length;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    localStorage.setItem('user_location', selectedLocation);
  }, [selectedLocation]);

  useEffect(() => {
    const handleCartUpdate = () => {
      try {
        const items = JSON.parse(localStorage.getItem('cart_items') || '[]');
        setCartCount(items.length);
      } catch {
        setCartCount(0);
      }
    };
    window.addEventListener('storage', handleCartUpdate);
    window.addEventListener('cart_updated', handleCartUpdate);
    return () => {
      window.removeEventListener('storage', handleCartUpdate);
      window.removeEventListener('cart_updated', handleCartUpdate);
    };
  }, []);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (user) {
      navigate(isAdmin ? '/admin/providers' : '/dashboard');
    } else {
      navigate('/register');
    }
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.suburb || data.address?.county || 'Local Area';
          const state = data.address?.state || '';
          const fullLoc = `${city}${state ? ', ' + state : ''}`;
          setSelectedLocation(fullLoc);
          setShowLocationModal(false);
        } catch (err) {
          setSelectedLocation('Vijayawada, AP');
          setShowLocationModal(false);
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        alert('Location access denied or unavailable. Please pick a city manually.');
      }
    );
  };

  const handleLocationSearch = async (q) => {
    setLocationQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchingLocation(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=5`
      );
      const data = await res.json();
      setSearchResults(data.map((item) => item.display_name.split(',').slice(0, 3).join(',')));
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearchingLocation(false);
    }
  };

  return (
    <>
      <nav className="navbar" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', height: 72 }}>
        <div className="navbar-inner" style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          
          {/* Left Section: Logo & Location */}
          <div className="flex items-center gap-4">
            <Link
              to={isAdmin ? '/admin' : user?.role === 'provider' ? '/dashboard' : '/'}
              className="navbar-brand"
              style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
            >

              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#0f0f0f',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  letterSpacing: -0.5
                }}
              >
                FX
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                Fixora<span style={{ color: 'var(--brand-500)' }}>Pro</span>
              </span>
            </Link>

            {/* Location Selector Dropdown */}
            <button
              onClick={() => setShowLocationModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text)',
                cursor: 'pointer'
              }}
            >
              <MapPin size={15} color="var(--brand-500)" />
              <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedLocation}
              </span>
              <ChevronDown size={14} color="var(--text-3)" />
            </button>
          </div>

          {/* Center Section: Public Search OR Provider/Admin Nav Menu */}
          {user ? (
            <div className="navbar-links flex items-center gap-1" style={{ padding: '4px 6px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)' }}>
              {isAdmin ? (
                <>
                  <NavLink to="/admin" className="nav-link" end>
                    <LayoutDashboard size={15} />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink to="/admin/providers" className="nav-link">
                    <Users size={15} />
                    <span>Providers</span>
                  </NavLink>
                  <NavLink to="/admin/services" className="nav-link">
                    <Tag size={15} />
                    <span>Services & Pricing</span>
                  </NavLink>
                  <NavLink to="/admin/bookings" className="nav-link">
                    <Activity size={15} />
                    <span>Work Tracking</span>
                  </NavLink>
                </>
              ) : user?.role === 'customer' ? (
                <>
                  <NavLink to="/customer/orders" className="nav-link" end>
                    <ShoppingCart size={15} />
                    <span>My Orders</span>
                  </NavLink>
                  <NavLink to="/" className="nav-link">
                    <Search size={15} />
                    <span>Book Service</span>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard" className="nav-link" end>
                    <LayoutDashboard size={15} />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink to="/profile" className="nav-link">
                    <User size={15} />
                    <span>Profile</span>
                  </NavLink>
                  <NavLink to="/documents" className="nav-link">
                    <FileText size={15} />
                    <span>Documents</span>
                  </NavLink>
                  <NavLink to="/status" className="nav-link">
                    <Clock size={15} />
                    <span>Status</span>
                  </NavLink>
                </>
              )}

            </div>
          ) : (
            <form
              onSubmit={handleSearchSubmit}
              style={{
                flex: 1,
                maxWidth: 440,
                display: 'flex',
                alignItems: 'center',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '6px 14px'
              }}
            >
              <Search size={17} color="var(--text-3)" style={{ marginRight: 8, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search for 'AC service', 'Salon', 'Plumber'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  background: 'transparent',
                  fontSize: '0.86rem',
                  color: 'var(--text)'
                }}
              />
            </form>
          )}

          {/* Right Section: Theme Toggle, Cart / Profile Chips */}
          <div className="flex items-center gap-3">
            <button
              className="icon-btn"
              onClick={toggle}
              title="Toggle Light / Dark Theme"
              aria-label="Toggle Theme"
              style={{ width: 38, height: 38, borderRadius: 10, cursor: 'pointer' }}
            >
              {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="var(--brand-500)" />}
            </button>

            {/* Cart icon */}
            <div style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                onClick={() => navigate('/cart')}
                style={{ width: 38, height: 38, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="View Cart"
              >
                <ShoppingCart size={18} />
              </button>
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: 'var(--brand-500)',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </div>

            {/* My Orders icon — only for customers */}
            {user?.role === 'customer' && (
              <button
                className="icon-btn"
                onClick={() => navigate('/customer/orders')}
                style={{ width: 38, height: 38, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="My Orders"
              >
                <Package size={18} />
              </button>
            )}


            {user ? (
              <div className="flex items-center gap-2">
                <div
                  className="user-chip"
                  onClick={() => navigate('/user/profile')}
                  title="Click to edit profile & avatar"
                  style={{
                    padding: '4px 10px',
                    borderRadius: 10,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer'
                  }}
                >
                  <div className="avatar" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-500)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(user.name)}
                  </div>
                  <div className="meta" style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '0.82rem', lineHeight: 1.1 }}>{user.name}</strong>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3, textTransform: 'capitalize' }}>
                      {isAdmin ? <Shield size={10} color="var(--brand-500)" /> : <User size={10} />}
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleLogout}
                  title="Logout"
                  style={{ padding: '6px 12px', height: 34, fontSize: '0.8rem', borderRadius: 10 }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link className="btn btn-ghost btn-sm" to="/login" style={{ fontWeight: 600 }}>
                  Sign in
                </Link>
                <Link className="btn btn-primary btn-sm" to="/register" style={{ fontWeight: 700 }}>
                  Register Partner
                </Link>
              </div>
            )}
          </div>

        </div>
      </nav>


      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        currentLocation={selectedLocation}
      />
    </>
  );
}