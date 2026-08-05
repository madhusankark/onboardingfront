import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../api/admin';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import StatusBadge from '../../components/StatusBadge';
import {
  ArrowRight,
  PieChart as PieIcon,
  Layers,
  Clock,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from 'recharts';

const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444'
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await getDashboard();
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-screen"><Spinner size={34} label="Loading dashboard analytics..." /></div>;
  if (error) return <Alert type="danger" message={error} />;

  const { stats } = data;

  const pieData = (data.byStatus || []).map((item) => ({
    name: item._id.toUpperCase(),
    value: item.count,
    color: STATUS_COLORS[item._id] || '#6366f1'
  }));

  const barData = (data.byCategory || []).map((item) => ({
    name: item.category,
    providers: item.count
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Admin Operations <span className="accent">Dashboard</span>
          </h1>
          <p className="page-subtitle">Real-time metrics, provider verification pipelines, and service analytics.</p>
        </div>
        <Link to="/admin/providers" className="btn btn-primary btn-sm">
          <span>Manage Providers</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Providers" value={stats.totalProviders} icon="total" tone="primary" />
        <StatCard label="Pending Review" value={stats.pending} icon="pending" tone="warning" />
        <StatCard label="Approved" value={stats.approved} icon="approved" tone="success" />
        <StatCard label="Rejected" value={stats.rejected} icon="rejected" tone="danger" />
        <StatCard label="Uploaded Documents" value={stats.totalDocuments} icon="docs" tone="info" />
        <StatCard label="Approval Rate" value={`${stats.approvalRate}%`} icon="rate" tone="primary" />
        <StatCard label="Avg Profile Completion" value={`${stats.averageCompletion}%`} icon="avg" tone="success" />
      </div>

      <div className="form-grid mt-4" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recharts PieChart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon size={18} color="var(--brand-500)" />
            <h3 className="card-title" style={{ margin: 0 }}>Application Status Distribution</h3>
          </div>
          {pieData.length === 0 ? (
            <p className="muted">No status data recorded.</p>
          ) : (
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recharts BarChart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} color="var(--brand-500)" />
            <h3 className="card-title" style={{ margin: 0 }}>Category Provider Counts</h3>
          </div>
          {barData.length === 0 ? (
            <p className="muted">No category data recorded.</p>
          ) : (
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--text-3)" fontSize={11} />
                  <YAxis stroke="var(--text-3)" fontSize={11} />
                  <RechartsTooltip />
                  <Bar dataKey="providers" fill="var(--brand-500)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="flex-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={18} color="var(--brand-500)" />
            <h3 className="card-title" style={{ margin: 0 }}>Recent Applications</h3>
          </div>
          <Link to="/admin/providers" className="text-xs font-semibold text-brand hover:underline">
            View All →
          </Link>
        </div>
        {data.recentProviders.length === 0 ? (
          <p className="muted">No recent provider applications.</p>
        ) : (
          <div className="flex-col gap-2">
            {data.recentProviders.map((p) => (
              <Link
                key={p.id}
                to={`/admin/providers/${p.id}`}
                className="flex-between card-hover"
                style={{ padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 12, color: 'var(--text)', border: '1px solid var(--border)' }}
              >
                <div className="provider-cell">
                  <div className="avatar">{p.user?.name?.[0] || '?'}</div>
                  <div>
                    <div className="p-name">{p.user?.name}</div>
                    <div className="p-email">{p.user?.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="muted" style={{ fontSize: '0.8rem' }}>{p.city || 'Location N/A'}</span>
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}