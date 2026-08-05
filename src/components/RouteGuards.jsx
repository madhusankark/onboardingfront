import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Blocks anonymous users
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Blocks users without an allowed role
export function RoleRoute({ roles }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const defaultPath = user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/dashboard' : '/';
  if (!user || !roles.includes(user.role)) return <Navigate to={defaultPath} replace />;
  return <Outlet />;
}

// Redirects authenticated users away from auth pages
export function PublicOnlyRoute() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const defaultPath = isAdmin ? '/admin' : user?.role === 'provider' ? '/dashboard' : '/';
  if (isAuthenticated) return <Navigate to={defaultPath} replace />;
  return <Outlet />;
}