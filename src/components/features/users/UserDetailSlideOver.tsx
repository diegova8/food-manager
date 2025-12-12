import { SlideOver, SlideOverSection, SlideOverFooter } from '../../ui/SlideOver';
import { Button } from '../../ui/Button';
import { UserAvatar } from '../../shared/UserAvatar';
import { UserRoleBadge, UserVerificationBadge } from './UserStatusBadges';

interface User {
  _id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface UserDetailSlideOverProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (user: User) => void;
}

export function UserDetailSlideOver({
  user,
  isOpen,
  onClose,
  onDelete,
}: UserDetailSlideOverProps) {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fullName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.username;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={fullName}
      description={`@${user.username}`}
    >
      <div className="space-y-6">
        {/* Avatar and Status */}
        <div className="flex items-center gap-4">
          <UserAvatar
            name={fullName}
            size="lg"
          />
          <div className="flex flex-wrap gap-2">
            <UserVerificationBadge verified={user.emailVerified} />
            <UserRoleBadge isAdmin={user.isAdmin} />
          </div>
        </div>

        {/* Personal Information */}
        <SlideOverSection title="Información Personal">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              label="Nombre"
              value={user.firstName || '-'}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <InfoItem
              label="Apellido"
              value={user.lastName || '-'}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <InfoItem
              label="Usuario"
              value={`@${user.username}`}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              }
            />
          </div>
        </SlideOverSection>

        {/* Contact Information */}
        <SlideOverSection title="Información de Contacto">
          <div className="space-y-4">
            <InfoItem
              label="Correo Electrónico"
              value={
                user.email ? (
                  <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
                    {user.email}
                  </a>
                ) : (
                  '-'
                )
              }
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              fullWidth
            />
            <InfoItem
              label="Teléfono"
              value={
                user.phone ? (
                  <a href={`tel:${user.phone}`} className="text-blue-600 hover:underline">
                    {user.phone}
                  </a>
                ) : (
                  '-'
                )
              }
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
              fullWidth
            />
          </div>
        </SlideOverSection>

        {/* System Information */}
        <SlideOverSection title="Información del Sistema">
          <div className="space-y-4">
            <InfoItem
              label="ID de Usuario"
              value={<span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{user._id}</span>}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
              fullWidth
            />
            <InfoItem
              label="Fecha de Registro"
              value={formatDate(user.createdAt)}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              fullWidth
            />
          </div>
        </SlideOverSection>
      </div>

      {/* Footer */}
      <SlideOverFooter>
        {onDelete && (
          <Button variant="danger" onClick={() => onDelete(user)}>
            Eliminar Usuario
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
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

function InfoItem({ label, value, icon, fullWidth }: InfoItemProps) {
  return (
    <div className={`flex items-start gap-3 ${fullWidth ? 'col-span-2' : ''}`}>
      {icon && (
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <div className="text-slate-800 font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

export default UserDetailSlideOver;
