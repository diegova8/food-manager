# Sistema de Referidos - Ceviche de mi Tata

## Resumen Ejecutivo

Sistema de referidos que permite a los usuarios compartir un link personalizado para invitar amigos. Los puntos se acumulan según las acciones del referido:

| Acción del Referido | Puntos para el Referidor |
|---------------------|--------------------------|
| Solo hace pedido (invitado) | 0.5 pts |
| Solo se registra | 0.5 pts |
| Se registra Y hace pedido | 1 pt |

**Valor de puntos:** 1 punto = ₡500

**Canje:** Mínimo 10 puntos (₡5,000) para aplicar descuento

**Tope:** Máximo 50% de descuento por orden

---

## Flujo del Usuario

### 1. Obtener Link de Referido

```
Usuario registrado → Mi Perfil → Sección "Mis Referidos" → Copiar Link
```

**Link formato:** `https://cevichedemitata.com/r/ABC123`

Donde `ABC123` es el código único del usuario.

### 2. Compartir Link

El usuario puede:
- Copiar link al portapapeles
- Compartir directo a WhatsApp (botón dedicado)
- Compartir en otras redes (Facebook, Instagram stories, etc.)

### 3. Amigo Accede al Link

Cuando alguien accede al link:
1. Se guarda el código de referido en `localStorage`
2. Se redirige al menú principal
3. El código se auto-completa en registro o checkout

### 4. Escenarios de Puntos

#### Escenario A: Invitado hace pedido (no se registra)
```
1. Juan accede via link de María (ABC123)
2. Juan hace pedido como invitado, código ABC123 se aplica
3. María gana 0.5 pts
4. Se guarda email/teléfono de Juan para tracking
```

#### Escenario B: Usuario se registra (no hace pedido aún)
```
1. Juan accede via link de María (ABC123)
2. Juan se registra con código ABC123
3. María gana 0.5 pts
4. Juan queda marcado como referido de María
```

#### Escenario C: Invitado hace pedido, luego se registra
```
1. Juan hace pedido como invitado con código ABC123
   → María gana 0.5 pts
2. Días después, Juan se registra con mismo email/teléfono
   → Sistema detecta pedido previo automáticamente
   → María gana 0.5 pts adicionales (total: 1 pt)
   → Juan queda vinculado como referido de María
```

#### Escenario D: Usuario se registra, luego hace pedido
```
1. Juan se registra con código ABC123
   → María gana 0.5 pts
2. Juan hace su primer pedido
   → María gana 0.5 pts adicionales (total: 1 pt)
```

### 5. Usar Puntos

```
1. Usuario va al checkout
2. Ve sus puntos disponibles: "Tienes 15 pts (₡7,500)"
3. Elige cuántos usar (mínimo 10)
4. Descuento se aplica (máximo 50% del total)
```

---

## Reglas de Negocio

### Acumulación de Puntos

| Regla | Descripción |
|-------|-------------|
| Primer pedido guest | Solo el PRIMER pedido de un invitado (por email/teléfono) otorga puntos |
| Un solo referidor | Una persona solo puede ser referida por UN usuario |
| No auto-referido | No puedes usar tu propio código |
| Verificación | El referidor debe tener email verificado para acumular puntos |

### Uso de Puntos

| Regla | Valor |
|-------|-------|
| Valor por punto | ₡500 |
| Mínimo para usar | 10 puntos (₡5,000) |
| Máximo descuento | 50% del total de la orden |
| Expiración | Los puntos NO expiran |
| Uso parcial | Sí, puede usar cualquier cantidad ≥ 10 |

### Ejemplos de Uso de Puntos

```
Orden: ₡15,000
Puntos disponibles: 25 pts (₡12,500)
Máximo aplicable: ₡7,500 (50%)
Usuario puede usar: 10-15 puntos

Orden: ₡8,000
Puntos disponibles: 25 pts (₡12,500)
Máximo aplicable: ₡4,000 (50%)
Usuario puede usar: 8 puntos (pero mínimo es 10)
→ No puede usar puntos en esta orden (50% < mínimo)
```

### Protecciones Anti-Abuso

| Protección | Descripción |
|------------|-------------|
| Email único | Un email solo puede dar puntos una vez |
| Teléfono único | Un teléfono solo puede dar puntos una vez |
| Máximo referidos | 100 referidos por usuario |
| Rate limit | Máximo 10 referidos por día |

---

## Modelo de Datos

### Colección: `users` (campos nuevos)

```javascript
{
  // ... campos existentes ...

  // Código de referido del usuario
  referralCode: "ABC123",           // String, único, 6 chars

  // Quién lo refirió (si aplica)
  referredBy: ObjectId,             // Ref a User
  referredByCode: "XYZ789",         // Código usado al registrarse

  // Puntos acumulados
  referralPoints: 12.5,             // Number (permite decimales)

  // Tracking de referidos
  referralStats: {
    totalReferred: 15,              // Total de personas referidas
    completedReferrals: 10,         // Referidos que completaron (registro + pedido)
    pendingReferrals: 5,            // Referidos parciales (solo registro o solo pedido)
    pointsEarned: 12.5,             // Total puntos ganados históricamente
    pointsUsed: 5                   // Total puntos usados
  }
}
```

### Colección: `referrals` (nueva)

Trackea cada relación de referido:

```javascript
{
  _id: ObjectId,

  // Referidor (quien compartió el código)
  referrerId: ObjectId,             // Ref a User
  referrerCode: "ABC123",           // Código usado

  // Referido (quien usó el código)
  referredUserId: ObjectId,         // Ref a User (null si solo guest)
  referredEmail: "juan@email.com",  // Email del referido
  referredPhone: "88887777",        // Teléfono del referido
  referredName: "Juan Pérez",       // Nombre (para mostrar)

  // Estado y puntos
  status: "completed",              // pending_registration | pending_order | completed
  pointsAwarded: 1,                 // 0.5 o 1

  // Tracking de acciones
  hasRegistered: true,
  hasOrdered: true,
  firstOrderId: ObjectId,           // Ref a Order
  registeredAt: Date,
  firstOrderAt: Date,

  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

### Colección: `orders` (campos nuevos)

```javascript
{
  // ... campos existentes ...

  // Código de referido usado (para pedidos de invitados)
  referralCode: "ABC123",
  referralId: ObjectId,             // Ref a Referral

  // Descuento por puntos
  pointsDiscount: {
    pointsUsed: 10,                 // Puntos usados
    discountAmount: 5000,           // ₡ descontados
    appliedAt: Date
  }
}
```

### Colección: `pointsTransactions` (nueva)

Log de todas las transacciones de puntos:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Usuario afectado

  type: "earned" | "used" | "expired" | "adjusted",
  amount: 0.5,                      // Positivo o negativo
  balanceBefore: 10,
  balanceAfter: 10.5,

  // Contexto
  reason: "referral_registration",  // referral_registration | referral_order | order_discount | admin_adjustment
  referralId: ObjectId,             // Si aplica
  orderId: ObjectId,                // Si aplica

  createdAt: Date
}
```

---

## API Endpoints

### Referidos

#### GET `/api/referral/my-stats`
Obtiene estadísticas de referidos del usuario.

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "ABC123",
    "link": "https://cevichedemitata.com/r/ABC123",
    "points": {
      "available": 12.5,
      "valueInColones": 6250,
      "canUse": true,
      "minToUse": 10
    },
    "stats": {
      "totalReferred": 15,
      "completed": 10,
      "pending": 5,
      "pointsEarned": 17.5,
      "pointsUsed": 5
    },
    "recentReferrals": [
      {
        "name": "Juan P.",
        "status": "completed",
        "pointsAwarded": 1,
        "date": "2024-01-15"
      },
      {
        "name": "María L.",
        "status": "pending_order",
        "pointsAwarded": 0.5,
        "date": "2024-01-18"
      }
    ]
  }
}
```

#### POST `/api/referral/validate`
Valida un código de referido.

**Request:**
```json
{ "code": "ABC123" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "referrerName": "María",
    "message": "¡María te invitó!"
  }
}
```

**Errores:**
```json
{ "success": false, "error": "Código no válido" }
{ "success": false, "error": "No puedes usar tu propio código" }
{ "success": false, "error": "Ya fuiste referido anteriormente" }
```

#### POST `/api/referral/track`
Registra uso de código (llamado internamente al registrar o hacer pedido).

**Request:**
```json
{
  "code": "ABC123",
  "action": "registration" | "guest_order",
  "email": "juan@email.com",
  "phone": "88887777",
  "name": "Juan Pérez",
  "orderId": "order123"  // Solo si es guest_order
}
```

### Puntos

#### GET `/api/points/balance`
Obtiene balance de puntos del usuario.

**Response:**
```json
{
  "success": true,
  "data": {
    "points": 12.5,
    "valueInColones": 6250,
    "canUse": true,
    "minPointsToUse": 10
  }
}
```

#### POST `/api/points/calculate-discount`
Calcula descuento aplicable a una orden.

**Request:**
```json
{
  "orderTotal": 15000,
  "pointsToUse": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pointsToUse": 15,
    "discountAmount": 7500,
    "maxAllowed": 7500,
    "finalTotal": 7500,
    "pointsRemaining": 0
  }
}
```

**Errores:**
```json
{ "success": false, "error": "Puntos insuficientes" }
{ "success": false, "error": "Mínimo 10 puntos para usar" }
{ "success": false, "error": "Descuento excede el 50% del total" }
```

#### POST `/api/points/apply`
Aplica puntos a una orden (llamado durante checkout).

**Request:**
```json
{
  "orderId": "order123",
  "pointsToUse": 10
}
```

#### GET `/api/points/history`
Historial de transacciones de puntos.

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "type": "earned",
        "amount": 1,
        "reason": "Referido: Juan P. completó registro y pedido",
        "date": "2024-01-15"
      },
      {
        "type": "used",
        "amount": -10,
        "reason": "Descuento en pedido #ABC123",
        "date": "2024-01-20"
      }
    ]
  }
}
```

---

## Interfaces de Usuario

### 1. Sección "Mis Referidos" (en ProfilePage)

```
┌─────────────────────────────────────────────────────┐
│  🎁 Programa de Referidos                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Tu link de referido:                               │
│  ┌───────────────────────────────────────────┐     │
│  │ cevichedemitata.com/r/ABC123          📋  │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  [📱 Compartir en WhatsApp]                         │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  💰 Tus Puntos                                      │
│  ┌───────────────────────────────────────────┐     │
│  │     12.5 pts                              │     │
│  │     ₡6,250 disponibles                    │     │
│  │                                           │     │
│  │  ℹ️ Mínimo 10 pts para usar en tu pedido   │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  👥 Tus Referidos (15)                              │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │ ✅ Juan P.      1 pt     15 Ene           │     │
│  │ ⏳ María L.     0.5 pt   18 Ene           │     │
│  │    (pendiente primer pedido)              │     │
│  │ ✅ Carlos R.    1 pt     20 Ene           │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ℹ️ Ganas 0.5 pts cuando se registran              │
│     + 0.5 pts cuando hacen su primer pedido        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2. Banner de Bienvenida (al llegar por link)

```
┌─────────────────────────────────────────────────────┐
│  🎉 ¡María te invitó!                               │
│                                                     │
│  Bienvenido a Ceviche de mi Tata.                   │
│  Tu código de referido está guardado.               │
│                                                     │
│              [Ver el Menú →]                        │
└─────────────────────────────────────────────────────┘
```

### 3. Campo de Referido en Checkout (invitados)

```
┌─────────────────────────────────────────────────────┐
│  🎁 ¿Te invitó un amigo?                            │
│  ┌───────────────────────────────────┬────────┐    │
│  │ ABC123                            │ Aplicar│    │
│  └───────────────────────────────────┴────────┘    │
│  ✅ ¡Código válido! Referido por María              │
└─────────────────────────────────────────────────────┘
```

### 4. Uso de Puntos en Checkout (usuarios registrados)

```
┌─────────────────────────────────────────────────────┐
│  💰 Usar mis puntos                                 │
│                                                     │
│  Tienes: 12.5 pts (₡6,250)                          │
│                                                     │
│  ☑️ Usar puntos en este pedido                      │
│                                                     │
│  Puntos a usar:                                     │
│  ┌─────────────────────────────────────────┐       │
│  │  [  -  ]      10 pts      [  +  ]       │       │
│  │              (₡5,000)                   │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  Subtotal:              ₡15,000                     │
│  Descuento puntos:      -₡5,000                     │
│  ─────────────────────────────────                  │
│  Total a pagar:         ₡10,000                     │
│                                                     │
│  ⚠️ Máximo 50% de descuento (₡7,500)                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5. Historial de Puntos

```
┌─────────────────────────────────────────────────────┐
│  📊 Historial de Puntos                             │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │ +1 pt   Juan P. completó registro y pedido│     │
│  │         15 Ene 2024                       │     │
│  ├───────────────────────────────────────────┤     │
│  │ +0.5 pt María L. se registró              │     │
│  │         18 Ene 2024                       │     │
│  ├───────────────────────────────────────────┤     │
│  │ -10 pts Descuento en pedido #A1B2C3       │     │
│  │         20 Ene 2024                       │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Flujos Técnicos

### Flujo 1: Acceso via Link de Referido

```
GET /r/ABC123
    │
    ▼
┌─────────────────────────┐
│ Guardar en localStorage │
│ - referralCode: ABC123  │
│ - referralExpiry: +7d   │
└─────────────────────────┘
    │
    ▼
Redirect → /menu
    │
    ▼
┌─────────────────────────┐
│ Mostrar banner:         │
│ "¡María te invitó!"     │
└─────────────────────────┘
```

### Flujo 2: Registro con Código de Referido

```
POST /api/auth/register
    │
    ├─── referralCode en body O localStorage
    │
    ▼
┌─────────────────────────────────────────┐
│ 1. Crear usuario                        │
│ 2. Validar código de referido           │
│    - ¿Código existe?                    │
│    - ¿No es su propio código?           │
│    - ¿Email/teléfono no referido antes? │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ 3. Buscar referral existente            │
│    (por email/teléfono de guest order)  │
└─────────────────────────────────────────┘
    │
    ├─── SI existe referral previo (guest order)
    │    │
    │    ▼
    │    ┌─────────────────────────────────┐
    │    │ - Vincular userId al referral   │
    │    │ - Actualizar status             │
    │    │ - Dar 0.5 pts adicionales       │
    │    │ - Log transacción               │
    │    └─────────────────────────────────┘
    │
    └─── NO existe referral previo
         │
         ▼
         ┌─────────────────────────────────┐
         │ - Crear nuevo referral          │
         │ - Status: pending_order         │
         │ - Dar 0.5 pts al referidor      │
         │ - Log transacción               │
         └─────────────────────────────────┘
```

### Flujo 3: Pedido de Invitado con Código

```
POST /api/orders/create (guest)
    │
    ├─── referralCode en body
    │
    ▼
┌─────────────────────────────────────────┐
│ 1. Validar código                       │
│ 2. Verificar email/teléfono no usado    │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ 3. Crear referral                       │
│    - Status: pending_registration       │
│    - hasOrdered: true                   │
│    - Guardar email/teléfono             │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ 4. Dar 0.5 pts al referidor             │
│ 5. Log transacción                      │
│ 6. Crear orden con referralCode         │
└─────────────────────────────────────────┘
```

### Flujo 4: Uso de Puntos en Checkout

```
POST /api/orders/create (con puntos)
    │
    ├─── pointsToUse: 10
    │
    ▼
┌─────────────────────────────────────────┐
│ 1. Validar puntos suficientes           │
│ 2. Validar >= 10 puntos                 │
│ 3. Calcular descuento                   │
│    - Max 50% del total                  │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ 4. Crear orden con descuento            │
│ 5. Descontar puntos del usuario         │
│ 6. Log transacción de puntos            │
└─────────────────────────────────────────┘
```

---

## Fases de Implementación

### Fase 1: Base (Backend)
- [ ] Migración: Agregar campos a User (referralCode, referralPoints, etc.)
- [ ] Crear colección Referrals
- [ ] Crear colección PointsTransactions
- [ ] Generar referralCode para usuarios existentes
- [ ] Endpoint: GET /api/referral/my-stats
- [ ] Endpoint: POST /api/referral/validate
- [ ] Ruta: GET /r/:code (redirect con localStorage)

### Fase 2: Tracking de Referidos
- [ ] Lógica de tracking en registro (vincular referido)
- [ ] Lógica de tracking en pedido guest
- [ ] Lógica de conversión guest → registrado
- [ ] Acreditación automática de puntos
- [ ] Endpoint: GET /api/points/balance
- [ ] Endpoint: GET /api/points/history

### Fase 3: UI de Referidos
- [ ] Sección "Mis Referidos" en ProfilePage
- [ ] Botón copiar link
- [ ] Botón compartir WhatsApp
- [ ] Lista de referidos con status
- [ ] Banner de bienvenida para referidos
- [ ] Campo de código en checkout (invitados)

### Fase 4: Uso de Puntos
- [ ] Endpoint: POST /api/points/calculate-discount
- [ ] Modificar checkout para usar puntos
- [ ] UI selector de puntos en CheckoutPage
- [ ] Validación de máximo 50%
- [ ] Descontar puntos al completar orden

### Fase 5: Mejoras y Admin
- [ ] Historial de puntos en perfil
- [ ] Panel admin: estadísticas de referidos
- [ ] Panel admin: ajuste manual de puntos
- [ ] Notificaciones cuando ganas puntos
- [ ] Email cuando llegas a 10 puntos

---

## Mensaje de WhatsApp Sugerido

```
¡Hola!

Te invito a probar los mejores ceviches de Costa Rica en Ceviche de mi Tata

Usa mi link y cuando hagas tu pedido, ambos ganamos puntos para descuentos:
https://cevichedemitata.com/r/ABC123

¡Están increíbles!
```

---

## Configuración (variables de entorno o config)

```javascript
REFERRAL_POINTS_PER_REGISTRATION = 0.5
REFERRAL_POINTS_PER_ORDER = 0.5
POINTS_VALUE_COLONES = 500
MIN_POINTS_TO_USE = 10
MAX_DISCOUNT_PERCENTAGE = 50
MAX_REFERRALS_PER_USER = 100
MAX_REFERRALS_PER_DAY = 10
REFERRAL_CODE_LENGTH = 6
REFERRAL_LINK_EXPIRY_DAYS = 7
```

---

## Resumen de Decisiones

| Aspecto | Decisión |
|---------|----------|
| Puntos por registro | 0.5 pts |
| Puntos por primer pedido | 0.5 pts |
| Puntos totales posibles | 1 pt por referido |
| Valor del punto | ₡500 |
| Mínimo para usar | 10 pts (₡5,000) |
| Máximo descuento | 50% del total |
| Expiración de puntos | No expiran |
| Guest orders | Sí, dan 0.5 pts |
| Conversión guest→registered | Automática por email/teléfono |
| Un referido, múltiples códigos | No, solo el primero cuenta |

---

*Documento actualizado: Noviembre 2024*
*Versión: 2.0*
