import { Users, Clock, CheckCircle2, XCircle, FileText, TrendingUp, Target } from 'lucide-react';

const ICONS = {
  total: Users,
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  docs: FileText,
  rate: TrendingUp,
  avg: Target
};

const TONES = {
  primary: { bg: 'var(--brand-50)', color: 'var(--brand-600)', glow: 'var(--brand-100)' },
  success: { bg: 'var(--success-soft)', color: 'var(--success)', glow: 'color-mix(in srgb, var(--success) 18%, transparent)' },
  warning: { bg: 'var(--warning-soft)', color: 'var(--warning)', glow: 'color-mix(in srgb, var(--warning) 18%, transparent)' },
  danger: { bg: 'var(--danger-soft)', color: 'var(--danger)', glow: 'color-mix(in srgb, var(--danger) 18%, transparent)' },
  info: { bg: 'var(--info-soft)', color: 'var(--info)', glow: 'color-mix(in srgb, var(--info) 18%, transparent)' }
};

export default function StatCard({ label, value, icon, tone = 'primary', trend }) {
  const t = TONES[tone] || TONES.primary;
  const IconComp = typeof icon === 'string' ? ICONS[icon] || Users : icon || Users;

  return (
    <div className="stat-card" style={{ '--stat-glow': t.glow }}>
      <div className="stat-icon" style={{ background: t.bg, color: t.color }}>
        {typeof IconComp === 'function' || typeof IconComp === 'object' ? (
          <IconComp size={22} />
        ) : (
          IconComp
        )}
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {trend !== undefined && <div className="stat-trend">{trend}</div>}
    </div>
  );
}