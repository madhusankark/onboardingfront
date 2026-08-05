import { useState } from 'react';
import { X, Navigation, Search, Loader2, MapPin } from 'lucide-react';

export const POPULAR_CITIES = [
  'PVR Ripples, Vijayawada',
  'MG Road, Vijayawada',
  'Benz Circle, Vijayawada',
  'Governorpet, Vijayawada',
  'Madhapur, Hyderabad',
  'Koramangala, Bengaluru',
  'Connaught Place, New Delhi',
  'Bandra West, Mumbai',
  'T. Nagar, Chennai'
];

export default function LocationModal({ isOpen, onClose, onSelectLocation, currentLocation }) {
  const [detecting, setDetecting] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);

  if (!isOpen) return null;

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
          onSelectLocation(fullLoc);
          onClose();
        } catch {
          onSelectLocation('Vijayawada, AP');
          onClose();
        } finally {
          setDetecting(false);
        }
      },
      () => {
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=6`
      );
      const data = await res.json();
      setSearchResults(data.map((item) => item.display_name.split(',').slice(0, 3).join(',')));
    } catch {
      setSearchResults([]);
    } finally {
      setSearchingLocation(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-3">
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Select location</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close location selector">
            <X size={16} />
          </button>
        </div>

        {/* GPS Auto-Detect Button */}
        <button
          type="button"
          onClick={detectCurrentLocation}
          disabled={detecting}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1.5px solid var(--brand-500)',
            background: 'var(--brand-50)',
            color: 'var(--brand-500)',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 16
          }}
        >
          {detecting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Detecting GPS Location...</span>
            </>
          ) : (
            <>
              <Navigation size={16} />
              <span>Detect my current location (GPS)</span>
            </>
          )}
        </button>

        {/* Live Search Input Bar */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={16} color="var(--text-3)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            placeholder="Search city, area, or pincode..."
            value={locationQuery}
            onChange={(e) => handleLocationSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              fontSize: '0.88rem',
              color: 'var(--text)',
              outline: 'none'
            }}
          />
          {searchingLocation && (
            <Loader2 size={15} className="animate-spin" style={{ position: 'absolute', right: 12, top: 12, color: 'var(--text-3)' }} />
          )}
        </div>

        {/* Live Search Results OR Popular Cities */}
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          {searchResults.length > 0 ? 'Search Results' : 'Popular Cities & Areas'}
        </div>

        <div className="flex flex-col gap-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
          {(searchResults.length > 0 ? searchResults : POPULAR_CITIES).map((loc) => {
            const isSelected = currentLocation === loc || (Array.isArray(currentLocation) && currentLocation.includes(loc));
            return (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: isSelected ? 'var(--brand-50)' : 'var(--surface)',
                  color: isSelected ? 'var(--brand-500)' : 'var(--text)',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.88rem'
                }}
              >
                <MapPin size={16} color="var(--brand-500)" />
                <span>{loc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
