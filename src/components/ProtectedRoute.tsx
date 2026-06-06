import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: ('citizen' | 'officer' | 'admin')[];
}

export default function ProtectedRoute({ children, requireAuth, requireRole }: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && profile && !requireRole.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
