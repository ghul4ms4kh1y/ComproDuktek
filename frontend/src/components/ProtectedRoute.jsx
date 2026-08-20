import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div role="status" className="min-h-screen flex items-center justify-center text-inktext/50">Memuat...</div>;
  if (!user) return <Navigate to="/admin-portal/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin-portal/login" replace />; // or an unauthorized page
  }

  return children;
}
