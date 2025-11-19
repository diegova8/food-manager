# Ceviche de mi Tata 🦐

> Sistema completo de gestión y venta de ceviches porteños - Aplicación web con administración, pedidos en línea y gestión de inventario.

[![Vercel](https://img.shields.io/badge/deployed-vercel-black)](https://cevichedemitata.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

## 🌟 Características Principales

### Para Clientes
- 🍽️ **Menú Visual Interactivo**: Navegación intuitiva con imágenes y descripciones
- 🛒 **Carrito de Compras**: Gestión completa de pedidos con persistencia
- 📱 **Sistema de Checkout**: Proceso de pago simple con confirmación por imagen
- 📧 **Notificaciones por Email**: Confirmaciones automáticas de pedidos
- 👤 **Registro de Usuarios**: Seguimiento de historial de pedidos

### Para Administradores
- 📊 **Panel de Administración**: Control total de precios y configuración
- 💰 **Matriz de Costos**: Gestión dinámica de precios de materia prima
- 📦 **Gestión de Pedidos**: Seguimiento y actualización de estados
- 🧮 **Calculadora de Costos**: Análisis de márgenes y ganancias
- 🔐 **Autenticación Segura**: JWT + bcrypt para seguridad

## 🚀 Tecnologías

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Router**: React Router DOM 7
- **State Management**: React Context + Hooks
- **File Upload**: react-dropzone

### Backend
- **Runtime**: Vercel Serverless Functions (Node.js)
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Email Service**: Resend API
- **Validation**: Zod
- **Storage**: Vercel Blob Storage

### Infrastructure
- **Hosting**: Vercel
- **Database**: MongoDB Atlas (Cloud)
- **Email**: Resend
- **Storage**: Vercel Blob

## 📦 Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Cuenta en MongoDB Atlas
- Cuenta en Vercel (para deployment)
- API Key de Resend (para emails)

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd food-manager
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` basado en `.env.local.example`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ceviche-manager

# JWT Authentication
JWT_SECRET=<your-secure-secret-key-minimum-32-characters>

# Email Service (Resend)
RESEND_API_KEY=<your-resend-api-key>

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
```

### 4. Configurar MongoDB Atlas
1. Crea un cluster gratuito en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Configura Network Access (permite tu IP o 0.0.0.0/0 para Vercel)
3. Crea un usuario de base de datos
4. Obtén el connection string y agrégalo a `.env.local`

Ver [docs/BACKEND_SETUP.md](docs/BACKEND_SETUP.md) para más detalles.

### 5. Inicializar usuario administrador
```bash
npm run setup-admin
```

Este script te pedirá crear las credenciales del administrador.

### 6. Iniciar servidor de desarrollo
```bash
# Solo frontend (usa valores por defecto en localStorage)
npm run dev

# Frontend + Backend API (recomendado)
npm run dev:full
```

La aplicación estará disponible en:
- Frontend: `http://localhost:5173`
- API (si usas dev:full): `http://localhost:3000/api`

## 📱 Rutas de la Aplicación

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/menu` | Menú público de ceviches | Público |
| `/checkout` | Proceso de compra | Público |
| `/register` | Registro de nuevos usuarios | Público |
| `/login` | Login de usuarios/admin | Público |
| `/verify-email` | Verificación de email | Público |
| `/forgot-password` | Recuperación de contraseña | Público |
| `/reset-password` | Restablecer contraseña | Público |
| `/admin` | Panel de administración | Requiere autenticación de admin |
| `/admin/orders` | Gestión de pedidos | Requiere autenticación de admin |

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia Vite (solo frontend)
npm run dev:full         # Inicia Vercel Dev (frontend + API)

# Build
npm run build           # Compila TypeScript y genera build de producción

# Linting
npm run lint            # Ejecuta ESLint

# Preview
npm run preview         # Vista previa del build de producción

# Setup
npm run setup-admin     # Crea/resetea usuario administrador
```

## 🗂️ Estructura del Proyecto

```
food-manager/
├── api/                          # Backend (Vercel Serverless Functions)
│   ├── auth/                     # Endpoints de autenticación
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── verify-email.ts
│   │   ├── forgot-password.ts
│   │   └── reset-password.ts
│   ├── config/                   # Configuración de precios
│   │   └── index.ts
│   ├── orders/                   # Gestión de pedidos
│   │   ├── create.ts
│   │   ├── index.ts
│   │   └── update-status.ts
│   ├── lib/                      # Librerías compartidas
│   │   ├── mongodb.ts
│   │   ├── models.ts
│   │   ├── auth.ts
│   │   └── email.ts
│   ├── middleware/               # Middleware de API
│   │   ├── auth.ts
│   │   ├── cors.ts
│   │   └── errorHandler.ts
│   ├── schemas/                  # Validación Zod
│   └── send-email.ts            # Endpoint genérico de email
│
├── src/                          # Frontend (React)
│   ├── components/               # Componentes reutilizables
│   │   ├── CatalogoCeviches.tsx
│   │   ├── MenuCeviches.tsx
│   │   ├── MatrizCostos.tsx
│   │   ├── CalculadoraPedidos.tsx
│   │   ├── CevicheCounter.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/                    # Páginas de la aplicación
│   │   ├── AdminPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── OrdersManagementPage.tsx
│   │   ├── VerifyEmailPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── context/                  # React Context
│   │   └── CartContext.tsx
│   ├── services/                 # Servicios API
│   │   └── api.ts
│   ├── utils/                    # Utilidades
│   │   ├── utils.ts
│   │   └── jwt.ts
│   ├── types.ts                  # Definiciones de tipos
│   ├── App.tsx                   # Componente principal
│   └── main.tsx                  # Entry point
│
├── docs/                         # Documentación
│   ├── BACKEND_SETUP.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── IMPROVEMENT_ROADMAP.md
│
├── public/                       # Assets estáticos
│   ├── logo.png
│   └── logo.ico
│
├── scripts/                      # Scripts de utilidad
│   └── setup-admin.ts
│
└── package.json
```

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para más detalles sobre la arquitectura.

## 📚 Documentación

- **[Backend Setup](docs/BACKEND_SETUP.md)** - Guía completa de configuración del backend
- **[API Documentation](docs/API.md)** - Documentación de endpoints y uso
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Guía de deployment en Vercel
- **[Architecture](docs/ARCHITECTURE.md)** - Arquitectura del sistema
- **[Improvement Roadmap](docs/IMPROVEMENT_ROADMAP.md)** - Roadmap de mejoras futuras

## 🔒 Seguridad

- ✅ Autenticación JWT con tokens seguros
- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Validación de datos con Zod
- ✅ Protección CORS configurada
- ✅ Variables de entorno para credenciales
- ✅ Rate limiting en endpoints críticos
- ✅ Validación de archivos en uploads
- ✅ Sanitización de inputs

## 🚢 Deployment

### Deployment en Vercel

1. **Conecta tu repositorio**
   ```bash
   vercel
   ```

2. **Configura las variables de entorno** en Vercel:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`

3. **Deploy**
   ```bash
   vercel --prod
   ```

Ver la [guía completa de deployment](docs/DEPLOYMENT.md).

## 🧪 Testing

```bash
# Run tests (cuando estén implementados)
npm test

# Run linter
npm run lint
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- Desarrollado con ❤️ usando [Claude Code](https://claude.com/claude-code)
- Iconos y recursos visuales de la comunidad

## 📧 Contacto

Para preguntas o soporte, contacta a: admin@cevichedemitata.app

---

**Hecho con ❤️ y Claude Code** | [Reportar un Bug](../../issues) | [Solicitar Feature](../../issues)
