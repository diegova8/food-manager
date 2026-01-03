import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'action' | 'search';
  shortcut?: string;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      subtitle: 'Ver resumen general',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      action: () => navigate('/admin'),
      category: 'navigation',
      shortcut: 'g d',
    },
    {
      id: 'nav-orders',
      title: 'Órdenes',
      subtitle: 'Gestionar pedidos',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      action: () => navigate('/admin/orders'),
      category: 'navigation',
      shortcut: 'g o',
    },
    {
      id: 'nav-products',
      title: 'Productos',
      subtitle: 'Gestionar catálogo de productos',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      action: () => navigate('/admin/products'),
      category: 'navigation',
      shortcut: 'g r',
    },
    {
      id: 'nav-categories',
      title: 'Categorías',
      subtitle: 'Organizar productos en categorías',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      action: () => navigate('/admin/categories'),
      category: 'navigation',
      shortcut: 'g c',
    },
    {
      id: 'nav-raw-materials',
      title: 'Materias Primas',
      subtitle: 'Gestionar ingredientes y precios',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      action: () => navigate('/admin/raw-materials'),
      category: 'navigation',
      shortcut: 'g m',
    },
    {
      id: 'nav-users',
      title: 'Usuarios',
      subtitle: 'Gestionar usuarios registrados',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      action: () => navigate('/admin/users'),
      category: 'navigation',
      shortcut: 'g u',
    },
    {
      id: 'nav-tickets',
      title: 'Tickets',
      subtitle: 'Soporte y reportes',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      action: () => navigate('/admin/tickets'),
      category: 'navigation',
      shortcut: 'g t',
    },
    {
      id: 'nav-pricing',
      title: 'Calculadora',
      subtitle: 'Calcular materias primas para pedidos',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      action: () => navigate('/admin/pricing'),
      category: 'navigation',
      shortcut: 'g p',
    },
    {
      id: 'nav-activity',
      title: 'Actividad',
      subtitle: 'Registro de actividad del sistema',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: () => navigate('/admin/activity'),
      category: 'navigation',
      shortcut: 'g a',
    },
    {
      id: 'nav-settings',
      title: 'Configuración',
      subtitle: 'Preferencias del sistema',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: () => navigate('/admin/settings'),
      category: 'navigation',
      shortcut: 'g s',
    },
    // Actions
    {
      id: 'action-menu',
      title: 'Ver Menú Público',
      subtitle: 'Abrir menú del cliente',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      ),
      action: () => window.open('/menu', '_blank'),
      category: 'action',
    },
    {
      id: 'action-logout',
      title: 'Cerrar Sesión',
      subtitle: 'Salir de la cuenta',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      action: () => {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      },
      category: 'action',
    },
  ];

  const filteredCommands = query
    ? commands.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(query.toLowerCase()) ||
          cmd.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredCommands, selectedIndex, onClose]
  );

  if (!isOpen) return null;

  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.category === 'navigation'),
    action: filteredCommands.filter((c) => c.category === 'action'),
  };

  let currentIndex = -1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-[20vh]">
        <div
          className={cn(
            'relative w-full max-w-xl overflow-hidden rounded-2xl',
            'bg-white dark:bg-slate-900 shadow-2xl',
            'ring-1 ring-black/5 dark:ring-white/10',
            'transform transition-all'
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-700">
            <svg
              className="ml-4 h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar comandos..."
              className={cn(
                'flex-1 px-4 py-4 text-base',
                'bg-transparent outline-none',
                'text-slate-900 dark:text-white',
                'placeholder-slate-400 dark:placeholder-slate-500'
              )}
            />
            <kbd className="mr-4 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <svg
                  className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>No se encontraron comandos</p>
              </div>
            ) : (
              <>
                {groupedCommands.navigation.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Navegación
                    </div>
                    {groupedCommands.navigation.map((command) => {
                      currentIndex++;
                      const isSelected = currentIndex === selectedIndex;
                      return (
                        <button
                          key={command.id}
                          onClick={() => {
                            command.action();
                            onClose();
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors',
                            isSelected
                              ? 'bg-orange-500 text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          <div
                            className={cn(
                              'flex-shrink-0 p-2 rounded-lg',
                              isSelected
                                ? 'bg-orange-400'
                                : 'bg-slate-100 dark:bg-slate-800'
                            )}
                          >
                            {command.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{command.title}</p>
                            {command.subtitle && (
                              <p
                                className={cn(
                                  'text-sm truncate',
                                  isSelected ? 'text-orange-100' : 'text-slate-500'
                                )}
                              >
                                {command.subtitle}
                              </p>
                            )}
                          </div>
                          {command.shortcut && (
                            <kbd
                              className={cn(
                                'px-2 py-1 text-xs font-mono rounded',
                                isSelected
                                  ? 'bg-orange-400 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              )}
                            >
                              {command.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {groupedCommands.action.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Acciones
                    </div>
                    {groupedCommands.action.map((command) => {
                      currentIndex++;
                      const isSelected = currentIndex === selectedIndex;
                      return (
                        <button
                          key={command.id}
                          onClick={() => {
                            command.action();
                            onClose();
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors',
                            isSelected
                              ? 'bg-orange-500 text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          <div
                            className={cn(
                              'flex-shrink-0 p-2 rounded-lg',
                              isSelected
                                ? 'bg-orange-400'
                                : 'bg-slate-100 dark:bg-slate-800'
                            )}
                          >
                            {command.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{command.title}</p>
                            {command.subtitle && (
                              <p
                                className={cn(
                                  'text-sm truncate',
                                  isSelected ? 'text-orange-100' : 'text-slate-500'
                                )}
                              >
                                {command.subtitle}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 py-3 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↑↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↵</kbd>
                seleccionar
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">K</kbd>
              abrir
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
