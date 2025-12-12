import { cn } from '../../utils/cn';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    category: 'General',
    items: [
      { keys: ['⌘', 'K'], description: 'Abrir búsqueda rápida' },
      { keys: ['?'], description: 'Mostrar atajos de teclado' },
      { keys: ['Esc'], description: 'Cerrar modal / panel' },
    ],
  },
  {
    category: 'Navegación',
    items: [
      { keys: ['g', 'd'], description: 'Ir al Dashboard' },
      { keys: ['g', 'o'], description: 'Ir a Órdenes' },
      { keys: ['g', 'u'], description: 'Ir a Usuarios' },
      { keys: ['g', 't'], description: 'Ir a Tickets' },
      { keys: ['g', 'p'], description: 'Ir a Precios' },
    ],
  },
];

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full max-w-lg overflow-hidden rounded-2xl',
            'bg-white dark:bg-slate-900 shadow-2xl',
            'ring-1 ring-black/5 dark:ring-white/10'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <svg
                  className="w-5 h-5 text-orange-600 dark:text-orange-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Atajos de Teclado
                </h2>
                <p className="text-sm text-slate-500">Navega más rápido con el teclado</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <svg
                className="w-5 h-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {shortcuts.map((group) => (
              <div key={group.category}>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {group.category}
                </h3>
                <div className="space-y-2">
                  {group.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-slate-700 dark:text-slate-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex}>
                            <kbd
                              className={cn(
                                'inline-flex items-center justify-center',
                                'min-w-[24px] px-2 py-1',
                                'text-xs font-mono font-medium',
                                'bg-slate-100 dark:bg-slate-800',
                                'text-slate-700 dark:text-slate-300',
                                'rounded-lg border border-slate-200 dark:border-slate-700',
                                'shadow-sm'
                              )}
                            >
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-slate-400">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
            <p className="text-sm text-slate-500 text-center">
              Presiona <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">?</kbd> en cualquier momento para ver esta ayuda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShortcutsHelp;
