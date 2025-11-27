# API Documentation - Ceviche de mi Tata

Documentación completa de todos los endpoints de la API REST.

## 📋 Tabla de Contenidos

- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Endpoints de Autenticación](#endpoints-de-autenticación)
- [Endpoints de Configuración](#endpoints-de-configuración)
- [Endpoints de Pedidos](#endpoints-de-pedidos)
- [Endpoints de Tickets de Soporte](#endpoints-de-tickets-de-soporte)
- [Endpoints de Gestión de Usuarios](#endpoints-de-gestión-de-usuarios)
- [Endpoints de Upload](#endpoints-de-upload)
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
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+50612345678",
  "address": "San José, Costa Rica",
  "birthday": "1990-01-15",
  "dietaryPreferences": "Alérgico al maíz",
  "marketingConsent": true
}
```

**Validaciones:**
- `email`: email válido, requerido
- `password`: mínimo 8 caracteres, debe incluir mayúscula, minúscula, número y carácter especial
- `firstName`: 2-50 caracteres, requerido
- `lastName`: 2-50 caracteres, requerido
- `phone`: formato E.164 (ej: +50612345678), requerido
- `address`: opcional, máximo 200 caracteres
- `birthday`: opcional, fecha ISO
- `dietaryPreferences`: opcional, máximo 500 caracteres
- `marketingConsent`: opcional, boolean (default: false)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "message": "Usuario registrado exitosamente. Por favor verifica tu email."
}
```

**Rate Limit:** 3 requests / hora

---

### POST /api/auth/login

Inicia sesión con username/email y contraseña.

**Request:**
```json
{
  "username": "john@example.com",
  "password": "SecurePass123!"
}
```

**Nota:** El campo `username` acepta tanto username como email.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "name": "John Doe",
      "isAdmin": false
    }
  },
  "message": "Login exitoso"
}
```

**Rate Limit:** 5 requests / 15 minutos

---

### POST /api/auth/verify-email

Verifica el email del usuario con el token enviado por correo.

**Request:**
```json
{
  "token": "abc123def456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verificado exitosamente"
}
```

**Rate Limit:** 10 requests / hora

---

### POST /api/auth/forgot-password

Solicita un enlace de recuperación de contraseña.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Si el email existe, recibirás un enlace de recuperación"
}
```

**Nota:** Por seguridad, siempre devuelve éxito incluso si el email no existe.

**Rate Limit:** 3 requests / 5 minutos

---

### POST /api/auth/reset-password

Restablece la contraseña usando el token de recuperación.

**Request:**
```json
{
  "token": "xyz789abc123",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

### GET /api/auth/verify

Verifica si el token JWT es válido.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

---

### GET /api/auth/profile

Obtiene el perfil del usuario autenticado.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+50612345678",
    "address": "San José, Costa Rica",
    "birthday": "1990-01-15",
    "dietaryPreferences": "Alérgico al maíz",
    "marketingConsent": true,
    "isAdmin": false,
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Rate Limit:** 20 requests / minuto

---

### PUT /api/auth/profile

Actualiza el perfil del usuario autenticado.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+50612345678",
  "address": "San José, Costa Rica",
  "birthday": "1990-01-15",
  "dietaryPreferences": "Alérgico al maíz y camarón",
  "marketingConsent": false
}
```

**Todos los campos son opcionales.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+50612345678",
      "address": "San José, Costa Rica",
      "birthday": "1990-01-15",
      "dietaryPreferences": "Alérgico al maíz y camarón",
      "marketingConsent": false,
      "isAdmin": false
    }
  },
  "message": "Perfil actualizado exitosamente"
}
```

**Nota:** Devuelve un nuevo token JWT con la información actualizada.

**Rate Limit:** 20 requests / minuto

---

## Endpoints de Configuración

### GET /api/config

Obtiene la configuración de precios actual (público).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rawMaterials": {
      "pescado": 5000,
      "camaron": 8000,
      "pulpo": 12000,
      "piangua": 10000,
      "olores": 500,
      "jugoLimon": 800,
      "jugoNaranja": 800,
      "sal": 100,
      "azucar": 200,
      "envase": 1000
    },
    "markup": 1.5,
    "customPrices": {
      "Ceviche de Pescado": 7500,
      "Ceviche de Camarón": 12000
    }
  }
}
```

---

### PUT /api/config

Actualiza la configuración de precios (solo admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "rawMaterials": {
    "pescado": 5500,
    "camaron": 8500,
    ...
  },
  "markup": 1.6,
  "customPrices": {
    "Ceviche de Pescado": 8000
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Configuración actualizada"
}
```

**Rate Limit:** 20 requests / minuto

---

## Endpoints de Pedidos

### POST /api/orders/create

Crea un nuevo pedido (guest o autenticado).

**Headers (opcional):**
```http
Authorization: Bearer <token>  # Si está autenticado
```

**Request:**
```json
{
  "items": [
    {
      "cevicheType": "Ceviche de Pescado",
      "quantity": 2,
      "price": 7500
    }
  ],
  "total": 15000,
  "personalInfo": {
    "name": "John Doe",
    "phone": "+50612345678",
    "email": "john@example.com"
  },
  "deliveryMethod": "pickup",
  "scheduledDate": "2024-12-25T14:00:00.000Z",
  "notes": "Sin cebolla",
  "paymentProof": "https://blob.vercel-storage.com/..."
}
```

**Validaciones:**
- `items`: array no vacío, cada item requiere cevicheType, quantity (1-100), price
- `total`: número positivo
- `personalInfo.name`: 2-100 caracteres
- `personalInfo.phone`: formato E.164
- `personalInfo.email`: opcional, email válido
- `deliveryMethod`: "pickup" o "uber-flash"
- `scheduledDate`: fecha futura
- `notes`: opcional, máximo 500 caracteres
- `paymentProof`: URL válida, requerida

**Response (201):**
```json
{
  "success": true,
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "status": "pending"
  },
  "message": "Pedido creado exitosamente"
}
```

**Rate Limit:** 5 requests / hora

---

### GET /api/orders

Lista todos los pedidos (solo admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status`: (opcional) "pending" | "confirmed" | "ready" | "completed" | "cancelled"
- `limit`: (opcional) número de resultados (default: 50)
- `offset`: (opcional) offset para paginación (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [ ... ],
    "totalCount": 100,
    "limit": 50,
    "offset": 0
  }
}
```

---

### GET /api/orders/my-orders

Lista los pedidos del usuario autenticado.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: (opcional) filtrar por estado
- `limit`: (opcional) número de resultados
- `offset`: (opcional) offset para paginación

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [ ... ],
    "totalCount": 10
  }
}
```

---

### GET /api/orders/:id

Obtiene un pedido específico.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439011",
      "items": [ ... ],
      "total": 15000,
      "deliveryMethod": "pickup",
      "scheduledDate": "2024-12-25T14:00:00.000Z",
      "notes": "Notas:\nSin cebolla\n\nPreferencias Alimentarias:\nAlérgico al maíz",
      "paymentProof": "https://...",
      "status": "pending",
      "createdAt": "2024-12-20T10:00:00.000Z",
      "updatedAt": "2024-12-20T10:00:00.000Z"
    }
  }
}
```

**Nota:** El campo `notes` ahora incluye automáticamente las preferencias alimentarias del usuario si están configuradas.

---

### PUT /api/orders/update-status

Actualiza el estado de un pedido (solo admin).

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

**Status válidos:**
- `pending`: Pedido recibido, esperando verificación
- `confirmed`: Pedido confirmado y en preparación
- `ready`: Pedido listo para entrega/pickup
- `completed`: Pedido entregado
- `cancelled`: Pedido cancelado

**Response (200):**
```json
{
  "success": true,
  "data": {
    "order": { ... }
  },
  "message": "Estado del pedido actualizado"
}
```

---

### DELETE /api/orders/delete

Elimina un pedido (solo admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "orderId": "507f1f77bcf86cd799439011"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "507f1f77bcf86cd799439011"
  },
  "message": "Pedido eliminado"
}
```

---

### DELETE /api/orders/bulk-delete

Elimina múltiples pedidos (solo admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "orderIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deletedCount": 2
  },
  "message": "2 pedidos eliminados exitosamente"
}
```

---

## Endpoints de Tickets de Soporte

### POST /api/tickets/create

Crea un ticket de soporte (guest o autenticado).

**Headers (opcional):**
```http
Authorization: Bearer <token>  # Si está autenticado
```

**Request:**
```json
{
  "type": "bug",
  "title": "Error al procesar pago",
  "description": "Cuando intento subir el comprobante, aparece un error...",
  "images": [
    "https://blob.vercel-storage.com/screenshot1.png",
    "https://blob.vercel-storage.com/screenshot2.png"
  ],
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Validaciones:**
- `type`: "suggestion" o "bug", requerido
- `title`: 3-200 caracteres, requerido
- `description`: 10-2000 caracteres, requerido
- `images`: opcional, array de URLs (máximo 5)
- `email`: opcional si autenticado, requerido si guest
- `name`: opcional si autenticado, requerido si guest

**Response (201):**
```json
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439011",
    "type": "bug",
    "title": "Error al procesar pago",
    "status": "open"
  },
  "message": "Ticket creado exitosamente"
}
```

**Rate Limit:** 5 requests / hora

---

### GET /api/tickets

Lista todos los tickets (solo admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status`: (opcional) "open" | "in_progress" | "resolved" | "closed"
- `type`: (opcional) "suggestion" | "bug"
- `page`: (opcional) número de página (default: 1)
- `limit`: (opcional) resultados por página (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### GET /api/tickets/my-tickets

Lista los tickets del usuario autenticado.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: (opcional) filtrar por estado
- `type`: (opcional) filtrar por tipo
- `page`: (opcional) número de página
- `limit`: (opcional) resultados por página

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "507f1f77bcf86cd799439011",
        "type": "bug",
        "title": "Error al procesar pago",
        "description": "...",
        "status": "open",
        "images": [ ... ],
        "createdAt": "2024-12-20T10:00:00.000Z",
        "updatedAt": "2024-12-20T10:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### PUT /api/tickets/update-status

Actualiza el estado de un ticket (solo admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "ticketId": "507f1f77bcf86cd799439011",
  "status": "in_progress"
}
```

**Status válidos:**
- `open`: Ticket abierto, sin asignar
- `in_progress`: Ticket en proceso de resolución
- `resolved`: Ticket resuelto
- `closed`: Ticket cerrado

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ticket": { ... }
  },
  "message": "Estado del ticket actualizado"
}
```

---

### DELETE /api/tickets/bulk-delete

Elimina múltiples tickets (solo admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "ticketIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deletedCount": 2
  },
  "message": "2 tickets eliminados exitosamente"
}
```

---

## Endpoints de Gestión de Usuarios

### GET /api/users

Lista todos los usuarios (solo admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `search`: (opcional) buscar por nombre, email, username, teléfono
- `emailVerified`: (opcional) true/false
- `isAdmin`: (opcional) true/false
- `limit`: (opcional) resultados por página (default: 50)
- `offset`: (opcional) offset para paginación (default: 0)
- `sortBy`: (opcional) campo para ordenar (default: "createdAt")
- `sortOrder`: (opcional) "asc" o "desc" (default: "desc")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "username": "johndoe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+50612345678",
        "address": "San José",
        "birthday": "1990-01-15",
        "dietaryPreferences": "Alérgico al maíz",
        "emailVerified": true,
        "isAdmin": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalCount": 100,
    "limit": 50,
    "offset": 0
  }
}
```

---

### DELETE /api/users/bulk-delete

Elimina múltiples usuarios (solo admin).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "userIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deletedCount": 2
  },
  "message": "2 usuarios eliminados exitosamente"
}
```

---

## Endpoints de Upload

### POST /api/upload/client-token

Obtiene un token de Vercel Blob para upload directo desde el cliente.

**Request:**
```json
{
  "filename": "payment-proof.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "uploadToken": "abc123...",
    "uploadUrl": "https://blob.vercel-storage.com/upload"
  }
}
```

**Rate Limit:** 10 requests / hora

---

## Endpoint de Email

### POST /api/send-email

Envía un email personalizado (uso interno).

**Headers:**
```http
Authorization: Bearer <token>
```

**Request:**
```json
{
  "email": "recipient@example.com",
  "subject": "Asunto del email",
  "html": "<h1>Contenido HTML</h1>"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "email-id-123"
  },
  "message": "Email enviado exitosamente"
}
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos de entrada inválidos |
| 401 | Unauthorized - Token inválido o ausente |
| 403 | Forbidden - No tiene permisos (ej: no es admin) |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: email ya existe) |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

---

## Rate Limiting

La API implementa rate limiting por endpoint para prevenir abuso:

| Endpoint | Límite |
|----------|--------|
| POST /auth/register | 3 req / hora |
| POST /auth/login | 5 req / 15 min |
| POST /auth/verify-email | 10 req / hora |
| POST /auth/forgot-password | 3 req / 5 min |
| PUT /auth/profile | 20 req / min |
| GET /auth/profile | 20 req / min |
| POST /orders/create | 5 req / hora |
| POST /tickets/create | 5 req / hora |
| POST /upload/* | 10 req / hora |
| PUT /config | 20 req / min |

**Cuando se excede el límite:**
- Status Code: 429
- Header `Retry-After`: segundos hasta que pueda reintentar
- Error message indica cuándo puede reintentar

**Ejemplo de respuesta:**
```json
{
  "success": false,
  "error": "Too many requests. Please try again in 45 seconds."
}
```

---

## Nuevas Características

### Marketing Consent
Los usuarios pueden optar por recibir emails de marketing durante el registro o actualizar su preferencia en el perfil.

### Dietary Preferences
Los usuarios pueden especificar restricciones alimentarias que se agregan automáticamente a las notas de sus pedidos.

### WhatsApp Integration
Los enlaces de WhatsApp en la página de detalle del pedido incluyen un mensaje predefinido con el número de orden:
```
"Hola! acabo de hacer un pedido, el numero de orden es #[orderId]"
```

### Bulk Operations
Los administradores pueden eliminar múltiples pedidos, tickets o usuarios simultáneamente.

---

**Última actualización:** 2025-11-27
