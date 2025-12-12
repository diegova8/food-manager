import { cn } from '../../utils/cn';
import { SkeletonTable } from '../ui/Skeleton';

export interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'dots';
  message?: string;
  className?: string;
  rows?: number;
}

export function LoadingState({
  variant = 'spinner',
  message,
  className,
  rows = 5,
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('w-full', className)}>
        <SkeletonTable rows={rows} columns={4} />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12',
          className
        )}
      >
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
        </div>
        {message && <p className="mt-4 text-gray-500">{message}</p>}
      </div>
    );
  }

  // Default: spinner
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12',
        className
      )}
    >
      <svg
        className="animate-spin h-8 w-8 text-orange-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {message && <p className="mt-4 text-gray-500">{message}</p>}
    </div>
  );
}
