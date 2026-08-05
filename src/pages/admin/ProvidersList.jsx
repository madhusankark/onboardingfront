import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProviders } from '../../api/admin';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { Search, Filter, Users, Eye, ArrowRight, FolderSearch } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'in_review'];

export default function ProvidersList() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      const res = await import('../../api/provider').then((m) => m.getCategories());
      setCategoryOptions(res.data.categories);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getProviders({ search, status, category, page, limit: 10 })
      .then((res) => {
        if (active) setData(res.data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load providers.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, status, category, page]);

  const applyFilter = (key, value) => {
    if (key === 'page') {
      setPage(value);
      return;
    }
    setPage(1);
    if (key === 'search') setSearch(value);
    if (key === 'status') setStatus(value);
    if (key === 'category') setCategory(value);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            All Service <span className="accent">Providers</span>
          </h1>
          <p className="page-subtitle">Search, filter, and inspect onboarding applications in real-time.</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label flex items-center gap-1">
              <Search size={14} /> Search Providers
            </label>
            <input
              className="form-input"
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={(e) => applyFilter('search', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label flex items-center gap-1">
              <Filter size={14} /> Status Filter
            </label>
            <select className="form-select" value={status} onChange={(e) => applyFilter('status', e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label flex items-center gap-1">
              <Filter size={14} /> Category Filter
            </label>
            <select className="form-select" value={category} onChange={(e) => applyFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <Alert type="danger" message={error} />}

      {loading ? (
        <div className="loading-screen"><Spinner size={34} label="Loading providers..." /></div>
      ) : data && data.data.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FolderSearch}
            title="No matching providers found"
            subtitle={search || status || category ? 'Try clearing or modifying your search filters.' : 'Providers will appear here as soon as they register.'}
          />
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Provider Details</th>
                  <th>Categories</th>
                  <th>City</th>
                  <th>Experience</th>
                  <th>Completion</th>
                  <th>Docs</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="provider-cell">
                        <div className="avatar">{p.user?.name?.[0] || '?'}</div>
                        <div>
                          <div className="p-name">{p.user?.name}</div>
                          <div className="p-email">{p.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="chips" style={{ marginTop: 0 }}>
                        {(p.categories || []).slice(0, 2).map((c) => (
                          <span key={c._id} className="chip">{c.name}</span>
                        ))}
                        {(p.categories || []).length > 2 && (
                          <span className="chip">+{p.categories.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>{p.city || '—'}</td>
                    <td>{p.experienceYears ? `${p.experienceYears} yrs` : '—'}</td>
                    <td>
                      <div className="flex gap-2" style={{ alignItems: 'center' }}>
                        <div className="progress-bar grow" style={{ minWidth: 50, height: 6 }}>
                          <div className="progress-fill" style={{ width: `${p.profileCompletion}%` }} />
                        </div>
                        <span className="muted font-semibold" style={{ fontSize: '0.78rem' }}>{p.profileCompletion}%</span>
                      </div>
                    </td>
                    <td>{p.documentCount}</td>
                    <td>
                      {p.submittedAt
                        ? new Date(p.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : '—'}
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <Link className="btn btn-outline btn-sm flex items-center gap-1" to={`/admin/providers/${p.id}`}>
                        <Eye size={13} /> Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.pagination.page}
            pages={data.pagination.pages}
            total={data.pagination.total}
            limit={data.pagination.limit}
            onPageChange={(p) => applyFilter('page', p)}
          />
        </>
      )}
    </div>
  );
}