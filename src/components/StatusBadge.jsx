import { CheckCircle2, Clock, XCircle, FileText, AlertCircle } from 'lucide-react';

const STATUS_META = {
  pending: { label: 'Pending', cls: 'badge-pending', icon: Clock },
  in_review: { label: 'In Review', cls: 'badge-in_review', icon: AlertCircle },
  approved: { label: 'Approved', cls: 'badge-approved', icon: CheckCircle2 },
  rejected: { label: 'Rejected', cls: 'badge-rejected', icon: XCircle },
  uploaded: { label: 'Uploaded', cls: 'badge-uploaded', icon: FileText },
  verified: { label: 'Verified', cls: 'badge-verified', icon: CheckCircle2 }
};

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, cls: 'badge-uploaded', icon: FileText };
  const Icon = meta.icon;
  return (
    <span className={`badge ${meta.cls}`}>
      <Icon size={12} />
      <span>{meta.label}</span>
    </span>
  );
}

export { STATUS_META };