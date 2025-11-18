# Backend Setup Guide - Ceviche Manager

Este proyecto ahora incluye un backend seguro con MongoDB y autenticación JWT.

## Arquitectura

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Vercel API Routes (Serverless)
- **Base de datos**: MongoDB Atlas
- **Autenticación**: JWT (JSON Web Tokens)

## Configuración Inicial

### 1. Crear una cuenta en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita (si no tienes una)
3. Crea un nuevo cluster (el tier gratuito es suficiente)
4. Espera a que el cluster se cree (toma ~5 minutos)

### 2. Configurar MongoDB Atlas

1. **Crear usuario de base de datos**:
   - En tu cluster, click en "Database Access"
   - Click en "Add New Database User"
   - Crea un usuario con password (guárdalo, lo necesitarás)
   - Dale permisos de "Read and write to any database"

2. **Configurar Network Access**:
   - Click en "Network Access"
   - Click en "Add IP Address"
   - Selecciona "Allow Access from Anywhere" (0.0.0.0/0)
   - Esto es necesario para Vercel

3. **Obtener Connection String**:
   - Ve a tu cluster
   - Click en "Connect"
   - Selecciona "Connect your application"
   - Copia el connection string
   - Ejemplo: `mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`
   - Reemplaza `<username>` y `<password>` con tus credenciales

### 3. Configurar Variables de Entorno

1. **Localmente (.env.local)**:

```bash
# Copia el archivo de ejemplo
cp .env.local.example .env.local
```

2. **Edita `.env.local`** con tus valores:

```env
MONGODB_URI=mongodb+srv://tu-usuario:tu-password@cluster.mongodb.net/ceviche-manager?retryWrites=true&w=majority
JWT_SECRET=genera_un_string_aleatorio_super_seguro_aqui_minimo_32_caracteres
```

Para generar un JWT_SECRET seguro, puedes usar:
```bash
# En Linux/Mac
openssl rand -base64 32

# O simplemente usa un string aleatorio largo
```

3. **En Vercel**:
   - Ve a tu proyecto en Vercel
   - Settings > Environment Variables
   - Agrega las mismas variables:
     - `MONGODB_URI`: tu connection string
     - `JWT_SECRET`: el mismo secret que usaste localmente

### 4. Inicializar el Usuario Administrador

Ejecuta el script de setup para crear tu usuario admin:

```bash
npm run setup-admin
```

El script te pedirá:
- Username (default: admin)
- Password (mínimo 6 caracteres)

**Guarda bien estas credenciales**, las necesitarás para acceder al panel de administración.

### 5. Probar Localmente

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Visita:
- `http://localhost:5173/menu` - Menú público
- `http://localhost:5173/login` - Login para admin
- `http://localhost:5173/admin` - Panel de administración (requiere login)

### 6. Deployment en Vercel

```bash
# Asegúrate de que todo esté commiteado
git add .
git commit -m "Add backend with MongoDB and JWT authentication"
git push

# Vercel deployará automáticamente
```

Después del deploy:
1. Ve a tu proyecto en Vercel
2. Configura las environment variables (paso 3)
3. Redeploy si es necesario

## Estructura del Backend

```
api/
├── auth/
│   ├── login.ts      # POST /api/auth/login - Login
│   └── verify.ts     # GET /api/auth/verify - Verificar token
├── config/
│   └── index.ts      # GET/PUT /api/config - Configuración de precios
└── lib/
    ├── mongodb.ts    # Conexión a MongoDB
    ├── models.ts     # Modelos de User y Config
    └── auth.ts       # Utilidades de JWT y bcrypt

scripts/
└── setup-admin.ts    # Script de inicialización del admin

src/services/
└── api.ts           # Cliente API para el frontend
```

## API Endpoints

### Autenticación

#### POST /api/auth/login
Login de usuario admin.

**Request:**
```json
{
  "username": "admin",
  "password": "tu_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_aqui",
  "user": {
    "id": "user_id",
    "username": "admin"
  }
}
```

#### GET /api/auth/verify
Verificar si el token es válido.

**Headers:**
```
Authorization: Bearer jwt_token_aqui
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "user_id",
    "username": "admin"
  }
}
```

### Configuración

#### GET /api/config
Obtener configuración actual (público, no requiere auth).

**Response:**
```json
{
  "success": true,
  "config": {
    "rawMaterials": { ... },
    "markup": 2.5,
    "customPrices": { ... }
  }
}
```

#### PUT /api/config
Actualizar configuración (requiere autenticación).

**Headers:**
```
Authorization: Bearer jwt_token_aqui
```

**Request:**
```json
{
  "rawMaterials": {
    "pescado": 7,
    "camaron": 10.5,
    ...
  },
  "markup": 2.5,
  "customPrices": {
    "pescado": 7000,
    ...
  }
}
```

## Seguridad

El backend implementa:

✅ **Autenticación JWT**: Tokens seguros con expiración de 7 días
✅ **Password Hashing**: bcrypt con salt de 10 rounds
✅ **Validación de datos**: Verificación de tipos y rangos
✅ **MongoDB Connection Pooling**: Reutilización eficiente de conexiones
✅ **Error handling**: Manejo apropiado de errores
✅ **Rate limiting natural**: Serverless functions con límites de Vercel

## Troubleshooting

### Error: "MongoServerError: bad auth"
- Verifica que el username y password en MONGODB_URI sean correctos
- Asegúrate de que el usuario tenga permisos

### Error: "Please add your MONGODB_URI to .env.local"
- Crea el archivo `.env.local` con las variables de entorno
- Reinicia el servidor de desarrollo

### Error: "Invalid or expired token"
- Tu sesión expiró (tokens duran 7 días)
- Haz login nuevamente

### El menu no carga / muestra valores por defecto
- Verifica que la API esté corriendo
- Revisa la consola del navegador para errores
- Asegúrate de que MongoDB Atlas permita conexiones desde tu IP

### No puedo hacer login
- Verifica que corriste `npm run setup-admin`
- Verifica las credenciales
- Revisa los logs de Vercel si estás en producción

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar desarrollo

# Setup
npm run setup-admin      # Crear/resetear usuario admin

# Build
npm run build           # Build para producción

# Deployment
git push                # Vercel deployará automáticamente
```

## Migración desde localStorage

Si ya tenías datos en localStorage, estos ya NO se usan. Todo ahora se guarda en MongoDB:

1. Los datos de localStorage se ignoran
2. La primera vez que entres al admin, carga los valores por defecto
3. Cualquier cambio que hagas se guarda automáticamente en la BD
4. El menú público siempre lee de la BD

## Próximos Pasos

Para mejorar aún más la seguridad:

1. **Rate Limiting**: Implementar límites de requests por IP
2. **2FA**: Autenticación de dos factores
3. **Audit Logs**: Registrar cambios en precios
4. **Multiple Users**: Sistema de usuarios múltiples
5. **Password Reset**: Recuperación de contraseña por email

## Soporte

Si tienes problemas, revisa:
1. La consola del navegador
2. Los logs de Vercel
3. Los logs de MongoDB Atlas

---

Hecho con ❤️ y Claude Code
