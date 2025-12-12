import { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

export interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'left' | 'right';
  showOverlay?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
} as const;

export function SlideOver({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  position = 'right',
  showOverlay = true,
}: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      {showOverlay && (
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed inset-y-0 flex',
          position === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div
          ref={panelRef}
          className={cn(
            'relative w-screen bg-white shadow-xl flex flex-col',
            'transform transition-transform duration-300 ease-in-out',
            sizes[size],
            position === 'right'
              ? 'animate-slide-in-right'
              : 'animate-slide-in-left'
          )}
          style={{
            animation: position === 'right'
              ? 'slideInRight 0.3s ease-out'
              : 'slideInLeft 0.3s ease-out',
          }}
        >
          {/* Header */}
          {(title || description) && (
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div>
                {title && (
                  <h2 className="text-lg font-semibold text-gray-900">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
          )}

          {/* Close button when no title */}
          {!title && !description && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
              aria-label="Cerrar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export interface SlideOverFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SlideOverFooter({ children, className }: SlideOverFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface SlideOverSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function SlideOverSection({
  children,
  title,
  className,
}: SlideOverSectionProps) {
  return (
    <div className={cn('py-4 border-b border-gray-100 last:border-0', className)}>
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
