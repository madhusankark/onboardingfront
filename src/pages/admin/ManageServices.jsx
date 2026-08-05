import { useEffect, useState } from 'react';
import { getAdminServices, createServiceItem, updateServiceItem, deleteServiceItem } from '../../api/admin';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  DollarSign,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'AC & Appliance Repair',
    price: '',
    originalPrice: '',
    time: '1 hr',
    rating: '4.85',
    description: '',
    img: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminServices();
      setServices(data.services || []);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load services' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      name: '',
      category: 'AC & Appliance Repair',
      price: '',
      originalPrice: '',
      time: '1-2 hrs',
      rating: '4.85',
      description: '',
      img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80'
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      originalPrice: item.originalPrice || item.price + 100,
      time: item.time || '1 hr',
      rating: item.rating || '4.85',
      description: item.description || '',
      img: item.img || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim() || !form.price) {
      setAlert({ type: 'danger', message: 'Name, Category, and Price are required.' });
      return;
    }

    setSaving(true);
    setAlert({ type: '', message: '' });
    try {
      if (editingItem) {
        await updateServiceItem(editingItem._id, form);
        setAlert({ type: 'success', message: `Updated pricing for "${form.name}" successfully!` });
      } else {
        await createServiceItem(form);
        setAlert({ type: 'success', message: `Created new service "${form.name}" successfully!` });
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    try {
      await updateServiceItem(item._id, { isActive: !item.isActive });
      await load();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update status' });
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete service "${item.name}"? This action cannot be undone.`)) return;
    try {
      await deleteServiceItem(item._id);
      setAlert({ type: 'success', message: `Service "${item.name}" deleted.` });
      await load();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Delete failed' });
    }
  };

  const categories = ['All', ...new Set(services.map((s) => s.category))];

  const filtered = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading) return <div className="loading-screen"><Spinner size={34} label="Loading services catalog..." /></div>;

  return (
    <div>
      <div className="page-header flex-between flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Tag size={24} color="var(--brand-500)" /> Services & Dynamic Pricing Management
          </h1>
          <p className="page-subtitle">
            Control service packages, edit prices, and manage active service offerings across the platform.
          </p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={openCreateModal}>
          <Plus size={18} /> Add New Service
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Filter & Search Bar */}
      <div className="card mb-4 flex-between flex-wrap gap-3" style={{ padding: '16px 20px' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} color="var(--text-3)" style={{ position: 'absolute', left: 14, top: 13 }} />
          <input
            type="text"
            placeholder="Search service name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 40, height: 42, borderRadius: 10 }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-3)' }}>Category Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 999, padding: '4px 14px', fontSize: '0.8rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filtered.length === 0 ? (
        <div className="card text-center p-5">
          <p className="muted">No service items match your search filter.</p>
        </div>
      ) : (
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map((item) => (
            <div
              key={item._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 18,
                borderRadius: 16,
                border: item.isActive ? '1px solid var(--border)' : '1px dashed var(--border-strong)',
                opacity: item.isActive ? 1 : 0.65
              }}
            >
              <div>
                {/* Header Image & Badge */}
                <div style={{ position: 'relative', height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                  <img
                    src={item.img || 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80'}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: 'rgba(0, 0, 0, 0.75)',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}
                  >
                    {item.category}
                  </div>
                  <button
                    onClick={() => toggleActive(item)}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: item.isActive ? 'var(--success)' : 'var(--danger)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Title & Metadata */}
                <h3 style={{ margin: '0 0 6px', fontSize: '1.02rem', fontWeight: 800, color: 'var(--text)' }}>
                  {item.name}
                </h3>

                <div className="flex items-center gap-3 mb-3" style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 600 }}>
                  <span className="flex items-center gap-1"><Clock size={14} color="var(--brand-500)" /> {item.time}</span>
                  <span className="flex items-center gap-1"><Star size={14} color="#f59e0b" fill="#f59e0b" /> {item.rating}</span>
                </div>

                {/* Price Display */}
                <div
                  style={{
                    background: 'var(--surface-2)',
                    padding: '10px 14px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                    border: '1px solid var(--border)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-3)', display: 'block' }}>Customer Price:</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-500)' }}>
                        ₹{item.price}
                      </span>
                      {item.originalPrice > item.price && (
                        <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--text-3)' }}>
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(item)}
                    className="btn btn-outline btn-sm"
                    style={{ fontWeight: 700, fontSize: '0.78rem' }}
                  >
                    <Edit2 size={13} /> Edit Price
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <button
                  className="btn btn-outline btn-sm grow flex justify-center items-center gap-1"
                  onClick={() => openEditModal(item)}
                >
                  <Edit2 size={13} /> Full Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(item)}
                  title="Delete Service"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Service Modal */}
      {modalOpen && (
        <Modal
          open={modalOpen}
          title={editingItem ? `Edit Service Price & Details` : `Add New Service`}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
                {saving ? <Spinner size={18} /> : editingItem ? 'Save Price Changes' : 'Create Service'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div className="form-group">
              <label className="form-label">Service Name <span className="req">*</span></label>
              <input
                className="form-input"
                placeholder="e.g. Foam-Jet AC Service & Repair"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Category <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="AC & Appliance Repair">AC & Appliance Repair</option>
                  <option value="Home Cleaning">Home Cleaning</option>
                  <option value="Beauty & Salon">Beauty & Salon</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  className="form-input"
                  placeholder="e.g. 1-2 hrs"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Active Price (₹) <span className="req">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="799"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Original Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="899"
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={form.img}
                onChange={(e) => setForm({ ...form, img: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
