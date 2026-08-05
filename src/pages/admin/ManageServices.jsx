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
  RefreshCw,
  Package,
  Layers
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
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: 'AC & Appliance Repair',
    section: 'general',
    itemType: 'service',
    price: '',
    originalPrice: '',
    time: '1 hr',
    rating: '4.85',
    description: '',
    img: '',
    inclusionsStr: ''
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
    setIsCustomCategory(false);
    setCustomCategory('');
    setForm({
      name: '',
      category: 'AC & Appliance Repair',
      section: 'general',
      itemType: 'service',
      price: '',
      originalPrice: '',
      time: '1-2 hrs',
      rating: '4.85',
      description: '',
      img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80',
      inclusionsStr: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsCustomCategory(false);
    setCustomCategory('');
    setForm({
      name: item.name,
      category: item.category,
      section: item.section || 'general',
      itemType: item.itemType || 'service',
      price: item.price,
      originalPrice: item.originalPrice || item.price + 100,
      time: item.time || '1 hr',
      rating: item.rating || '4.85',
      description: item.description || '',
      img: item.img || '',
      inclusionsStr: Array.isArray(item.inclusions) ? item.inclusions.join('\n') : ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const finalCategory = isCustomCategory ? customCategory.trim() : form.category;
    if (!form.name.trim() || !finalCategory || !form.price) {
      setAlert({ type: 'danger', message: 'Name, Category, and Price are required.' });
      return;
    }

    setSaving(true);
    setAlert({ type: '', message: '' });
    try {
      const payload = {
        ...form,
        category: finalCategory,
        inclusions: form.inclusionsStr.split('\n').map((s) => s.trim()).filter(Boolean)
      };

      if (editingItem) {
        await updateServiceItem(editingItem._id, payload);
        setAlert({ type: 'success', message: `Updated item "${form.name}" successfully!` });
      } else {
        await createServiceItem(payload);
        setAlert({ type: 'success', message: `Created new item "${form.name}" under ${form.section} section!` });
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
    if (!window.confirm(`Delete item "${item.name}"? This action cannot be undone.`)) return;
    try {
      await deleteServiceItem(item._id);
      setAlert({ type: 'success', message: `Item "${item.name}" deleted.` });
      await load();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Delete failed' });
    }
  };

  const categoriesList = ['All', ...new Set(services.map((s) => s.category))];

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
            <Tag size={24} color="var(--brand-500)" /> Services & Product Catalog Management
          </h1>
          <p className="page-subtitle">
            Create products/services, add dynamic categories, and assign target Homepage Bar sections.
          </p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={openCreateModal}>
          <Plus size={18} /> Add New Service / Product
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
          {categoriesList.map((cat) => (
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
                <div style={{ position: 'relative', height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                  <img
                    src={item.img || 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80'}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6 }}>
                    <span style={{ background: item.itemType === 'product' ? '#8b5cf6' : 'var(--brand-500)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                      {item.itemType === 'product' ? 'PRODUCT' : 'SERVICE'}
                    </span>
                    {item.section && item.section !== 'general' && (
                      <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                        {item.section.toUpperCase().replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-between items-center mb-1">
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase' }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 700 }}>
                    ★ {item.rating || '4.85'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>
                  {item.name}
                </h3>
                {item.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: '0 0 10px', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                )}
              </div>

              <div>
                <div className="flex-between items-center my-3" style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>₹{item.price}</span>
                    {item.originalPrice > item.price && (
                      <strike style={{ fontSize: '0.82rem', color: 'var(--text-4)', marginLeft: 6 }}>₹{item.originalPrice}</strike>
                    )}
                  </div>
                  <button
                    onClick={() => toggleActive(item)}
                    className={`btn btn-sm ${item.isActive ? 'btn-outline' : 'btn-primary'}`}
                    style={{ borderRadius: 8, fontSize: '0.75rem', padding: '3px 10px' }}
                  >
                    {item.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="btn btn-outline btn-sm flex-1" onClick={() => openEditModal(item)} style={{ borderRadius: 8 }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleDelete(item)} style={{ borderRadius: 8, color: '#ef4444', borderColor: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Service Modal */}
      {modalOpen && (
        <Modal
          open={modalOpen}
          title={editingItem ? `Edit Service / Product Details` : `Add New Service or Product`}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
                {saving ? <Spinner size={18} /> : editingItem ? 'Save Changes' : 'Create Item'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Item Type <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={form.itemType}
                  onChange={(e) => setForm({ ...form, itemType: e.target.value })}
                >
                  <option value="service">🛠️ Service Package</option>
                  <option value="product">📦 Physical Product / Smart Appliance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Homepage Bar <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                >
                  <option value="spotlight">⭐ In the Spotlight Bar</option>
                  <option value="new_noteworthy">🆕 New & Noteworthy Bar (Products)</option>
                  <option value="most_booked">🔥 Most Booked Bar</option>
                  <option value="general">📁 General Category Catalog</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Item Name <span className="req">*</span></label>
              <input
                className="form-input"
                placeholder={form.itemType === 'product' ? 'e.g. Native Smart Water Purifier' : 'e.g. Stress Relief Swedish Body Massage'}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Category selection + Custom Category Creation */}
            <div className="form-group">
              <label className="form-label">Category <span className="req">*</span></label>
              <select
                className="form-select"
                value={isCustomCategory ? '__CUSTOM__' : form.category}
                onChange={(e) => {
                  if (e.target.value === '__CUSTOM__') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setForm({ ...form, category: e.target.value });
                  }
                }}
              >
                <option value="AC & Appliance Repair">AC & Appliance Repair</option>
                <option value="Home Cleaning">Home Cleaning</option>
                <option value="Beauty & Salon">Beauty & Salon</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Painting">Painting</option>
                <option value="Pest Control">Pest Control</option>
                <option value="__CUSTOM__">➕ Add New Custom Category...</option>
              </select>

              {isCustomCategory && (
                <input
                  className="form-input mt-2"
                  placeholder="Enter new category name (e.g. Smart Appliances, Wellness & Spa)..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Active Price (₹) <span className="req">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="1999"
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
                  placeholder="2299"
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Short Subtitle / Description</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="e.g. 10-stage RO + UV purification technology with 2-year zero maintenance warranty"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Key Inclusions (One per line)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="10-stage RO + UV + UF purification technology&#10;In-built TDS controller & mineral booster&#10;Zero maintenance cost for 2 full years"
                value={form.inclusionsStr}
                onChange={(e) => setForm({ ...form, inclusionsStr: e.target.value })}
              />
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
