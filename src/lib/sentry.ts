import * as Sentry from '@sentry/react';

// Inicializar Sentry solo en producción o si hay DSN configurado
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.log('Sentry not initialized: No DSN provided');
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Porcentaje de transacciones a enviar (performance monitoring)
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Porcentaje de sesiones a grabar
    replaysSessionSampleRate: 0.1,

    // Porcentaje de sesiones con errores a grabar
    replaysOnErrorSampleRate: 1.0,

    // Ambiente
    environment: import.meta.env.PROD ? 'production' : 'development',

    // Filtrar errores de desarrollo
    beforeSend(event, hint) {
      // No enviar errores en desarrollo a menos que sea explícito
      if (!import.meta.env.PROD && !import.meta.env.VITE_SENTRY_DEBUG) {
        return null;
      }

      // Filtrar errores comunes del navegador que no son útiles
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignorar errores de extensiones del navegador
        if (error.message?.includes('chrome-extension://')) {
          return null;
        }
        // Ignorar errores de red temporal
        if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
          return null;
        }
      }

      return event;
    },
  });
}

// Helper para capturar errores manualmente
export function captureError(error: Error | string, context?: Record<string, unknown>) {
  if (context) {
    Sentry.setContext('custom', context);
  }

  if (typeof error === 'string') {
    Sentry.captureMessage(error, 'error');
  } else {
    Sentry.captureException(error);
  }
}

// Helper para capturar mensajes de info
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

// Helper para setear contexto de usuario
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

// Helper para limpiar contexto de usuario (logout)
export function clearUserContext() {
  Sentry.setUser(null);
}
