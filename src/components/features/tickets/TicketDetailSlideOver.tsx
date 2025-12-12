import { SlideOver, SlideOverSection, SlideOverFooter } from '../../ui/SlideOver';
import { Button } from '../../ui/Button';
import { UserAvatar } from '../../shared/UserAvatar';
import { TicketStatusBadge, TicketTypeBadge } from './TicketStatusBadges';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketType = 'suggestion' | 'bug';

interface Ticket {
  id: string;
  type: TicketType;
  title: string;
  description: string;
  status: TicketStatus;
  images?: string[];
  user?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  guestEmail?: string;
  guestName?: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketDetailSlideOverProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (ticketId: string, status: TicketStatus) => void;
  onDelete?: (ticket: Ticket) => void;
  isUpdating?: boolean;
}

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: 'Abierto' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'resolved', label: 'Resuelto' },
  { value: 'closed', label: 'Cerrado' },
];

export function TicketDetailSlideOver({
  ticket,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
  isUpdating = false,
}: TicketDetailSlideOverProps) {
  if (!ticket) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserName = () => {
    if (ticket.user) {
      return ticket.user.firstName
        ? `${ticket.user.firstName} ${ticket.user.lastName || ''}`
        : ticket.user.username;
    }
    return ticket.guestName || 'Anónimo';
  };

  const getUserEmail = () => {
    if (ticket.user) {
      return ticket.user.email;
    }
    return ticket.guestEmail || 'No disponible';
  };

  const isRegisteredUser = !!ticket.user;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={ticket.title}
      description={`#${ticket.id.slice(-8)}`}
    >
      <div className="space-y-6">
        {/* Status and Type */}
        <div className="flex flex-wrap items-center gap-3">
          <TicketTypeBadge type={ticket.type} />
          <TicketStatusBadge status={ticket.status} />
        </div>

        {/* User Information */}
        <SlideOverSection title="Información del Usuario">
          <div className="flex items-start gap-4">
            <UserAvatar name={getUserName()} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-800">{getUserName()}</p>
                {isRegisteredUser ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    Registrado
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    Invitado
                  </span>
                )}
              </div>
              <a
                href={`mailto:${getUserEmail()}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {getUserEmail()}
              </a>
              {isRegisteredUser && ticket.user?.username && (
                <p className="text-sm text-slate-500">@{ticket.user.username}</p>
              )}
            </div>
          </div>
        </SlideOverSection>

        {/* Description */}
        <SlideOverSection title="Descripción">
          <div className="bg-slate-50 rounded-xl p-4 text-slate-700 whitespace-pre-wrap">
            {ticket.description}
          </div>
        </SlideOverSection>

        {/* Images */}
        {ticket.images && ticket.images.length > 0 && (
          <SlideOverSection title={`Imágenes (${ticket.images.length})`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ticket.images.map((img, i) => (
                <a
                  key={i}
                  href={img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 group-hover:border-blue-400 transition-colors">
                    <img
                      src={img}
                      alt={`Imagen ${i + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </SlideOverSection>
        )}

        {/* System Information */}
        <SlideOverSection title="Información del Sistema">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              label="ID del Ticket"
              value={
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                  {ticket.id}
                </span>
              }
            />
            <InfoItem label="Fecha de Creación" value={formatDate(ticket.createdAt)} />
            <InfoItem label="Última Actualización" value={formatDate(ticket.updatedAt)} />
          </div>
        </SlideOverSection>

        {/* Status Change */}
        {onStatusChange && (
          <SlideOverSection title="Cambiar Estado">
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onStatusChange(ticket.id, option.value)}
                  disabled={isUpdating || ticket.status === option.value}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                    ticket.status === option.value
                      ? 'bg-blue-100 text-blue-700 cursor-default'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </SlideOverSection>
        )}
      </div>

      {/* Footer */}
      <SlideOverFooter>
        {onDelete && (
          <Button variant="danger" onClick={() => onDelete(ticket)}>
            Eliminar Ticket
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </SlideOverFooter>
    </SlideOver>
  );
}

// Helper component for info items
interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="text-slate-800 font-medium break-words">{value}</div>
    </div>
  );
}

export default TicketDetailSlideOver;
