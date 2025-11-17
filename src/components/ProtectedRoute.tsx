import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const authTimestamp = localStorage.getItem('authTimestamp');

  // Verificar si la sesión expiró (24 horas)
  if (authTimestamp) {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const elapsed = now - parseInt(authTimestamp);

    if (elapsed > twentyFourHours) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authTimestamp');
      return <Navigate to="/login" replace />;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
