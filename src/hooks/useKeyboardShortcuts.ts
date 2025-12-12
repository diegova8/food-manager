import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutAction {
  key: string;
  description: string;
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  onOpenCommandPalette?: () => void;
  onOpenShortcutsHelp?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onOpenCommandPalette,
  onOpenShortcutsHelp,
  enabled = true,
}: UseKeyboardShortcutsOptions = {}) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only allow Escape and Cmd+K in inputs
        if (event.key !== 'Escape' && !(event.key === 'k' && (event.metaKey || event.ctrlKey))) {
          return;
        }
      }

      // Cmd+K or Ctrl+K - Open command palette
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenCommandPalette?.();
        return;
      }

      // ? - Show shortcuts help
      if (event.key === '?' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        onOpenShortcutsHelp?.();
        return;
      }

      // g + letter navigation (vim-style)
      if (event.key === 'g') {
        // Set up listener for next key
        const handleNextKey = (e: KeyboardEvent) => {
          window.removeEventListener('keydown', handleNextKey);

          switch (e.key) {
            case 'd':
              e.preventDefault();
              navigate('/admin');
              break;
            case 'o':
              e.preventDefault();
              navigate('/admin/orders');
              break;
            case 'u':
              e.preventDefault();
              navigate('/admin/users');
              break;
            case 't':
              e.preventDefault();
              navigate('/admin/tickets');
              break;
            case 'p':
              e.preventDefault();
              navigate('/admin/pricing');
              break;
            case 'a':
              e.preventDefault();
              navigate('/admin/activity');
              break;
            case 's':
              e.preventDefault();
              navigate('/admin/settings');
              break;
          }
        };

        // Listen for next key within 500ms
        window.addEventListener('keydown', handleNextKey);
        setTimeout(() => {
          window.removeEventListener('keydown', handleNextKey);
        }, 500);
      }
    },
    [enabled, navigate, onOpenCommandPalette, onOpenShortcutsHelp]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: [
      { key: '⌘K', description: 'Abrir búsqueda rápida' },
      { key: 'g d', description: 'Ir al Dashboard' },
      { key: 'g o', description: 'Ir a Órdenes' },
      { key: 'g u', description: 'Ir a Usuarios' },
      { key: 'g t', description: 'Ir a Tickets' },
      { key: 'g p', description: 'Ir a Precios' },
      { key: 'g a', description: 'Ir a Actividad' },
      { key: 'g s', description: 'Ir a Configuración' },
      { key: '?', description: 'Mostrar atajos' },
    ] as ShortcutAction[],
  };
}

export default useKeyboardShortcuts;
