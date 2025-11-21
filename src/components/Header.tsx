import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { decodeJWT, isUserAdmin } from '../utils/jwt';
import logo from '../assets/logo.png';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = api.isAuthenticated();
  const isAdmin = isUserAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user info from token
  const getUserInfo = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return decodeJWT(token);
  };

  const userInfo = getUserInfo();

  const handleLogout = () => {
    api.logout();
    setMobileMenuOpen(false);
    navigate('/menu');
    window.location.reload();
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b-2 border-orange-200 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/menu" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img
              src={logo}
              alt="Ceviche de mi Tata"
              className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-orange-200"
            />
            <span className="hidden sm:block font-bold text-slate-800 text-sm md:text-base">
              Ceviche de mi Tata
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Hola, <span className="font-semibold text-gray-800">{userInfo?.name || userInfo?.username}</span>
                </span>

                <Link
                  to="/profile"
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    isActivePath('/profile')
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Mi Perfil
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                      isActivePath('/admin')
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 border-t border-gray-100 pt-4">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                {/* User greeting */}
                <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100 mb-2">
                  Hola, <span className="font-semibold text-gray-800">{userInfo?.name || userInfo?.username}</span>
                </div>

                {/* Menu link */}
                <Link
                  to="/menu"
                  onClick={closeMobileMenu}
                  className={`px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-3 ${
                    isActivePath('/menu')
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Menú
                </Link>

                {/* Profile link */}
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className={`px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-3 ${
                    isActivePath('/profile')
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mi Perfil
                </Link>

                {/* Admin link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className={`px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-3 ${
                      isActivePath('/admin')
                        ? 'bg-purple-100 text-purple-600'
                        : 'text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Panel Admin
                  </Link>
                )}

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-3 text-red-600 hover:bg-red-50 mt-2 border-t border-gray-100 pt-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/menu"
                  onClick={closeMobileMenu}
                  className={`px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-3 ${
                    isActivePath('/menu')
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Menú
                </Link>

                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-3 text-orange-600 hover:bg-orange-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar Sesión
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
