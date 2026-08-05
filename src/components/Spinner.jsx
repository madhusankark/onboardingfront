export default function Spinner({ size = 22, label }) {
  return (
    <div className="flex gap-2" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: size, height: size }} />
      {label && <span className="muted">{label}</span>}
    </div>
  );
}