import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

const ICONS = {
  danger: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info
};

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;
  const Icon = ICONS[type] || Info;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <Icon size={18} className="shrink-0" style={{ marginTop: 2 }} />
      <span className="grow">{message}</span>
      {onClose && (
        <button
          className="icon-btn"
          style={{ width: 24, height: 24, border: 'none', background: 'transparent', cursor: 'pointer' }}
          onClick={onClose}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}