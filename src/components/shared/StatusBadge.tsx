import { Badge, type BadgeProps } from '../ui/Badge';

type StatusType = 'order' | 'ticket' | 'user';
type BadgeVariant = BadgeProps['variant'];

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const statusConfig: Record<StatusType, Record<string, StatusConfig>> = {
  order: {
    pending: { label: 'Pendiente', variant: 'warning' },
    confirmed: { label: 'Confirmado', variant: 'info' },
    ready: { label: 'Listo', variant: 'purple' },
    completed: { label: 'Completado', variant: 'success' },
    cancelled: { label: 'Cancelado', variant: 'danger' },
  },
  ticket: {
    open: { label: 'Abierto', variant: 'warning' },
    in_progress: { label: 'En Proceso', variant: 'info' },
    resolved: { label: 'Resuelto', variant: 'success' },
    closed: { label: 'Cerrado', variant: 'default' },
  },
  user: {
    verified: { label: 'Verificado', variant: 'success' },
    pending: { label: 'Pendiente', variant: 'warning' },
    admin: { label: 'Admin', variant: 'purple' },
    customer: { label: 'Cliente', variant: 'default' },
  },
};

export interface StatusBadgeProps {
  type: StatusType;
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  type,
  status,
  size = 'md',
  showDot = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[type]?.[status];

  if (!config) {
    return (
      <Badge variant="default" size={size} showDot={showDot} className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant={config.variant}
      size={size}
      showDot={showDot}
      className={className}
    >
      {config.label}
    </Badge>
  );
}
