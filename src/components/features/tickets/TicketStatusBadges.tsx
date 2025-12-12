import { cn } from '../../../utils/cn';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketType = 'suggestion' | 'bug';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  open: {
    label: 'Abierto',
    className: 'bg-blue-100 text-blue-700',
  },
  in_progress: {
    label: 'En Progreso',
    className: 'bg-yellow-100 text-yellow-700',
  },
  resolved: {
    label: 'Resuelto',
    className: 'bg-green-100 text-green-700',
  },
  closed: {
    label: 'Cerrado',
    className: 'bg-slate-100 text-slate-700',
  },
};

export function TicketStatusBadge({ status, size = 'md' }: TicketStatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        config.className,
        sizeClasses[size]
      )}
    >
      {config.label}
    </span>
  );
}

interface TicketTypeBadgeProps {
  type: TicketType;
  size?: 'sm' | 'md';
}

const typeConfig: Record<TicketType, { label: string; className: string; icon: React.ReactNode }> = {
  suggestion: {
    label: 'Sugerencia',
    className: 'bg-teal-100 text-teal-700',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
  bug: {
    label: 'Bug',
    className: 'bg-red-100 text-red-700',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.56 1.14a.75.75 0 01.177 1.045 3.989 3.989 0 00-.464.86c.185.17.382.329.59.473A3.993 3.993 0 0110 2c1.272 0 2.405.594 3.137 1.518.208-.144.405-.302.59-.473a3.989 3.989 0 00-.464-.86.75.75 0 011.222-.869c.369.519.65 1.105.822 1.736a.75.75 0 01-.174.707 5.46 5.46 0 01-1.216.96A3.995 3.995 0 0114 6v.5h1.25a.75.75 0 010 1.5H14V9h1.25a.75.75 0 010 1.5H14v.5a4 4 0 01-.083.78l1.166.96a.75.75 0 01.083 1.18.75.75 0 01-1.13-.025l-.976-.805A4 4 0 0110 14a4 4 0 01-3.06-1.415l-.976.805a.75.75 0 01-1.13.025.75.75 0 01.083-1.18l1.166-.96A4 4 0 016 10.5v-.5H4.75a.75.75 0 010-1.5H6V8H4.75a.75.75 0 010-1.5H6V6c0-.288.03-.57.087-.844a5.46 5.46 0 01-1.216-.96.75.75 0 01-.174-.707c.172-.63.453-1.217.822-1.736a.75.75 0 011.041-.177zM8 6v4.5a2 2 0 104 0V6a2 2 0 10-4 0z" clipRule="evenodd" />
      </svg>
    ),
  },
};

export function TicketTypeBadge({ type, size = 'md' }: TicketTypeBadgeProps) {
  const config = typeConfig[type];
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        config.className,
        sizeClasses[size]
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

export default { TicketStatusBadge, TicketTypeBadge };
