# API Documentation - Ceviche de mi Tata

Documentación completa de todos los endpoints de la API REST.

## 📋 Tabla de Contenidos

- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Endpoints de Autenticación](#endpoints-de-autenticación)
- [Endpoints de Configuración](#endpoints-de-configuración)
- [Endpoints de Pedidos](#endpoints-de-pedidos)
- [Endpoint de Email](#endpoint-de-email)
- [Códigos de Error](#códigos-de-error)
- [Rate Limiting](#rate-limiting)

## Información General

### Base URL

**Desarrollo:**
```
http://localhost:3000/api
```

**Producción:**
```
https://cevichedemitata.app/api
```

### Headers Comunes

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>  # Solo para rutas protegidas
```

### Formato de Respuestas

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "error": "Error message",
  "errorId": "abc123"  # Solo en errores 500
}
```

## Autenticación

La API usa **JWT (JSON Web Tokens)** para autenticación.

### Flujo de Autenticación

1. Usuario hace login con credenciales
2. API devuelve un JWT token
3. Cliente guarda el token (localStorage)
4. Cliente incluye el token en requests subsecuentes

### Usar el Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expiración

Los tokens JWT expiran después de **7 días**.

## Endpoints de Autenticación

### POST /api/auth/register

Registra un nuevo usuario.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+50612345678"
}
```

**Validaciones:**
- `username`: 3-30 caracteres, alfanumérico + guión bajo
- `email`: email válido
- `password`: mínimo 8 caracteres, debe incluir mayúscula, minúscula, número y carácter especial
- `name`: 2-100 caracteres
- `phone`: formato internacional

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Usuario registrado. Por favor verifica tu email.",
  "data": {
    "userId": "507f1f77bcf86cd799439011"
  }
}
```

**Errores:**
- `422` - Validación fallida
- `409` - Usuario/email ya existe
- `500` - Error del servidor

---

### POST /api/auth/verify-email

Verifica el email del usuario.

**Request:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verificado exitosamente"
}
```

**Errores:**
- `400` - Token inválido o expirado
- `404` - Token no encontrado

---

### POST /api/auth/login

Inicia sesión de usuario.

**Request:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "name": "John Doe",
      "isAdmin": false,
      "isVerified": true
    }
  }
}
```

**Errores:**
- `401` - Credenciales inválidas
- `403` - Email no verificado
- `422` - Validación fallida

**Rate Limit:** 5 intentos por 15 minutos

---

### GET /api/auth/verify

Verifica si un token JWT es válido.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "isAdmin": false
    }
  }
}
```

**Errores:**
- `401` - Token inválido o expirado

---

### POST /api/auth/forgot-password

Solicita restablecimiento de contraseña.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Si el email existe, se envió un link de recuperación"
}
```

**Nota:** Por seguridad, siempre devuelve éxito incluso si el email no existe.

**Rate Limit:** 3 intentos por 15 minutos

---

### POST /api/auth/reset-password

Restablece la contraseña.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente"
}
```

**Errores:**
- `400` - Token inválido o expirado
- `422` - Password no cumple requisitos

---

## Endpoints de Configuración

### GET /api/config

Obtiene la configuración de precios actual (público).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "rawMaterials": {
      "pescado": 7,
      "pulpo": 11,
      "camaron": 10.5,
      "mixto": 7.5,
      "calamar": 9,
      "caracol": 11.5,
      "chicharron": 3,
      "jugolim": 13,
      "jugonar": 11.5,
      "sal": 2,
      "azucar": 1.8,
      "olores": 1.5,
      "piangua": 8,
      "envase": 0.9
    },
    "markup": 2.5,
    "customPrices": {
      "pescado": 7000,
      "camaron": 10500
    }
  }
}
```

---

### PUT /api/config

Actualiza la configuración de precios (requiere autenticación de admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "rawMaterials": {
    "pescado": 7.5,
    "camaron": 11
  },
  "markup": 2.8,
  "customPrices": {
    "pescado": 7500
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Configuración actualizada",
  "data": {
    "rawMaterials": { ... },
    "markup": 2.8,
    "customPrices": { ... }
  }
}
```

**Errores:**
- `401` - No autenticado
- `403` - No es administrador
- `422` - Validación fallida

---

## Endpoints de Pedidos

### POST /api/orders/create

Crea un nuevo pedido.

**Request:**
```json
{
  "items": [
    {
      "cevicheType": "pescado",
      "quantity": 2,
      "price": 7000
    },
    {
      "cevicheType": "camaron",
      "quantity": 1,
      "price": 10500
    }
  ],
  "total": 24500,
  "personalInfo": {
    "name": "John Doe",
    "phone": "+50612345678",
    "email": "john@example.com"
  },
  "deliveryMethod": "pickup",
  "notes": "Sin cebolla por favor",
  "paymentProof": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

**Validaciones:**
- `items`: al menos 1 item
- `quantity`: mínimo 1, máximo 100 por item
- `price`: número positivo
- `total`: número positivo
- `personalInfo.name`: 2-100 caracteres
- `personalInfo.phone`: formato internacional
- `deliveryMethod`: 'pickup' o 'uber-flash'
- `notes`: máximo 500 caracteres (opcional)
- `paymentProof`: base64 string o URL

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Pedido creado exitosamente",
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "status": "pending"
  }
}
```

**Errores:**
- `422` - Validación fallida
- `413` - Imagen demasiado grande (>5MB)
- `500` - Error al guardar

**Nota:** El endpoint automáticamente:
- Sube la imagen a Vercel Blob
- Envía email de confirmación al cliente
- Envía notificación al admin

---

### GET /api/orders

Lista pedidos (requiere autenticación de admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (opcional): filtrar por estado ('pending', 'confirmed', 'ready', 'completed', 'cancelled')
- `limit` (opcional): número de resultados (default: 50)
- `offset` (opcional): offset para paginación (default: 0)

**Ejemplos:**
```
GET /api/orders
GET /api/orders?status=pending
GET /api/orders?status=completed&limit=20&offset=40
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "items": [...],
        "total": 24500,
        "personalInfo": {
          "name": "John Doe",
          "phone": "+50612345678",
          "email": "john@example.com"
        },
        "deliveryMethod": "pickup",
        "paymentProof": "https://blob.vercel-storage.com/...",
        "status": "pending",
        "notes": "Sin cebolla",
        "createdAt": "2025-11-19T10:30:00.000Z",
        "updatedAt": "2025-11-19T10:30:00.000Z"
      }
    ],
    "totalCount": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

**Errores:**
- `401` - No autenticado
- `403` - No es administrador

---

### PUT /api/orders/update-status

Actualiza el estado de un pedido (requiere autenticación de admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "status": "confirmed"
}
```

**Estados válidos:**
- `pending` - Pendiente de confirmación
- `confirmed` - Confirmado por el admin
- `ready` - Listo para entrega/pickup
- `completed` - Completado
- `cancelled` - Cancelado

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Estado actualizado",
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "status": "confirmed"
  }
}
```

**Errores:**
- `401` - No autenticado
- `403` - No es administrador
- `404` - Pedido no encontrado
- `422` - Estado inválido

**Nota:** Actualizar el estado envía un email de notificación al cliente.

---

## Endpoint de Email

### POST /api/send-email

Envía un email genérico.

**Request:**
```json
{
  "email": "customer@example.com",
  "subject": "Bienvenido a Ceviche de mi Tata",
  "html": "<h1>Bienvenido!</h1><p>Gracias por registrarte.</p>"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email enviado exitosamente",
  "data": {
    "id": "resend-email-id"
  }
}
```

**Errores:**
- `422` - Email inválido
- `500` - Error al enviar

**Nota:** Este endpoint no requiere autenticación actualmente. Para producción, considerar añadir auth o rate limiting más estricto.

Ver [EMAIL_ENDPOINT_USAGE.md](./EMAIL_ENDPOINT_USAGE.md) para ejemplos de uso.

---

## Códigos de Error

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Request malformado o inválido |
| 401 | Unauthorized | No autenticado o token inválido |
| 403 | Forbidden | Autenticado pero sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 405 | Method Not Allowed | Método HTTP no permitido |
| 409 | Conflict | Conflicto (ej: email ya existe) |
| 413 | Payload Too Large | Archivo/request demasiado grande |
| 422 | Unprocessable Entity | Validación fallida |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

## Rate Limiting

Algunos endpoints tienen rate limiting para prevenir abuso:

| Endpoint | Límite |
|----------|--------|
| POST /api/auth/login | 5 requests / 15 minutos |
| POST /api/auth/register | 3 requests / 60 minutos |
| POST /api/auth/forgot-password | 3 requests / 15 minutos |
| POST /api/send-email | Sin límite (considerar añadir) |

**Comportamiento:**
- Las requests que excedan el límite reciben `429 Too Many Requests`
- El contador se resetea después del tiempo especificado
- El límite es por IP address

## Ejemplos de Uso

### JavaScript/Fetch

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'johndoe',
    password: 'SecurePass123!'
  })
});

const data = await response.json();

if (data.success) {
  localStorage.setItem('token', data.data.token);
}
```

```javascript
// Request autenticado
const token = localStorage.getItem('token');

const response = await fetch('/api/orders', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const orders = await response.json();
```

### cURL

```bash
# Login
curl -X POST https://cevichedemitata.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"SecurePass123!"}'

# Request con auth
curl -X GET https://cevichedemitata.app/api/orders \
  -H "Authorization: Bearer <token>"
```

### TypeScript (usando el cliente API)

```typescript
import { api } from './services/api';

// Login
const { token, user } = await api.login('johndoe', 'SecurePass123!');

// Crear pedido
const order = await api.createOrder({
  items: [{ cevicheType: 'pescado', quantity: 2, price: 7000 }],
  total: 14000,
  personalInfo: {
    name: 'John Doe',
    phone: '+50612345678'
  },
  deliveryMethod: 'pickup',
  paymentProof: base64Image
});
```

## Webhooks (Futuro)

Actualmente no hay webhooks implementados. En futuras versiones se podría implementar:

- Notificación cuando un nuevo pedido es creado
- Notificación cuando un pedido cambia de estado
- Webhooks de Resend para tracking de emails

## Versionado de API

Actualmente: **v1** (implícito, sin prefijo de versión)

Futuras versiones usarán:
- `/api/v2/...`
- `/api/v3/...`

## Testing de la API

### Herramientas Recomendadas

- **Postman** - Crear colecciones de requests
- **Insomnia** - Cliente REST alternativo
- **Thunder Client** - Extensión de VS Code
- **httpie** - Cliente CLI amigable

### Colección de Postman

(Próximamente: Link a colección compartida)

## Soporte

Para reportar problemas con la API:

1. Revisa esta documentación
2. Verifica los logs en Vercel
3. Crea un issue en GitHub

## Changelog

### 2025-11-19
- ✅ Documentación inicial de API
- ✅ Todos los endpoints documentados
- ✅ Ejemplos de uso añadidos

---

**Última actualización**: 2025-11-19
