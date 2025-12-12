import mongoose, { Schema, Document } from 'mongoose';

// User Model
export interface IUser extends Document {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  birthday?: Date;
  dietaryPreferences?: string;
  emailVerified: boolean;
  isAdmin: boolean;
  marketingConsent: boolean;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // sparse allows null for admin users
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  address: { type: String },
  birthday: { type: Date },
  dietaryPreferences: { type: String },
  emailVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  marketingConsent: { type: Boolean, default: false },
  passwordResetToken: { type: String },
  passwordResetExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Note: username and email indexes are already created by the 'unique: true' option above

// Config Model
export interface IConfig extends Document {
  rawMaterials: {
    pescado: number;
    camaron: number;
    pulpo: number;
    piangua: number;
    olores: number;
    jugoLimon: number;
    jugoNaranja: number;
    sal: number;
    azucar: number;
    envase: number;
  };
  markup: number;
  customPrices: { [key: string]: number };
  updatedAt: Date;
}

const ConfigSchema = new Schema<IConfig>({
  rawMaterials: {
    pescado: { type: Number, required: true },
    camaron: { type: Number, required: true },
    pulpo: { type: Number, required: true },
    piangua: { type: Number, required: true },
    olores: { type: Number, required: true },
    jugoLimon: { type: Number, required: true },
    jugoNaranja: { type: Number, required: true },
    sal: { type: Number, required: true },
    azucar: { type: Number, required: true },
    envase: { type: Number, required: true }
  },
  markup: { type: Number, required: true },
  customPrices: { type: Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

// Order Model
export interface IOrderItem {
  cevicheType: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  guestInfo?: {
    name: string;
    phone: string;
    email?: string;
  };
  items: IOrderItem[];
  total: number;
  deliveryMethod: 'pickup' | 'uber-flash';
  scheduledDate: Date;
  paymentProof?: string; // URL to uploaded image
  notes?: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  guestInfo: {
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  items: [{
    cevicheType: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  deliveryMethod: { type: String, enum: ['pickup', 'uber-flash'], required: true },
  scheduledDate: { type: Date, required: true },
  paymentProof: { type: String },
  notes: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create indexes for Order schema
OrderSchema.index({ user: 1 }); // For fetching user's order history
OrderSchema.index({ status: 1 }); // For filtering orders by status in admin panel
OrderSchema.index({ createdAt: -1 }); // For sorting orders by date

// Email Verification Model
export interface IEmailVerification extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const EmailVerificationSchema = new Schema<IEmailVerification>({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create indexes
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Support Ticket Model
export interface ISupportTicket extends Document {
  user?: mongoose.Types.ObjectId;
  guestEmail?: string;
  guestName?: string;
  type: 'suggestion' | 'bug';
  title: string;
  description: string;
  images?: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  guestEmail: { type: String },
  guestName: { type: String },
  type: { type: String, enum: ['suggestion', 'bug'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create indexes for SupportTicket schema
SupportTicketSchema.index({ user: 1 }); // For fetching user's tickets
SupportTicketSchema.index({ status: 1 }); // For filtering tickets by status
SupportTicketSchema.index({ createdAt: -1 }); // For sorting tickets by date

// Activity Log Model
export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'login' | 'logout' | 'bulk_delete' | 'export';
  entityType: 'order' | 'user' | 'ticket' | 'config' | 'auth';
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'status_change', 'login', 'logout', 'bulk_delete', 'export'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['order', 'user', 'ticket', 'config', 'auth'],
    required: true
  },
  entityId: { type: String },
  description: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Create indexes for ActivityLog schema
ActivityLogSchema.index({ user: 1 }); // For fetching user's activity
ActivityLogSchema.index({ action: 1 }); // For filtering by action type
ActivityLogSchema.index({ entityType: 1 }); // For filtering by entity type
ActivityLogSchema.index({ createdAt: -1 }); // For sorting by date
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // Auto-delete after 90 days

// Prevent model recompilation in development
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Config = mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema);
export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const EmailVerification = mongoose.models.EmailVerification || mongoose.model<IEmailVerification>('EmailVerification', EmailVerificationSchema);
export const SupportTicket = mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
