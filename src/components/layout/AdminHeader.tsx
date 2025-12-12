import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { decodeJWT, type JWTPayload } from '../../utils/jwt';
import { ThemeToggle } from '../shared/ThemeToggle';

export interface AdminHeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  onOpenCommandPalette?: () => void;
}

export function AdminHeader({ onMenuToggle, showMenuButton = false, onOpenCommandPalette }: AdminHeaderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = decodeJWT(token);
      setUser(decoded);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Global search button */}
        <button
          onClick={onOpenCommandPalette}
          className={cn(
            'hidden sm:flex items-center gap-3 w-64 pl-3 pr-4 py-2 text-sm',
            'border border-gray-300 dark:border-slate-600 rounded-xl',
            'bg-gray-50 dark:bg-slate-700',
            'text-gray-400 dark:text-slate-400',
            'hover:bg-gray-100 dark:hover:bg-slate-600',
            'transition-colors cursor-pointer'
          )}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-slate-600 rounded">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications (placeholder for future) */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Notification badge */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-medium text-sm">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'A'}
              </span>
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user?.firstName || user?.username || 'Admin'}
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <a
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  Mi Perfil
                </a>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
