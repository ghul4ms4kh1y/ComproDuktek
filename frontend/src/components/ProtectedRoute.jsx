import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-inktext/50">Memuat...</div>;
  if (!admin) return <Navigate to="/admin-portal/login" replace />;

  return children;
}
