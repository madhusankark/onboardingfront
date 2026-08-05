import { FolderOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = FolderOpen, title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {typeof Icon === 'string' ? (
          Icon
        ) : (
          <Icon size={36} color="var(--brand-500)" />
        )}
      </div>
      <h3 style={{ margin: '0 0 6px' }}>{title}</h3>
      {subtitle && <p className="muted" style={{ margin: '0 0 14px' }}>{subtitle}</p>}
      {action}
    </div>
  );
}