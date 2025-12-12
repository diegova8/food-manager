import { cn } from '../../../utils/cn';

export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';

interface OrderStatusFlowProps {
  currentStatus: OrderStatus;
  onStatusChange?: (status: OrderStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pendiente',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  confirmed: {
    label: 'Confirmado',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  ready: {
    label: 'Listo',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  completed: {
    label: 'Completado',
    color: 'text-slate-600',
    bgColor: 'bg-slate-500',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'ready', 'completed'];

export function OrderStatusFlow({ currentStatus, onStatusChange, disabled, size = 'md' }: OrderStatusFlowProps) {
  const isCancelled = currentStatus === 'cancelled';
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStepState = (status: OrderStatus, index: number) => {
    if (isCancelled) return 'cancelled';
    if (status === currentStatus) return 'current';
    if (index < currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="w-full">
      {/* Progress flow for normal statuses */}
      {!isCancelled ? (
        <div className="flex items-center justify-between">
          {statusOrder.map((status, index) => {
            const config = statusConfig[status];
            const state = getStepState(status, index);
            const isLast = index === statusOrder.length - 1;
            const isClickable = onStatusChange && !disabled;

            return (
              <div key={status} className="flex items-center flex-1">
                {/* Step circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onStatusChange(status)}
                  disabled={disabled || !onStatusChange}
                  className={cn(
                    'relative flex items-center justify-center rounded-full transition-all',
                    size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
                    state === 'completed' && 'bg-green-500 text-white',
                    state === 'current' && `${config.bgColor} text-white ring-4 ring-opacity-30 ring-current`,
                    state === 'upcoming' && 'bg-gray-200 text-gray-400',
                    isClickable && 'cursor-pointer hover:scale-110',
                    !isClickable && 'cursor-default'
                  )}
                  title={config.label}
                >
                  {state === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    config.icon
                  )}
                </button>

                {/* Connector line */}
                {!isLast && (
                  <div className="flex-1 mx-2">
                    <div
                      className={cn(
                        'h-1 rounded-full transition-colors',
                        index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Cancelled state */
        <div className="flex items-center justify-center">
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full',
            'bg-red-100 text-red-700'
          )}>
            {statusConfig.cancelled.icon}
            <span className="font-medium">{statusConfig.cancelled.label}</span>
          </div>
        </div>
      )}

      {/* Labels */}
      {!isCancelled && (
        <div className="flex items-center justify-between mt-2">
          {statusOrder.map((status, index) => {
            const config = statusConfig[status];
            const state = getStepState(status, index);

            return (
              <div
                key={`${status}-label`}
                className={cn(
                  'text-center flex-1',
                  size === 'sm' ? 'text-xs' : 'text-sm',
                  state === 'current' && `font-semibold ${config.color}`,
                  state === 'completed' && 'text-green-600',
                  state === 'upcoming' && 'text-gray-400'
                )}
              >
                {config.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Compact status badge variant
interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export function OrderStatusBadge({ status, size = 'md', showDot = true }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  };

  const bgClasses: Record<OrderStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    ready: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const dotClasses: Record<OrderStatus, string> = {
    pending: 'bg-amber-500',
    confirmed: 'bg-blue-500',
    ready: 'bg-emerald-500',
    completed: 'bg-slate-500',
    cancelled: 'bg-red-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        sizeClasses[size],
        bgClasses[status]
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotClasses[status])} />
      )}
      {config.label}
    </span>
  );
}

export default OrderStatusFlow;
