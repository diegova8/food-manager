# Arquitectura del Sistema - Ceviche de mi Tata

Este documento describe la arquitectura técnica del proyecto, los patrones de diseño implementados y las decisiones técnicas importantes.

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Base de Datos](#base-de-datos)
- [Flujos de Datos](#flujos-de-datos)
- [Patrones de Diseño](#patrones-de-diseño)
- [Decisiones Técnicas](#decisiones-técnicas)

## Visión General

Ceviche de mi Tata es una aplicación web full-stack que permite:
- A clientes: explorar menú, hacer pedidos, registrarse
- A administradores: gestionar precios, ver pedidos, actualizar estados

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│           Frontend (Vercel)              │
│  React 19 + TypeScript + Tailwind CSS   │
└─────────────────┬───────────────────────┘
                  │ REST API
                  │
┌─────────────────▼───────────────────────┐
│     Backend (Vercel Serverless)         │
│    Node.js + Express-like handlers      │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌──────────┐
│MongoDB │  │  Resend  │  │  Vercel  │
│ Atlas  │  │  (Email) │  │   Blob   │
└────────┘  └──────────┘  └──────────┘
```

## Arquitectura de Alto Nivel

### Separación Frontend/Backend

El proyecto utiliza una arquitectura claramente separada:

```
food-manager/
├── src/          → Frontend (React SPA)
└── api/          → Backend (Serverless Functions)
```

**Ventajas:**
- ✅ Separación de responsabilidades
- ✅ Escalabilidad independiente
- ✅ Deploy independiente (si fuera necesario)
- ✅ Testing más fácil

### Modelo Serverless

El backend utiliza **Vercel Serverless Functions**:
- Cada archivo en `api/` es un endpoint independiente
- Escalado automático
- Pago por uso
- Sin gestión de servidores

## Frontend Architecture

### Estructura de Directorios

```
src/
├── components/      # Componentes reutilizables
│   ├── CatalogoCeviches.tsx
│   ├── MenuCeviches.tsx
│   ├── MatrizCostos.tsx
│   ├── CalculadoraPedidos.tsx
│   ├── CevicheCounter.tsx
│   └── ProtectedRoute.tsx
│
├── pages/          # Páginas/Rutas
│   ├── AdminPage.tsx
│   ├── CheckoutPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── OrdersManagementPage.tsx
│   ├── VerifyEmailPage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── ResetPasswordPage.tsx
│
├── context/        # React Context para estado global
│   └── CartContext.tsx
│
├── services/       # Comunicación con API
│   └── api.ts
│
├── utils/          # Funciones utilitarias
│   ├── utils.ts
│   └── jwt.ts
│
├── types.ts        # Definiciones de tipos TypeScript
├── App.tsx         # Componente raíz + rutas
└── main.tsx        # Entry point
```

### Patrón de Componentes

**Componentes de Presentación** (`components/`)
- Reutilizables
- Sin lógica de negocio compleja
- Reciben props
- Ejemplos: `CevicheCounter`, `MatrizCostos`

**Componentes de Página** (`pages/`)
- Asociados a rutas
- Contienen lógica de negocio
- Orquestan componentes
- Ejemplos: `CheckoutPage`, `AdminPage`

### Gestión de Estado

**Local State** (useState)
```typescript
// Para estado local a un componente
const [count, setCount] = useState(0);
```

**Context API** (CartContext)
```typescript
// Para estado compartido entre componentes
const { items, addItem, removeItem } = useCart();
```

**No se usa Redux** porque:
- La aplicación es relativamente simple
- Context API + hooks es suficiente
- Menos boilerplate

### Routing

React Router DOM v7 con routing declarativo:

```typescript
<Routes>
  <Route path="/menu" element={<MenuPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/admin" element={
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  } />
</Routes>
```

### Comunicación con API

Cliente API centralizado (`services/api.ts`):

```typescript
class ApiService {
  async login(username: string, password: string) { ... }
  async getConfig() { ... }
  async createOrder(orderData) { ... }
}

export const api = new ApiService();
```

**Ventajas:**
- Un solo lugar para configurar headers, auth, etc.
- Fácil de testear
- Tipos TypeScript compartidos

## Backend Architecture

### Estructura de Directorios

```
api/
├── auth/              # Autenticación
│   ├── login.ts
│   ├── register.ts
│   ├── verify-email.ts
│   ├── forgot-password.ts
│   └── reset-password.ts
│
├── config/            # Configuración de precios
│   └── index.ts
│
├── orders/            # Gestión de pedidos
│   ├── create.ts
│   ├── index.ts       # Listar pedidos
│   └── update-status.ts
│
├── lib/               # Código compartido
│   ├── mongodb.ts     # Conexión a MongoDB
│   ├── models.ts      # Modelos Mongoose
│   ├── auth.ts        # Utilidades de JWT/bcrypt
│   ├── email.ts       # Envío de emails
│   └── responses.ts   # Helpers de respuestas
│
├── middleware/        # Middleware
│   ├── auth.ts        # Verificación de JWT
│   ├── cors.ts        # CORS configuration
│   └── errorHandler.ts
│
├── schemas/           # Validación Zod
│   ├── auth.ts
│   └── order.ts
│
└── send-email.ts      # Endpoint genérico de email
```

### Patrón de Endpoints

Cada endpoint sigue este patrón:

```typescript
// api/resource/action.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../middleware/auth';
import { withCORS } from '../middleware/cors';
import connectDB from '../lib/mongodb';

async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Validar método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Conectar a DB
  await connectDB();

  // 3. Validar input (Zod)
  const validated = schema.parse(req.body);

  // 4. Lógica de negocio
  const result = await doSomething(validated);

  // 5. Responder
  return res.status(200).json({ success: true, data: result });
}

// 6. Exportar con middleware
export default withCORS(withAuth(handler));
```

### Modelos de Datos (Mongoose)

```typescript
// api/lib/models.ts

// Usuario
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  name: { type: String, required: true },
  phone: { type: String },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Configuración de precios
const ConfigSchema = new Schema({
  rawMaterials: { type: Map, of: Number },
  markup: { type: Number, default: 2.5 },
  customPrices: { type: Map, of: Number },
  updatedAt: { type: Date, default: Date.now }
});

// Pedido
const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [{ cevicheType: String, quantity: Number, price: Number }],
  total: { type: Number, required: true },
  personalInfo: {
    name: String,
    phone: String,
    email: String
  },
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'uber-flash']
  },
  paymentProof: String, // URL al blob storage
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});
```

### Autenticación y Autorización

**Flujo de Login:**
```
1. Cliente envía username + password
2. Backend verifica con bcrypt
3. Backend genera JWT token
4. Cliente guarda token en localStorage
5. Cliente incluye token en headers: "Authorization: Bearer <token>"
6. Backend verifica token en cada request protegido
```

**Middleware de autenticación:**
```typescript
// api/middleware/auth.ts
export function withAuth(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Inyectar usuario en request
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

### Validación con Zod

Todos los inputs se validan con Zod:

```typescript
// api/schemas/order.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    cevicheType: z.string(),
    quantity: z.number().min(1),
    price: z.number().positive()
  })),
  total: z.number().positive(),
  personalInfo: z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    email: z.string().email().optional()
  }),
  deliveryMethod: z.enum(['pickup', 'uber-flash']),
  notes: z.string().optional(),
  paymentProof: z.string() // base64 o URL
});
```

## Base de Datos

### MongoDB Atlas (Cloud)

**Colecciones:**
- `users` - Usuarios registrados
- `configs` - Configuración de precios (singleton)
- `orders` - Pedidos realizados
- `emailverifications` - Tokens de verificación de email

**Indexes:**
```typescript
// Optimización de queries
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ user: 1, createdAt: -1 });
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
```

### Connection Pooling

MongoDB mantiene un pool de conexiones:

```typescript
// api/lib/mongodb.ts
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn; // Reutilizar conexión existente
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
```

## Flujos de Datos

### Flujo de Pedido (Cliente → Admin)

```
┌──────────┐
│ Cliente  │
│ navega   │
│ menu     │
└────┬─────┘
     │ 1. Agrega items al carrito
     ▼
┌─────────────┐
│ CartContext │ (estado global)
└─────┬───────┘
      │ 2. Procede al checkout
      ▼
┌──────────────────┐
│ CheckoutPage     │
│ - Info personal  │
│ - Método entrega │
│ - Comprobante    │
└─────┬────────────┘
      │ 3. POST /api/orders/create
      ▼
┌──────────────────┐
│ Backend API      │
│ - Valida datos   │
│ - Guarda en DB   │
│ - Envía email    │
└─────┬────────────┘
      │ 4. Notificación
      ▼
┌──────────────────┐
│ Admin recibe     │
│ email + ve en    │
│ OrdersManagement │
└──────────────────┘
```

### Flujo de Autenticación

```
┌────────────┐
│ RegisterPage│
└─────┬──────┘
      │ 1. POST /api/auth/register
      ▼
┌─────────────────────┐
│ Backend crea user   │
│ Envía email verif   │
└─────┬───────────────┘
      │ 2. Click en link
      ▼
┌──────────────────┐
│ VerifyEmailPage  │
│ GET /verify?token│
└─────┬────────────┘
      │ 3. User verificado
      ▼
┌──────────────┐
│ LoginPage    │
│ POST /login  │
└─────┬────────┘
      │ 4. Recibe JWT
      ▼
┌──────────────────┐
│ localStorage     │
│ guarda token     │
└─────┬────────────┘
      │ 5. Requests con token
      ▼
┌──────────────────┐
│ Rutas protegidas │
│ (/admin, etc)    │
└──────────────────┘
```

## Patrones de Diseño

### 1. Repository Pattern (Implícito con Mongoose)

```typescript
// Los modelos Mongoose actúan como repositories
const user = await User.findOne({ email });
const orders = await Order.find({ status: 'pending' });
```

### 2. Middleware Pattern

```typescript
// Composición de middleware
export default withCORS(
  withRateLimit({ max: 5 })(
    withAuth(
      withValidation(schema)(handler)
    )
  )
);
```

### 3. Service Layer Pattern

```typescript
// api/lib/email.ts - Servicio de emails
export async function sendOrderConfirmation(order) {
  await resend.emails.send({ ... });
}

// Usado desde múltiples endpoints
await sendOrderConfirmation(newOrder);
```

### 4. Provider Pattern (Frontend)

```typescript
// CartContext provee estado global
<CartProvider>
  <App />
</CartProvider>

// Componentes consumen con hook
const { items, addItem } = useCart();
```

### 5. Composition Pattern

```typescript
// Componentes compuestos
<CheckoutPage>
  <PersonalInfoStep />
  <DeliveryMethodStep />
  <PaymentStep />
</CheckoutPage>
```

## Decisiones Técnicas

### ¿Por qué Vercel Serverless?

**Ventajas:**
- ✅ Sin gestión de servidores
- ✅ Escalado automático
- ✅ Deploy integrado con Git
- ✅ Gratis para proyectos pequeños

**Desventajas:**
- ❌ Cold starts (primera request lenta)
- ❌ Timeout de 10s por función
- ❌ No ideal para WebSockets (se puede con workarounds)

### ¿Por qué MongoDB?

**Ventajas:**
- ✅ Esquema flexible
- ✅ Fácil de escalar
- ✅ Atlas gratis (tier básico)
- ✅ Buen soporte de Mongoose

**Desventajas:**
- ❌ Menos estructura que SQL
- ❌ Joins complejos son difíciles

### ¿Por qué no usar un ORM SQL?

Para este proyecto:
- Datos no relacionales (pedidos son documentos)
- No hay joins complejos
- Mongoose + MongoDB es más simple para MVP

### ¿Por qué JWT en lugar de sesiones?

**JWT:**
- ✅ Stateless (sin sesiones en servidor)
- ✅ Funciona bien con serverless
- ✅ Fácil de escalar

**Sesiones:**
- ❌ Requieren almacenamiento en servidor
- ❌ Más complejo con serverless

### ¿Por qué Tailwind CSS?

- ✅ Utility-first → desarrollo rápido
- ✅ No hay CSS custom a mantener
- ✅ Purge automático → bundle pequeño
- ✅ Consistencia visual

## Consideraciones de Seguridad

### Implementadas

1. **Passwords hasheados** (bcrypt, 10 rounds)
2. **JWT con secret fuerte** (256-bit)
3. **Validación de inputs** (Zod)
4. **CORS configurado**
5. **Rate limiting** (en endpoints críticos)
6. **Variables de entorno** (no hardcodeadas)
7. **Sanitización de inputs**

### Pendientes (Ver IMPROVEMENT_ROADMAP.md)

- [ ] HTTPS obligatorio
- [ ] Rate limiting global
- [ ] Audit logs
- [ ] 2FA para admins
- [ ] Encriptación de datos sensibles
- [ ] CSRF protection

## Performance

### Frontend

- **Code splitting**: Por ruta (React.lazy)
- **Tree shaking**: Vite lo hace automáticamente
- **Minificación**: En build de producción
- **Caching**: Service Worker (futuro)

### Backend

- **Connection pooling**: MongoDB reutiliza conexiones
- **Indexes**: En campos frecuentemente consultados
- **Lazy loading**: Cargar solo lo necesario

### Optimizaciones Futuras

- [ ] CDN para assets
- [ ] Image optimization
- [ ] Server-side caching (Redis)
- [ ] GraphQL (en lugar de REST)

## Testing Strategy

### Actual

- ❌ Sin tests automatizados

### Recomendado

```
Frontend:
  - Unit tests (Vitest + Testing Library)
  - Component tests
  - E2E tests (Playwright)

Backend:
  - Unit tests (Vitest)
  - Integration tests (con MongoDB de prueba)
  - API tests (supertest)
```

Ver [IMPROVEMENT_ROADMAP.md](./IMPROVEMENT_ROADMAP.md) para el plan de testing.

## Escalabilidad

### Límites Actuales

- Vercel Free: 100 GB-hours/mes
- MongoDB Atlas Free: 512 MB storage
- Resend Free: 100 emails/día

### Cuándo migrar

**Indicadores:**
- \>100 pedidos/día
- \>1000 usuarios registrados
- \>500 MB en DB

**Opciones:**
- Upgrade a planes pagos
- Migrar a infraestructura propia (AWS/GCP)

## Diagrama de Arquitectura Completo

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                             │
│                    (Navegador Web)                          │
└─────────────┬───────────────────────────────────────────────┘
              │
              │ HTTPS
              ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL CDN                               │
│              (Static Assets + Routing)                      │
└─────────────┬───────────────────────────────────────────────┘
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
┌────────────┐  ┌──────────────────────────────────┐
│  Frontend  │  │     Backend (Serverless)         │
│  (React)   │  │                                  │
│            │  │  ┌────────────────────────────┐  │
│  - Pages   │  │  │ /api/auth/*                │  │
│  - Comps   │◀─┼──│ /api/orders/*              │  │
│  - Context │  │  │ /api/config/*              │  │
│  - Router  │  │  │ /api/send-email            │  │
└────────────┘  │  └────────────────────────────┘  │
                │            │ │ │                 │
                └────────────┼─┼─┼─────────────────┘
                             │ │ │
                ┌────────────┘ │ └────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌────────────┐  ┌──────────┐  ┌──────────┐
        │  MongoDB   │  │  Resend  │  │  Vercel  │
        │   Atlas    │  │  (Email) │  │   Blob   │
        │            │  │          │  │ (Images) │
        └────────────┘  └──────────┘  └──────────┘
```

## Referencias

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) (similar pattern)
- [MongoDB Best Practices](https://www.mongodb.com/docs/manual/administration/production-notes/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [React Documentation](https://react.dev)

---

**Última actualización**: 2025-11-19
**Mantenido por**: Equipo de desarrollo
