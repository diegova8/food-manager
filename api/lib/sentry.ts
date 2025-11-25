import * as Sentry from '@sentry/node';
import type { VercelRequest } from '@vercel/node';

let isInitialized = false;

// Inicializar Sentry para serverless
export function initSentry() {
  if (isInitialized) return;

  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log('Sentry not initialized: No DSN provided');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Configuración específica para serverless
    beforeSend(event, hint) {
      // Filtrar errores que no son útiles
      const error = hint.originalException;

      if (error instanceof Error) {
        // Ignorar errores de conexión temporal
        if (error.message?.includes('ECONNRESET') || error.message?.includes('ETIMEDOUT')) {
          return null;
        }
      }

      return event;
    },
  });

  isInitialized = true;
}

// Capturar error con contexto de request
export function captureError(
  error: Error | string,
  req?: VercelRequest,
  context?: Record<string, unknown>
) {
  initSentry();

  // Agregar contexto del request
  if (req) {
    Sentry.setContext('request', {
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
      query: req.query,
    });
  }

  // Agregar contexto adicional
  if (context) {
    Sentry.setContext('custom', context);
  }

  // Capturar el error
  if (typeof error === 'string') {
    Sentry.captureMessage(error, 'error');
  } else {
    Sentry.captureException(error);
  }
}

// Capturar mensaje
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
) {
  initSentry();

  if (context) {
    Sentry.setContext('custom', context);
  }

  Sentry.captureMessage(message, level);
}

// Wrapper para funciones serverless con error tracking
export function withSentry<T>(handler: T): T {
  return (async (...args: unknown[]) => {
    initSentry();

    try {
      // @ts-expect-error - Generic handler
      return await handler(...args);
    } catch (error) {
      // Capturar el error antes de propagarlo
      captureError(
        error instanceof Error ? error : new Error(String(error)),
        args[0] as VercelRequest
      );
      throw error;
    }
  }) as T;
}

// Setear usuario en contexto
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

// Limpiar usuario
export function clearUserContext() {
  Sentry.setUser(null);
}
