/* eslint-disable react-refresh/only-export-components */
import type { PaymentMethod } from '../types';

interface PaymentMethodIconProps {
  paymentMethod: PaymentMethod;
  className?: string;
}

export function PaymentMethodIcon({ paymentMethod, className = 'w-5 h-5' }: PaymentMethodIconProps) {
  const method: PaymentMethod = paymentMethod || 'sinpe';

  switch (method) {
    case 'sinpe':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'card':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case 'paypal':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 01-.794.679H7.72a.483.483 0 01-.477-.558L7.418 21h1.518l.95-6.02h1.385c4.678 0 7.75-2.203 8.796-6.502zm-2.96-5.09c.762.868.983 1.81.752 3.285-.019.123-.04.24-.062.36-.735 3.773-3.089 5.446-6.956 5.446H8.957c-.63 0-1.174.414-1.354 1.002l-.014-.002-.93 5.894H3.121a.051.051 0 01-.05-.06l2.598-16.51A.95.95 0 016.607 2h5.976c2.183 0 3.716.469 4.523 1.388z"/>
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
}

export function getPaymentMethodLabel(paymentMethod: PaymentMethod): string {
  switch (paymentMethod) {
    case 'sinpe':
      return 'SINPE Móvil';
    case 'card':
      return 'Tarjeta';
    case 'paypal':
      return 'PayPal';
    default:
      return paymentMethod;
  }
}
