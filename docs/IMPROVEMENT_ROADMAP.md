# Ceviche Manager - Improvement Roadmap

**Generated**: 2025-11-18
**Project**: Ceviche Manager
**Status**: MVP - Not Production Ready

---

## Executive Summary

This roadmap outlines improvements needed to make the ceviche-manager application production-ready. Current assessment:

- **Security**: 2/10 - CRITICAL issues present
- **Performance**: 5/10 - Optimization needed
- **Code Quality**: 6/10 - Good foundation, needs refinement
- **Testing**: 0/10 - No tests exist
- **Type Safety**: 7/10 - Good TypeScript usage, some gaps

**Estimated Time to Production**: 3-4 weeks (1 developer)

---

## 🚨 Phase 0: IMMEDIATE SECURITY FIXES (1-2 days)

### Priority: CRITICAL - Do not deploy to production until complete

### 1. Rotate All Exposed Credentials
**Files**: `.env.local`
**Issue**: JWT_SECRET, MongoDB credentials, and Resend API key exposed in repository

**Actions**:
```bash
# 1. Generate new JWT secret (256-bit minimum)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Create new MongoDB user with different password
# - Login to MongoDB Atlas
# - Database Access > Add New User
# - Revoke old user credentials

# 3. Rotate Resend API key
# - Login to Resend dashboard
# - Delete old key
# - Generate new key

# 4. Update Vercel environment variables
vercel env add JWT_SECRET production
vercel env add MONGODB_URI production
vercel env add RESEND_API_KEY production

# 5. Remove .env.local from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# 6. Add to .gitignore
echo ".env.local" >> .gitignore
```

**Create**: `.env.example` template
```env
JWT_SECRET=your_secret_here
MONGODB_URI=your_mongodb_connection_string
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@yourdomain.com
```

**Estimated Time**: 2 hours

---

### 2. Add CORS Protection
**Files**: Create `api/middleware/cors.ts`

**Implementation**:
```typescript
// api/middleware/cors.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'https://your-domain.vercel.app'
];

export function withCORS(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const origin = req.headers.origin;

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}
```

**Update**: All API endpoints to use middleware
```typescript
// api/auth/login.ts
import { withCORS } from '../middleware/cors';

async function handler(req: VercelRequest, res: VercelResponse) {
  // existing code
}

export default withCORS(handler);
```

**Estimated Time**: 3 hours

---

### 3. Implement Rate Limiting
**Files**: Create `api/middleware/rateLimit.ts`

**Implementation**:
```typescript
// api/middleware/rateLimit.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(config: RateLimitConfig) {
  return (handler: (req: VercelRequest, res: VercelResponse) => Promise<void>) => {
    return async (req: VercelRequest, res: VercelResponse) => {
      const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
      const key = `${ip}`;
      const now = Date.now();

      const record = requestCounts.get(key);

      if (record && now < record.resetTime) {
        if (record.count >= config.maxRequests) {
          return res.status(429).json({
            error: 'Too many requests. Please try again later.'
          });
        }
        record.count++;
      } else {
        requestCounts.set(key, {
          count: 1,
          resetTime: now + config.windowMs
        });
      }

      return handler(req, res);
    };
  };
}
```

**Apply to auth endpoints**:
```typescript
// api/auth/login.ts
import { withRateLimit } from '../middleware/rateLimit';

const rateLimiter = withRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 login attempts
});

export default withCORS(rateLimiter(handler));
```

**Estimated Time**: 4 hours

---

### 4. Add Security Headers
**Files**: Create `api/middleware/securityHeaders.ts`

**Implementation**:
```typescript
// api/middleware/securityHeaders.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export function withSecurityHeaders(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    return handler(req, res);
  };
}
```

**Estimated Time**: 1 hour

---

## 🔴 Phase 1: HIGH PRIORITY FIXES (Week 1)

### 5. Move Images to Cloud Storage
**Files**: `src/pages/CheckoutPage.tsx`, `api/orders/create.ts`

**Problem**: Base64 images stored in MongoDB cause database bloat

**Solution**: Use Cloudinary or AWS S3

**Implementation**:
```bash
npm install cloudinary
```

**Create upload utility**:
```typescript
// api/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadPaymentProof(base64Image: string): Promise<string> {
  const result = await cloudinary.uploader.upload(base64Image, {
    folder: 'payment-proofs',
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    max_file_size: 5000000 // 5MB
  });

  return result.secure_url;
}
```

**Update order creation**:
```typescript
// api/orders/create.ts
import { uploadPaymentProof } from '../lib/cloudinary';

// Replace:
paymentProof: paymentProof // base64 string

// With:
const paymentProofUrl = await uploadPaymentProof(paymentProof);
// Then store paymentProofUrl in database
```

**Update Order schema**:
```typescript
// api/lib/models.ts
paymentProof: {
  type: String,
  required: true,
  // Now stores URL instead of base64
}
```

**Estimated Time**: 6 hours

---

### 6. Add Input Validation & Sanitization
**Files**: Create `api/middleware/validation.ts`

**Install dependencies**:
```bash
npm install zod validator
```

**Create validation schemas**:
```typescript
// api/schemas/auth.ts
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/)
});

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8)
});
```

```typescript
// api/schemas/order.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    cevicheType: z.string(),
    quantity: z.number().min(1).max(100),
    price: z.number().positive()
  })).min(1),
  total: z.number().positive(),
  personalInfo: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    email: z.string().email().optional()
  }),
  deliveryMethod: z.enum(['pickup', 'uber-flash']),
  notes: z.string().max(500).optional(),
  paymentProof: z.string() // base64 or URL
});
```

**Create validation middleware**:
```typescript
// api/middleware/validation.ts
import { z } from 'zod';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import validator from 'validator';

export function withValidation<T>(schema: z.ZodSchema<T>) {
  return (handler: (req: VercelRequest, res: VercelResponse, validatedData: T) => Promise<void>) => {
    return async (req: VercelRequest, res: VercelResponse) => {
      try {
        const validatedData = schema.parse(req.body);

        // Sanitize string fields
        const sanitized = sanitizeObject(validatedData);

        return handler(req, res, sanitized as T);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(422).json({
            error: 'Validation failed',
            details: error.errors
          });
        }
        throw error;
      }
    };
  };
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return validator.escape(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}
```

**Update endpoints**:
```typescript
// api/auth/register.ts
import { withValidation } from '../middleware/validation';
import { registerSchema } from '../schemas/auth';

async function handler(req: VercelRequest, res: VercelResponse, validatedData: z.infer<typeof registerSchema>) {
  const { username, email, password, name, phone } = validatedData;
  // Use validated data instead of req.body
}

export default withCORS(withRateLimit({ windowMs: 60000, maxRequests: 3 })(
  withValidation(registerSchema)(handler)
));
```

**Estimated Time**: 8 hours

---

### 7. Standardize API Response Types
**Files**: Create `api/types/responses.ts`

**Implementation**:
```typescript
// api/types/responses.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errorId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Specific response types
export interface AuthResponse {
  success: true;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email?: string;
      name: string;
      isAdmin: boolean;
    };
  };
  message: string;
}

export interface OrderResponse {
  success: true;
  data: {
    orderId: string;
    status: OrderStatus;
  };
  message: string;
}
```

**Create response helpers**:
```typescript
// api/lib/responses.ts
import type { VercelResponse } from '@vercel/node';
import type { ApiResponse } from '../types/responses';
import { randomBytes } from 'crypto';

export function successResponse<T>(
  res: VercelResponse,
  data: T,
  message?: string,
  status: number = 200
) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  return res.status(status).json(response);
}

export function errorResponse(
  res: VercelResponse,
  error: string | Error,
  status: number = 500
) {
  const errorId = randomBytes(8).toString('hex');
  const errorMessage = error instanceof Error ? error.message : error;

  // Log full error server-side
  console.error(`[${errorId}] API Error:`, error);

  const response: ApiResponse = {
    success: false,
    error: status >= 500 ? 'Internal server error' : errorMessage,
    errorId: status >= 500 ? errorId : undefined
  };

  return res.status(status).json(response);
}
```

**Update all endpoints**:
```typescript
// api/auth/login.ts
import { successResponse, errorResponse } from '../lib/responses';

// Replace:
return res.status(200).json({ success: true, token, user });

// With:
return successResponse(res, { token, user }, 'Login successful');

// Replace:
return res.status(401).json({ error: 'Invalid credentials' });

// With:
return errorResponse(res, 'Invalid credentials', 401);
```

**Estimated Time**: 4 hours

---

### 8. Fix Type Safety Issues
**Files**: `src/services/api.ts`, `api/orders/index.ts`, various

**Create proper types**:
```typescript
// src/types/api.ts
export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  personalInfo: PersonalInfo;
  deliveryMethod: 'pickup' | 'uber-flash';
  notes?: string;
  paymentProof: string; // URL
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  cevicheType: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';

export interface PersonalInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  totalCount: number;
  limit: number;
  offset: number;
}
```

**Update API service**:
```typescript
// src/services/api.ts
async listOrders(status?: string, limit = 50, offset = 0): Promise<ApiListResponse<Order>> {
  // Remove: orders: any[]
  const response = await this.request<ApiListResponse<Order>>(
    `/orders?status=${status || ''}&limit=${limit}&offset=${offset}`
  );
  return response;
}
```

**Update components**:
```typescript
// src/pages/OrdersManagementPage.tsx
const [orders, setOrders] = useState<Order[]>([]);
const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
```

**Replace all 'any' types** (found in 5+ locations)

**Estimated Time**: 4 hours

---

### 9. Add Password Reset Flow
**Files**: Create `api/auth/forgot-password.ts`, `api/auth/reset-password.ts`

**Implementation**:
```typescript
// api/auth/forgot-password.ts
import { withCORS } from '../middleware/cors';
import { withRateLimit } from '../middleware/rateLimit';
import { withValidation } from '../middleware/validation';
import connectDB from '../lib/mongodb';
import { User } from '../lib/models';
import { sendPasswordResetEmail } from '../lib/email';
import { randomBytes } from 'crypto';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email()
});

async function handler(req: VercelRequest, res: VercelResponse, data: z.infer<typeof schema>) {
  await connectDB();

  const user = await User.findOne({ email: data.email });

  // Don't reveal if email exists
  if (!user) {
    return successResponse(res, null, 'If email exists, reset link sent');
  }

  // Generate reset token
  const resetToken = randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  user.passwordResetToken = resetToken;
  user.passwordResetExpiry = resetTokenExpiry;
  await user.save();

  await sendPasswordResetEmail(user.email, user.name, resetToken);

  return successResponse(res, null, 'If email exists, reset link sent');
}

export default withCORS(
  withRateLimit({ windowMs: 300000, maxRequests: 3 })(
    withValidation(schema)(handler)
  )
);
```

```typescript
// api/auth/reset-password.ts
import { withCORS } from '../middleware/cors';
import { withValidation } from '../middleware/validation';
import connectDB from '../lib/mongodb';
import { User } from '../lib/models';
import { hashPassword } from '../lib/auth';
import { z } from 'zod';

const schema = z.object({
  token: z.string(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/)
});

async function handler(req: VercelRequest, res: VercelResponse, data: z.infer<typeof schema>) {
  await connectDB();

  const user = await User.findOne({
    passwordResetToken: data.token,
    passwordResetExpiry: { $gt: new Date() }
  });

  if (!user) {
    return errorResponse(res, 'Invalid or expired reset token', 400);
  }

  user.password = await hashPassword(data.password);
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  return successResponse(res, null, 'Password reset successful');
}

export default withCORS(withValidation(schema)(handler));
```

**Update User model**:
```typescript
// api/lib/models.ts
passwordResetToken: String,
passwordResetExpiry: Date,
```

**Create email template**:
```typescript
// api/lib/email.ts
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: 'Ceviche de mi Tata <noreply@yourdomain.com>',
    to: email,
    subject: 'Restablecer contraseña',
    html: `
      <h2>Hola ${name},</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste restablecer tu contraseña, ignora este correo.</p>
    `
  });
}
```

**Create frontend pages**:
```typescript
// src/pages/ForgotPasswordPage.tsx
// src/pages/ResetPasswordPage.tsx
```

**Estimated Time**: 6 hours

---

### 10. Extract Duplicated Filter Logic
**Files**: `src/utils.ts`, `src/components/MenuCeviches.tsx`, `src/components/CatalogoCeviches.tsx`

**Create utility functions**:
```typescript
// src/utils.ts
export function filterCevichesByIngredientCount(
  cevicheCosts: CevicheCost[],
  count: number
): CevicheCost[] {
  return cevicheCosts.filter(c => {
    const ingredientCount = Object.values(c.ceviche.ingredients)
      .filter(v => v !== undefined).length;
    return ingredientCount === count;
  });
}

export function categorizeByIngredientCount(cevicheCosts: CevicheCost[]) {
  return {
    single: filterCevichesByIngredientCount(cevicheCosts, 1),
    double: filterCevichesByIngredientCount(cevicheCosts, 2),
    triple: filterCevichesByIngredientCount(cevicheCosts, 3),
    multiple: cevicheCosts.filter(c => {
      const count = Object.values(c.ceviche.ingredients)
        .filter(v => v !== undefined).length;
      return count > 3;
    })
  };
}
```

**Update components**:
```typescript
// src/components/MenuCeviches.tsx
import { categorizeByIngredientCount } from '../utils';

const categorized = useMemo(
  () => categorizeByIngredientCount(cevicheCosts),
  [cevicheCosts]
);

// Use: categorized.single, categorized.double, etc.
```

**Estimated Time**: 2 hours

---

## ⚠️ Phase 2: MEDIUM PRIORITY (Week 2)

### 11. Add Basic Test Coverage
**Files**: Create `tests/` directory

**Setup testing framework**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @testing-library/user-event
```

**Configure Vitest**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  }
});
```

**Create test files**:
```typescript
// tests/utils.test.ts - Test utility functions
// tests/components/CevicheCounter.test.tsx - Test counter component
// tests/api/auth.test.ts - Test auth endpoints
// tests/api/orders.test.ts - Test order endpoints
```

**Target coverage**:
- Utils: 100%
- API endpoints: 80%
- Components: 50%

**Estimated Time**: 12 hours

---

### 12. Persist Cart to localStorage
**Files**: `src/context/CartContext.tsx`

**Implementation**:
```typescript
// src/context/CartContext.tsx
const CART_STORAGE_KEY = 'ceviche-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  // Load from localStorage on mount
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load cart:', error);
      return [];
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, [items]);

  // Rest of implementation...
}
```

**Estimated Time**: 2 hours

---

### 13. Add Toast Notifications
**Files**: Replace all `alert()` calls

**Install library**:
```bash
npm install react-hot-toast
```

**Setup**:
```typescript
// src/App.tsx
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-center" />
      {/* Routes */}
    </>
  );
}
```

**Replace alerts**:
```typescript
// Before:
alert('Error al guardar la configuración');

// After:
import toast from 'react-hot-toast';
toast.error('Error al guardar la configuración');

// Success:
toast.success('Configuración guardada');

// Loading:
const loadingToast = toast.loading('Guardando...');
// ... do work
toast.success('Guardado', { id: loadingToast });
```

**Files to update**:
- `src/pages/AdminPage.tsx` (lines 80, 111)
- `src/pages/OrdersManagementPage.tsx` (lines 38, 49, 52)

**Estimated Time**: 3 hours

---

### 14. Split Large Components
**Files**: `src/pages/CheckoutPage.tsx` (482 lines)

**Create sub-components**:
```typescript
// src/components/checkout/PersonalInfoStep.tsx
interface PersonalInfoStepProps {
  personalInfo: PersonalInfo;
  setPersonalInfo: (info: PersonalInfo) => void;
  isAuthenticated: boolean;
}

export function PersonalInfoStep({ personalInfo, setPersonalInfo, isAuthenticated }: PersonalInfoStepProps) {
  // Move lines 189-246 here
}
```

```typescript
// src/components/checkout/DeliveryMethodStep.tsx
interface DeliveryMethodStepProps {
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (method: DeliveryMethod) => void;
}

export function DeliveryMethodStep({ deliveryMethod, setDeliveryMethod }: DeliveryMethodStepProps) {
  // Move lines 249-312 here
}
```

```typescript
// src/components/checkout/PaymentStep.tsx
interface PaymentStepProps {
  items: CartItem[];
  totalPrice: number;
  paymentProof: File | null;
  paymentProofPreview: string;
  notes: string;
  setNotes: (notes: string) => void;
  onPaymentProofChange: (file: File | null, preview: string) => void;
}

export function PaymentStep(props: PaymentStepProps) {
  // Move lines 314-413 here
}
```

**Update CheckoutPage**:
```typescript
// src/pages/CheckoutPage.tsx
import { PersonalInfoStep } from '../components/checkout/PersonalInfoStep';
import { DeliveryMethodStep } from '../components/checkout/DeliveryMethodStep';
import { PaymentStep } from '../components/checkout/PaymentStep';

// Simplified render
{currentStep === 1 && <PersonalInfoStep {...props} />}
{currentStep === 2 && <DeliveryMethodStep {...props} />}
{currentStep === 3 && <PaymentStep {...props} />}
```

**Estimated Time**: 4 hours

---

### 15. Add File Upload Validation
**Files**: `src/pages/CheckoutPage.tsx`, `api/orders/create.ts`

**Frontend validation**:
```typescript
// src/pages/CheckoutPage.tsx
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  accept: {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif']
  },
  maxFiles: 1,
  maxSize: MAX_FILE_SIZE,
  onDrop: (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('La imagen es muy grande. Máximo 5MB');
      } else if (error.code === 'file-invalid-type') {
        toast.error('Tipo de archivo no válido. Use JPG, PNG o GIF');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error('Tipo de archivo no válido');
        return;
      }

      setPaymentProof(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }
});
```

**Backend validation**:
```typescript
// api/orders/create.ts
function validateBase64Image(base64: string): void {
  // Check size (base64 is ~33% larger than original)
  const sizeInBytes = (base64.length * 3) / 4;
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (sizeInBytes > maxSize) {
    throw new Error('Image too large. Maximum 5MB');
  }

  // Check format
  const matches = base64.match(/^data:image\/(jpeg|jpg|png|gif);base64,/);
  if (!matches) {
    throw new Error('Invalid image format. Use JPG, PNG, or GIF');
  }
}

// In handler:
validateBase64Image(paymentProof);
```

**Estimated Time**: 3 hours

---

### 16. Add Database Indexes
**Files**: `api/lib/models.ts`

**Implementation**:
```typescript
// api/lib/models.ts

// Order indexes
OrderSchema.index({ status: 1, createdAt: -1 }); // For listing orders by status
OrderSchema.index({ user: 1, createdAt: -1 }); // For user order history
OrderSchema.index({ createdAt: -1 }); // For admin dashboard

// EmailVerification indexes
EmailVerificationSchema.index({ email: 1 }); // For lookup
EmailVerificationSchema.index({ token: 1 }); // For verification
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// User indexes
UserSchema.index({ email: 1 }); // For login
UserSchema.index({ username: 1 }); // For login
UserSchema.index({ passwordResetToken: 1 }); // For password reset
```

**Estimated Time**: 1 hour

---

### 17. Add Error Boundary
**Files**: Create `src/components/ErrorBoundary.tsx`

**Implementation**:
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Algo salió mal
            </h1>
            <p className="text-gray-600 mb-4">
              Lo sentimos, ocurrió un error inesperado.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Update App**:
```typescript
// src/App.tsx
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        {/* Routes */}
      </CartProvider>
    </ErrorBoundary>
  );
}
```

**Estimated Time**: 2 hours

---

### 18. Optimize Re-renders with useCallback
**Files**: `src/pages/CheckoutPage.tsx`, various components

**Implementation**:
```typescript
// src/pages/CheckoutPage.tsx
import { useState, useEffect, useCallback } from 'react';

const handlePersonalInfoChange = useCallback((field: keyof PersonalInfo, value: string) => {
  setPersonalInfo(prev => ({ ...prev, [field]: value }));
}, []);

const handleDeliveryMethodChange = useCallback((method: DeliveryMethod) => {
  setDeliveryMethod(method);
}, []);

const handleNotesChange = useCallback((value: string) => {
  setNotes(value);
}, []);

// Then in JSX:
<input
  value={personalInfo.name}
  onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
/>
```

**Estimated Time**: 3 hours

---

## 📊 Phase 3: FEATURE ADDITIONS (Week 3)

### 19. User Dashboard
**Files**: Create `src/pages/UserDashboard.tsx`

**Features**:
- View order history
- Track current order status
- Update profile information
- Change password

**Implementation outline**:
```typescript
// src/pages/UserDashboard.tsx
// - Fetch user's orders from API
// - Display in table/cards with status
// - Allow viewing order details
// - Show profile form for editing
```

**New API endpoint**:
```typescript
// api/orders/my-orders.ts
// GET /api/orders/my-orders
// Returns orders for authenticated user
```

**Estimated Time**: 8 hours

---

### 20. Email Verification Resend
**Files**: Create `api/auth/resend-verification.ts`

**Implementation**:
```typescript
// api/auth/resend-verification.ts
// POST /api/auth/resend-verification
// - Find user by email
// - Generate new verification token
// - Update EmailVerification record
// - Send new email
// - Rate limit: 3 requests per 15 minutes
```

**Estimated Time**: 3 hours

---

### 21. Order Status Notifications
**Files**: `api/orders/update-status.ts`

**Implementation**:
```typescript
// api/orders/update-status.ts
// When order status changes, send notification:
// - Email to customer
// - Optional: SMS via Twilio
// - Optional: WhatsApp via WhatsApp Business API

import { sendOrderStatusEmail } from '../lib/email';

// After updating order:
await sendOrderStatusEmail(
  order.personalInfo.email || order.user.email,
  order.personalInfo.name,
  order._id.toString(),
  status
);
```

**Create email template**:
```typescript
// api/lib/email.ts
export async function sendOrderStatusEmail(
  email: string,
  name: string,
  orderId: string,
  status: string
) {
  const statusMessages = {
    confirmed: 'Tu pedido ha sido confirmado',
    ready: 'Tu pedido está listo para recoger',
    completed: 'Tu pedido ha sido completado',
    cancelled: 'Tu pedido ha sido cancelado'
  };

  await resend.emails.send({
    from: 'Ceviche de mi Tata <pedidos@yourdomain.com>',
    to: email,
    subject: `Pedido #${orderId} - ${statusMessages[status]}`,
    html: `<h2>Hola ${name},</h2><p>${statusMessages[status]}</p>`
  });
}
```

**Estimated Time**: 4 hours

---

### 22. WhatsApp Integration
**Files**: Create `api/lib/whatsapp.ts`

**Implementation** (using Twilio):
```bash
npm install twilio
```

```typescript
// api/lib/whatsapp.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsAppMessage(
  to: string,
  message: string
) {
  await client.messages.create({
    from: 'whatsapp:+14155238886', // Twilio sandbox number
    to: `whatsapp:${to}`,
    body: message
  });
}
```

**Use in order creation**:
```typescript
// api/orders/create.ts
import { sendWhatsAppMessage } from '../lib/whatsapp';

// After order created:
await sendWhatsAppMessage(
  personalInfo.phone,
  `¡Pedido recibido! Tu número de pedido es #${newOrder._id}. Te contactaremos pronto.`
);
```

**Estimated Time**: 6 hours

---

### 23. Inventory Management System
**Files**: Create `api/lib/models.ts` (Inventory model), `src/pages/InventoryPage.tsx`

**Database schema**:
```typescript
// api/lib/models.ts
const InventorySchema = new Schema({
  ingredient: {
    type: String,
    required: true,
    enum: ['pescado', 'pulpo', 'camaron', 'mixto', 'calamar', 'caracol', 'chicharron']
  },
  quantityInStock: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'lb', 'units']
  },
  reorderLevel: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
```

**API endpoints**:
```typescript
// api/inventory/index.ts - GET /api/inventory
// api/inventory/update.ts - PUT /api/inventory/:id
```

**Check inventory on order**:
```typescript
// api/orders/create.ts
// Before creating order, check if ingredients are in stock
for (const item of items) {
  const ingredients = getIngredientsForCeviche(item.cevicheType);
  for (const ingredient of ingredients) {
    const stock = await Inventory.findOne({ ingredient });
    if (!stock || stock.quantityInStock < item.quantity * 0.5) {
      return errorResponse(res, `Ingredient ${ingredient} out of stock`, 400);
    }
  }
}
```

**Admin UI**:
```typescript
// src/pages/InventoryPage.tsx
// - Display current stock levels
// - Highlight low stock items
// - Allow updating quantities
// - Show usage trends
```

**Estimated Time**: 12 hours

---

## 🔮 Phase 4: ADVANCED FEATURES (Week 4+)

### 24. Actual Payment Integration
**Options**:
- **Stripe** - International, well-documented
- **MercadoPago** - Popular in Latin America
- **Wompi** - Costa Rica-specific

**Implementation** (Stripe example):
```bash
npm install stripe @stripe/stripe-js
```

```typescript
// api/lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createPaymentIntent(amount: number) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'crc', // Costa Rican Colón
    payment_method_types: ['card']
  });
}
```

**Estimated Time**: 16 hours

---

### 25. Real-time Admin Dashboard
**WebSocket implementation for live order updates**

```bash
npm install socket.io socket.io-client
```

**Estimated Time**: 12 hours

---

### 26. Analytics Dashboard
**Track**:
- Sales by day/week/month
- Most popular items
- Average order value
- Customer retention

**Estimated Time**: 10 hours

---

### 27. Mobile App (React Native)
**Convert to mobile app for better user experience**

**Estimated Time**: 40+ hours

---

## 🎯 Quick Wins (Can do anytime)

### Quick Fix 1: Add .env.example
```bash
# Create template
cp .env.local .env.example
# Remove actual values
sed -i 's/=.*/=your_value_here/' .env.example
git add .env.example
```
**Time**: 5 minutes

---

### Quick Fix 2: Remove Completed TODOs
**Files**:
- `src/components/MenuCeviches.tsx:27` - Navigate to checkout (done)
- `src/pages/CheckoutPage.tsx:54` - Fetch user data (decide if needed)

**Time**: 10 minutes

---

### Quick Fix 3: Add Loading Spinners
Replace "Loading..." text with proper spinners

```typescript
// src/components/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  );
}
```
**Time**: 30 minutes

---

### Quick Fix 4: Add Favicon and Meta Tags
```html
<!-- public/index.html -->
<link rel="icon" type="image/png" href="/favicon.png" />
<meta name="description" content="Ceviche de mi Tata - Pedidos en línea" />
<meta property="og:title" content="Ceviche de mi Tata" />
<meta property="og:description" content="Los mejores ceviches, pedidos en línea" />
```
**Time**: 15 minutes

---

## 📋 Testing Checklist

Before deploying to production:

### Security
- [ ] All credentials rotated
- [ ] .env.local removed from git history
- [ ] CORS configured
- [ ] Rate limiting implemented
- [ ] Security headers added
- [ ] Input validation on all endpoints
- [ ] File upload validation
- [ ] SQL injection prevented (using Mongoose)
- [ ] XSS protection implemented

### Functionality
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Password reset works
- [ ] Order creation works
- [ ] Order status updates work
- [ ] Admin dashboard works
- [ ] Payment proof upload works
- [ ] Cart persists across sessions

### Performance
- [ ] Images moved to cloud storage
- [ ] Database indexes created
- [ ] Components memoized
- [ ] Bundle size < 500KB
- [ ] Page load time < 3s

### Code Quality
- [ ] No TypeScript errors
- [ ] No console.log in production
- [ ] All 'any' types replaced
- [ ] Test coverage > 60%
- [ ] ESLint passes
- [ ] No duplicate code

---

## 📊 Progress Tracking

Use this table to track progress:

| Phase | Task | Priority | Status | Estimated | Actual | Notes |
|-------|------|----------|--------|-----------|--------|-------|
| 0 | Rotate credentials | Critical | ⬜ | 2h | | |
| 0 | Add CORS | Critical | ⬜ | 3h | | |
| 0 | Rate limiting | Critical | ⬜ | 4h | | |
| 0 | Security headers | Critical | ⬜ | 1h | | |
| 1 | Cloud storage | High | ⬜ | 6h | | |
| 1 | Input validation | High | ⬜ | 8h | | |
| 1 | API responses | High | ⬜ | 4h | | |
| 1 | Type safety | High | ⬜ | 4h | | |
| 1 | Password reset | High | ⬜ | 6h | | |
| 1 | Extract duplicates | High | ⬜ | 2h | | |
| 2 | Add tests | Medium | ⬜ | 12h | | |
| 2 | Cart persistence | Medium | ⬜ | 2h | | |
| 2 | Toast notifications | Medium | ⬜ | 3h | | |
| 2 | Split components | Medium | ⬜ | 4h | | |
| 2 | File validation | Medium | ⬜ | 3h | | |
| 2 | DB indexes | Medium | ⬜ | 1h | | |
| 2 | Error boundary | Medium | ⬜ | 2h | | |
| 2 | useCallback | Medium | ⬜ | 3h | | |

**Total Estimated Time**: ~80 hours (2 weeks full-time)

---

## 🚀 Deployment Strategy

### Staging Environment
1. Deploy all Phase 0 changes to staging
2. Test thoroughly
3. Fix any issues
4. Deploy to production

### Production Deployment
1. Run full test suite
2. Build production bundle
3. Deploy to Vercel
4. Monitor error logs
5. Test critical flows
6. Monitor performance

### Rollback Plan
If issues found in production:
1. Revert to previous deployment
2. Fix issues in staging
3. Re-deploy

---

## 📞 Support and Questions

When resuming work on this roadmap, you can:

1. **Start specific phase**: "Let's start Phase 0, task 1: Rotate credentials"
2. **Ask for clarification**: "Explain how to implement task X"
3. **Get code examples**: "Show me the implementation for task Y"
4. **Update progress**: "Mark task Z as complete"

---

## 📝 Notes

- Prioritize security fixes before adding features
- Test each change in staging before production
- Keep this document updated as you complete tasks
- Add new tasks as they're identified
- Estimated times are for one developer; adjust based on your team size

---

**Last Updated**: 2025-11-18
**Next Review Date**: When resuming work

---

## Conclusion

This roadmap provides a clear path from the current MVP state to a production-ready application. Focus on security first (Phase 0), then critical functionality (Phase 1), followed by code quality and features (Phases 2-4).

Good luck! 🎉
