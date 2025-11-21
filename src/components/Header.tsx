import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { decodeJWT, isUserAdmin } from '../utils/jwt';
import logo from '../assets/logo.png';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = api.isAuthenticated();
  const isAdmin = isUserAdmin();

  // Get user info from token
  const getUserInfo = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return decodeJWT(token);
  };

  const userInfo = getUserInfo();

  const handleLogout = () => {
    api.logout();
    navigate('/menu');
    // Force reload to update auth state
    window.location.reload();
  };

  return (
    <header className="bg-white border-b-2 border-orange-200 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/menu" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src={logo}
              alt="Ceviche de mi Tata"
              className="h-12 w-12 rounded-full object-cover border-2 border-orange-200"
            />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Authenticated User */}
                <span className="text-sm text-gray-600">
                  Hola, <span className="font-semibold text-gray-800">{userInfo?.username}</span>
                </span>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                {/* Not Authenticated */}
                <Link
                  to="/login"
                  className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
