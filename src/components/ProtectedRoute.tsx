import { Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { isUserAdmin } from '../utils/jwt';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const isAuthenticated = api.isAuthenticated();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if admin access is required
  if (adminOnly && !isUserAdmin()) {
    // Redirect non-admin users to menu
    return <Navigate to="/menu" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
