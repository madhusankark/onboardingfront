import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty-state">
      <div className="empty-icon">🧭</div>
      <h1 style={{ fontSize: '2rem' }}>404</h1>
      <h3>Page not found</h3>
      <p className="muted">The page you are looking for doesn't exist or has been moved.</p>
      <Link className="btn btn-primary mt-3" to="/">Go Home</Link>
    </div>
  );
}