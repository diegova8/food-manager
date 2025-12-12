import { cn } from '../../../utils/cn';

interface UserRoleBadgeProps {
  isAdmin: boolean;
  size?: 'sm' | 'md';
}

export function UserRoleBadge({ isAdmin, size = 'md' }: UserRoleBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  if (isAdmin) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-semibold',
          'bg-purple-100 text-purple-700',
          sizeClasses[size]
        )}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Admin
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        'bg-slate-100 text-slate-600',
        sizeClasses[size]
      )}
    >
      Cliente
    </span>
  );
}

interface UserVerificationBadgeProps {
  verified: boolean;
  size?: 'sm' | 'md';
}

export function UserVerificationBadge({ verified, size = 'md' }: UserVerificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  if (verified) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-semibold',
          'bg-green-100 text-green-700',
          sizeClasses[size]
        )}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Verificado
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        'bg-amber-100 text-amber-700',
        sizeClasses[size]
      )}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      Pendiente
    </span>
  );
}

export default { UserRoleBadge, UserVerificationBadge };
