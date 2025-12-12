// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Orders
export const ORDER_STATUSES = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  ready: 'Listo',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

// Tickets
export const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Abierto',
  in_progress: 'En Proceso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

export const TICKET_TYPES = ['suggestion', 'bug'] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  suggestion: 'Sugerencia',
  bug: 'Error',
};

// Delivery Methods
export const DELIVERY_METHODS = ['pickup', 'uber-flash'] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  pickup: 'Recoger en tienda',
  'uber-flash': 'Uber Flash',
};

// User Roles
export const USER_ROLES = ['customer', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Cliente',
  admin: 'Administrador',
};

// Ceviche Ingredients (for reference)
export const CEVICHE_INGREDIENTS = {
  pescado: { emoji: '🐟', label: 'Pescado' },
  camaron: { emoji: '🦐', label: 'Camarón' },
  pulpo: { emoji: '🐙', label: 'Pulpo' },
  piangua: { emoji: '🐚', label: 'Piangua' },
} as const;

// API Endpoints (for reference)
export const API_ENDPOINTS = {
  orders: '/api/orders',
  users: '/api/users',
  tickets: '/api/tickets',
  config: '/api/config',
  auth: '/api/auth',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  theme: 'theme',
  sidebarCollapsed: 'sidebar_collapsed',
} as const;

// Limits
export const LIMITS = {
  maxBulkDelete: 50,
  maxFileUploadSize: 5 * 1024 * 1024, // 5MB
  debounceMs: 300,
  autoSaveMs: 1000,
} as const;

// Colors (for charts and visual elements)
export const CHART_COLORS = {
  primary: '#f97316', // orange-500
  secondary: '#06b6d4', // cyan-500
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
  purple: '#8b5cf6', // violet-500
} as const;

// Date Formats
export const DATE_FORMATS = {
  short: { day: '2-digit', month: '2-digit', year: 'numeric' } as Intl.DateTimeFormatOptions,
  medium: { day: 'numeric', month: 'short', year: 'numeric' } as Intl.DateTimeFormatOptions,
  long: { day: 'numeric', month: 'long', year: 'numeric' } as Intl.DateTimeFormatOptions,
  withTime: {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  } as Intl.DateTimeFormatOptions,
} as const;
