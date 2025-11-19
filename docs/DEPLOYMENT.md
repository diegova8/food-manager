# Deployment Guide - Ceviche de mi Tata

Guía completa para hacer deployment de la aplicación en producción usando Vercel.

## 📋 Tabla de Contenidos

- [Prerequisitos](#prerequisitos)
- [Configuración Inicial](#configuración-inicial)
- [Deployment en Vercel](#deployment-en-vercel)
- [Configuración de Dominios](#configuración-de-dominios)
- [Variables de Entorno](#variables-de-entorno)
- [CI/CD Setup](#cicd-setup)
- [Post-Deployment](#post-deployment)
- [Monitoreo](#monitoreo)
- [Rollback](#rollback)
- [Troubleshooting](#troubleshooting)

## Prerequisitos

Antes de hacer deployment, asegúrate de tener:

### Cuentas Necesarias

- ✅ **GitHub Account** - Para el repositorio
- ✅ **Vercel Account** - Para hosting ([vercel.com](https://vercel.com))
- ✅ **MongoDB Atlas Account** - Para la base de datos ([mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas))
- ✅ **Resend Account** - Para envío de emails ([resend.com](https://resend.com))

### Herramientas Locales

```bash
# Vercel CLI (opcional pero recomendado)
npm install -g vercel

# Git
git --version  # Debe estar instalado
```

## Configuración Inicial

### 1. Preparar el Repositorio

```bash
# Asegúrate de que todo esté commiteado
git status

# Si hay cambios pendientes
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Verificar .gitignore

Asegúrate de que `.gitignore` incluya:

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.*.local

# Dependencies
node_modules/

# Build output
dist/
.vercel/

# Logs
*.log
npm-debug.log*
```

### 3. Verificar package.json

Asegúrate de que `package.json` tenga los scripts correctos:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

## Deployment en Vercel

### Opción 1: Deploy desde el Dashboard (Recomendado)

1. **Inicia sesión en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Haz login con GitHub

2. **Importa el proyecto**
   - Click en "Add New..." → "Project"
   - Selecciona tu repositorio de GitHub
   - Click en "Import"

3. **Configura el proyecto**

   **Framework Preset:** Vite

   **Build & Development Settings:**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

   **Root Directory:** ./

4. **NO despliegues todavía** - Primero configura las variables de entorno

### Opción 2: Deploy desde CLI

```bash
# Login a Vercel
vercel login

# Navega al directorio del proyecto
cd /path/to/food-manager

# Deploy
vercel

# Sigue las instrucciones:
# - Set up and deploy? Yes
# - Which scope? Tu cuenta
# - Link to existing project? No
# - Project name? ceviche-manager (o el que prefieras)
# - Directory? ./
# - Override settings? No
```

## Configuración de Dominios

### Dominio por Defecto

Vercel asigna automáticamente un dominio:
```
https://ceviche-manager.vercel.app
```

### Dominio Personalizado

1. **Compra un dominio** (ej: GoDaddy, Namecheap, Cloudflare)

2. **Añade el dominio en Vercel**
   - Ve a tu proyecto en Vercel
   - Settings → Domains
   - Click "Add"
   - Ingresa tu dominio: `cevichedemitata.app`

3. **Configura DNS**

   En tu proveedor de dominio, añade estos registros:

   **Para dominio raíz (cevichedemitata.app):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **Para www:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Espera la verificación** (puede tomar hasta 48 horas)

### SSL/HTTPS

Vercel provisiona automáticamente certificados SSL con Let's Encrypt. No requiere configuración adicional.

## Variables de Entorno

### Variables Requeridas

Configura estas variables en Vercel **ANTES** del primer deploy:

#### En el Dashboard de Vercel:

1. Ve a tu proyecto → Settings → Environment Variables

2. Añade las siguientes variables:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGODB_URI` | Connection string de MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key para JWT (mínimo 32 caracteres) | `your-super-secret-key-minimum-32-chars` |
| `RESEND_API_KEY` | API key de Resend | `re_xxxxxxxxxxxxxxxxx` |
| `ADMIN_EMAIL` | Email del administrador | `admin@cevichedemitata.app` |

3. **Importante:** Selecciona los environments:
   - ✅ Production
   - ✅ Preview (opcional)
   - ✅ Development (opcional)

#### Generar JWT_SECRET Seguro

```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 3: Online
# https://www.grc.com/passwords.htm
```

#### Configurar MongoDB Atlas para Vercel

1. **En MongoDB Atlas:**
   - Ve a tu cluster
   - Click "Network Access"
   - Click "Add IP Address"
   - Selecciona **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - Esto es necesario porque Vercel usa IPs dinámicas

2. **Connection String:**
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/ceviche-manager?retryWrites=true&w=majority
   ```

#### Verificar Configuración de Resend

1. Ve a [resend.com](https://resend.com) → API Keys
2. Crea una nueva API key si no tienes una
3. **Importante:** Verifica tu dominio en Resend para usar emails personalizados
   - Settings → Domains → Add Domain
   - Añade `mail.cevichedemitata.app`
   - Configura los registros DNS que te indiquen

### Configuración Vía CLI

```bash
# Production
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add RESEND_API_KEY production
vercel env add ADMIN_EMAIL production

# Preview
vercel env add MONGODB_URI preview

# Development
vercel env add MONGODB_URI development
```

## CI/CD Setup

### Automatic Deployments (Recomendado)

Una vez conectado con GitHub, Vercel automáticamente:

- ✅ **Deploy en Production** cuando haces push a `main`
- ✅ **Deploy Preview** cuando abres un Pull Request
- ✅ **Ejecuta builds** en cada commit

### Branch Strategy

```
main (production)
  ↓
  └── Pull Request → Preview Deployment
        ↓
        └── Merge → Production Deployment
```

### Configurar Branch Protection (Recomendado)

En GitHub:
1. Settings → Branches
2. Add rule para `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks (Vercel build)
   - ✅ Require branches to be up to date

### Custom Deployment Hooks

Puedes añadir scripts en `package.json`:

```json
{
  "scripts": {
    "vercel-build": "npm run build",
    "postbuild": "echo 'Build completed!'"
  }
}
```

## Post-Deployment

### 1. Verificar el Deploy

```bash
# Check deployment status
vercel ls

# Check logs
vercel logs <deployment-url>
```

### 2. Inicializar Base de Datos

Crea el usuario administrador:

```bash
# Localmente (apuntando a producción)
MONGODB_URI=<production-uri> npm run setup-admin
```

O corre el script directamente en producción (ver sección Scripts).

### 3. Smoke Tests

Verifica que todo funcione:

- [ ] ✅ El sitio carga: `https://cevichedemitata.app`
- [ ] ✅ Menú público se ve correctamente: `/menu`
- [ ] ✅ Login funciona: `/login`
- [ ] ✅ Panel admin accesible: `/admin`
- [ ] ✅ Crear pedido funciona
- [ ] ✅ Emails se envían correctamente
- [ ] ✅ Imágenes de comprobante se suben

### 4. Performance Check

```bash
# Lighthouse (via CLI)
npm install -g lighthouse
lighthouse https://cevichedemitata.app --view

# O usa: https://pagespeed.web.dev/
```

**Targets:**
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

### 5. SEO Configuration

Verifica en `index.html`:

```html
<!-- Meta tags -->
<title>Ceviche de mi Tata - EL Mejor Ceviche</title>
<meta name="description" content="...">

<!-- Open Graph -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://cevichedemitata.app/logo.png">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
```

**Google Search Console:**
1. Ve a [search.google.com/search-console](https://search.google.com/search-console)
2. Añade tu dominio
3. Verifica propiedad
4. Submit sitemap (si tienes)

## Monitoreo

### Vercel Analytics

Habilitado automáticamente en tu dashboard:
- Pageviews
- Top pages
- Top referrers
- Devices

### Error Tracking

**Logs en Vercel:**
```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de producción
vercel logs --prod
```

**Errores de Runtime:**
- Vercel → Proyecto → Deployments → Click en deployment → Runtime Logs

### Uptime Monitoring

Opciones gratuitas:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://www.pingdom.com)
- [Better Uptime](https://betteruptime.com)

Configura checks para:
- `https://cevichedemitata.app` (homepage)
- `https://cevichedemitata.app/api/config` (API health)

### Database Monitoring

**MongoDB Atlas:**
- Ve a tu cluster → Metrics
- Revisa:
  - Connections
  - Operations/second
  - Network traffic
  - Storage

**Alerts recomendados:**
- Conexiones > 80% del límite
- Storage > 400 MB (80% del free tier)

## Rollback

Si algo sale mal después de un deploy:

### Rollback Inmediato (Dashboard)

1. Ve a Vercel → Proyecto → Deployments
2. Encuentra el deployment anterior que funcionaba
3. Click en los tres puntos (•••)
4. Click "Promote to Production"

### Rollback vía CLI

```bash
# Ver deployments
vercel ls

# Promote un deployment anterior
vercel promote <deployment-url>
```

### Rollback vía Git

```bash
# Revertir el último commit
git revert HEAD
git push origin main

# Vercel automáticamente deployará el código revertido
```

## Troubleshooting

### Build Fails

**Error: "Command 'npm run build' exited with 1"**

```bash
# Verifica localmente
npm run build

# Revisa errores de TypeScript
npm run lint
```

**Solución:**
- Corrige los errores TypeScript/ESLint
- Commit y push

---

### "Cannot find module" en producción

**Causa:** Dependencia en `devDependencies` que debería estar en `dependencies`

**Solución:**
```bash
# Mueve la dependencia
npm install <package> --save

# Actualiza package.json
git add package.json package-lock.json
git commit -m "Fix: Move package to dependencies"
git push
```

---

### Environment variables no funcionan

**Síntomas:**
- API endpoints fallan
- "MONGODB_URI is not defined"

**Verificación:**
```bash
# Check que las variables estén configuradas
vercel env ls
```

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que todas las variables estén presentes
3. Click "Redeploy" (no "Rebuild")

---

### MongoDB Connection Timeout

**Error:** "MongoServerSelectionError: connection timed out"

**Causas comunes:**
1. IP de Vercel no permitida en MongoDB Atlas
2. Connection string incorrecto

**Solución:**
```bash
# 1. Verifica Network Access en MongoDB Atlas
# Debe tener: 0.0.0.0/0 (Allow from anywhere)

# 2. Verifica connection string
# Formato correcto:
mongodb+srv://<username>:<password>@cluster.mongodb.net/ceviche-manager?retryWrites=true&w=majority
```

---

### Cold Starts Lentos

**Síntoma:** Primera request después de inactividad tarda >5 segundos

**Causa:** Vercel serverless functions entran en "sleep" después de inactividad

**Soluciones:**
1. **Warm-up ping** (cron job externo)
   ```bash
   # Crea un cron en cron-job.org
   # URL: https://cevichedemitata.app/api/config
   # Frecuencia: cada 5 minutos
   ```

2. **Upgrade a Vercel Pro** (serverless functions no entran en sleep)

---

### 413 Payload Too Large

**Error al subir comprobante de pago**

**Vercel límites:**
- Body size: 4.5 MB (hobby plan)
- Serverless function: 50 MB (memory limit)

**Solución:**
```typescript
// Reducir calidad de imagen antes de upload
const compressImage = (file: File) => {
  // Usa canvas para resize/compress
  const maxWidth = 1200;
  const maxHeight = 1200;
  const quality = 0.8;
  // ...
};
```

---

### Emails no se envían

**Verificar:**
1. RESEND_API_KEY está configurado
2. Dominio verificado en Resend
3. Rate limits de Resend (100 emails/día en free tier)

**Logs:**
```bash
vercel logs --prod | grep -i "email"
```

## Mejores Prácticas

### Pre-Deployment Checklist

- [ ] Tests pasan (cuando implementes)
- [ ] Build local exitoso (`npm run build`)
- [ ] Linter pasa (`npm run lint`)
- [ ] Variables de entorno actualizadas en Vercel
- [ ] Base de datos respaldada
- [ ] Changelog actualizado

### Security Checklist

- [ ] ✅ Variables sensibles en environment variables (no en código)
- [ ] ✅ `.env.local` en `.gitignore`
- [ ] ✅ CORS configurado correctamente
- [ ] ✅ Rate limiting implementado
- [ ] ✅ JWT secret rotado regularmente
- [ ] ✅ HTTPS forzado (automático en Vercel)

### Performance Optimization

```typescript
// 1. Code splitting
const AdminPage = lazy(() => import('./pages/AdminPage'));

// 2. Image optimization
<img
  src="/logo.png"
  loading="lazy"
  width="200"
  height="200"
/>

// 3. Memoization
const expensiveCalculation = useMemo(() => {
  return calculateCosts(items);
}, [items]);
```

## Costos Estimados

### Free Tier Limits

**Vercel (Hobby):**
- ✅ Bandwidth: 100 GB/mes
- ✅ Builds: 6000 minutos/mes
- ✅ Serverless Functions: Ilimitadas
- ✅ Edge Functions: 100,000 invocations/día

**MongoDB Atlas (Free):**
- ✅ Storage: 512 MB
- ✅ RAM: Shared
- ✅ Conexiones: 500

**Resend (Free):**
- ✅ Emails: 3,000/mes
- ✅ Dominios: 1

### Cuándo actualizar a planes pagos

**Señales:**
- \>100 GB bandwidth/mes → Vercel Pro ($20/mes)
- \>500 MB storage → MongoDB Atlas Shared ($9/mes)
- \>3,000 emails/mes → Resend Pro ($20/mes)

## Scripts Útiles

### Deploy Staging + Production

```bash
# Deploy a preview
vercel

# Deploy a production
vercel --prod

# Specify branch
vercel --prod --branch main
```

### Environment Management

```bash
# Listar variables
vercel env ls

# Añadir variable
vercel env add VARIABLE_NAME

# Eliminar variable
vercel env rm VARIABLE_NAME

# Pull variables localmente
vercel env pull .env.local
```

## Recursos Adicionales

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Resend Documentation](https://resend.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## Soporte

¿Problemas con el deployment?

1. Revisa los logs: `vercel logs --prod`
2. Consulta esta guía
3. Busca en [Vercel Community](https://github.com/vercel/vercel/discussions)
4. Abre un issue en el repositorio

---

**Última actualización**: 2025-11-19

**Próximos pasos recomendados:**
1. Configurar monitoring de uptime
2. Implementar tests automatizados
3. Configurar staging environment
4. Añadir analytics (Google Analytics, Plausible, etc.)
