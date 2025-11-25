# Configuración de Sentry - Monitoreo de Errores

Este documento explica cómo configurar Sentry para monitoreo de errores en producción.

## ¿Qué es Sentry?

Sentry es una plataforma de monitoreo de errores que te permite:
- Ver errores en tiempo real
- Obtener stack traces completos
- Monitorear performance
- Grabar sesiones de usuario cuando ocurren errores
- Recibir alertas cuando hay problemas

## Configuración Paso a Paso

### 1. Crear Cuenta en Sentry

1. Ve a [https://sentry.io/signup/](https://sentry.io/signup/)
2. Crea una cuenta gratuita (plan Developer)
3. El plan gratuito incluye:
   - 5,000 errores/mes
   - 10,000 transacciones de performance/mes
   - 50 sesiones de replay/mes
   - Retención de datos por 30 días

### 2. Crear Proyectos

Necesitas crear **DOS proyectos** en Sentry (uno para frontend, otro para backend):

#### Proyecto Frontend
1. En el dashboard de Sentry, click en "Create Project"
2. Selecciona "React" como plataforma
3. Nombre sugerido: `ceviche-manager-frontend`
4. Copia el **DSN** que te muestra (algo como `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

#### Proyecto Backend
1. Click en "Create Project" nuevamente
2. Selecciona "Node.js" como plataforma
3. Nombre sugerido: `ceviche-manager-backend`
4. Copia el **DSN** que te muestra

### 3. Configurar Variables de Entorno

#### Desarrollo Local (.env.local)

Agrega estas variables a tu archivo `.env.local`:

```bash
# Sentry Backend (Node.js)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Sentry Frontend (React)
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Opcional: Para probar Sentry en desarrollo
VITE_SENTRY_DEBUG=true
```

#### Producción (Vercel)

1. Ve a tu proyecto en Vercel Dashboard
2. Click en "Settings" → "Environment Variables"
3. Agrega las siguientes variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `SENTRY_DSN` | (DSN del backend) | Production, Preview, Development |
| `VITE_SENTRY_DSN` | (DSN del frontend) | Production, Preview, Development |

**Importante**: NO agregues `VITE_SENTRY_DEBUG` en producción.

### 4. Verificar Instalación

#### Verificar Frontend

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre la consola del navegador, deberías ver:
   ```
   Sentry not initialized: No DSN provided
   ```
   O si agregaste el DSN:
   ```
   (No hay mensaje - Sentry se inicializa silenciosamente)
   ```

3. Para probar un error, abre la consola y ejecuta:
   ```javascript
   throw new Error("Test error from console");
   ```

4. Ve a Sentry Dashboard → Issues, deberías ver el error aparecer en segundos.

#### Verificar Backend

El backend se inicializa automáticamente cuando hay un error. Para probar:

1. Haz deploy a Vercel o usa Vercel CLI localmente
2. Intenta hacer una petición que cause un error (ej: endpoint inexistente)
3. Ve a Sentry Dashboard del proyecto backend → Issues

### 5. Configuración Adicional (Opcional)

#### Filtros de Errores

Ambos sistemas (frontend y backend) ya tienen filtros configurados para:
- Ignorar errores de extensiones del navegador
- Ignorar errores de red temporal
- Ignorar errores en desarrollo (a menos que `VITE_SENTRY_DEBUG=true`)

#### Alertas de Email

1. En Sentry Dashboard → Settings → Alerts
2. Crea reglas de alerta, por ejemplo:
   - Enviar email cuando hay más de 10 errores en 1 hora
   - Notificar sobre errores nuevos no vistos
   - Alertar cuando el error rate sube 25%

#### Integración con Slack/Discord

1. Settings → Integrations
2. Conecta Slack o Discord
3. Configura alertas para enviar a canales específicos

### 6. Uso en el Código

#### Frontend

```typescript
import { captureError, captureMessage, setUserContext } from './lib/sentry';

// Capturar error manualmente
try {
  // código que puede fallar
} catch (error) {
  captureError(error, { context: 'additional data' });
}

// Capturar mensaje de info
captureMessage('Something important happened', 'info');

// Setear contexto de usuario (después del login)
setUserContext({
  id: user.id,
  email: user.email,
  username: user.username
});
```

#### Backend

```typescript
import { captureError } from '../lib/sentry.js';

// En un catch block
try {
  // código
} catch (error) {
  captureError(
    error instanceof Error ? error : new Error(String(error)),
    req,  // Request de Vercel
    { endpoint: 'nombre', additionalContext: 'data' }
  );
  throw error;
}
```

## Mejores Prácticas

### 1. Sample Rate en Producción

En `src/lib/sentry.ts` y `api/lib/sentry.ts` ya está configurado:
- **Production**: 10% de transacciones (para no exceder el límite gratuito)
- **Development**: 100% de transacciones (para testing)

### 2. Session Replay

El frontend captura:
- 10% de sesiones normales
- 100% de sesiones con errores

Esto te permite ver exactamente qué hizo el usuario antes del error.

### 3. Privacidad

Por defecto, Session Replay tiene configurado:
```typescript
maskAllText: true,      // Oculta todo el texto
blockAllMedia: true,    // Bloquea imágenes/videos
```

Esto protege la privacidad de los usuarios mientras aún puedes ver interacciones.

### 4. Release Tracking

Para versionar errores y saber en qué deploy ocurrió:

```bash
# En package.json, agrega script:
"sentry:release": "sentry-cli releases new $npm_package_version"
```

### 5. Source Maps

Para ver el código original en stack traces (no minificado):

1. Instala Sentry CLI:
   ```bash
   npm install --save-dev @sentry/cli
   ```

2. Configura en `vite.config.ts` (se puede hacer más adelante)

## Monitoreo y Métricas

### Dashboard Importante

En Sentry, revisa regularmente:
1. **Issues** → Errores nuevos y frecuentes
2. **Performance** → Transacciones lentas
3. **Releases** → Comparar estabilidad entre versiones
4. **Crons** (si usas jobs programados)

### Métricas Clave

- **Error rate**: % de peticiones con error
- **User impact**: Cuántos usuarios afectados
- **Frequency**: Qué tan seguido ocurre
- **First seen / Last seen**: Cuándo apareció/desapareció

## Troubleshooting

### "Sentry not initialized"

✅ **Normal**: Aparece cuando no hay DSN configurado. Sentry está deshabilitado.

### Errores no aparecen en Sentry

1. Verifica que el DSN esté correcto
2. Revisa la consola del navegador/logs
3. Verifica que `beforeSend` no esté filtrando el error
4. En desarrollo, asegúrate de tener `VITE_SENTRY_DEBUG=true`

### Demasiados errores / Cuota excedida

1. Ajusta `tracesSampleRate` a un valor menor (ej: 0.05 = 5%)
2. Mejora los filtros en `beforeSend`
3. Considera upgrade a plan de pago

## Recursos

- [Documentación oficial de Sentry](https://docs.sentry.io/)
- [React SDK](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Node.js SDK](https://docs.sentry.io/platforms/node/)
- [Best Practices](https://docs.sentry.io/product/best-practices/)

## Soporte

Si tienes problemas con Sentry:
1. Revisa [Status Page](https://status.sentry.io/)
2. Consulta [Community Forum](https://forum.sentry.io/)
3. Revisa logs en Vercel Dashboard
