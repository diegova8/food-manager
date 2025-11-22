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
  passwordResetToken: { type: String },
  passwordResetExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

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

// Prevent model recompilation in development
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Config = mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema);
export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const EmailVerification = mongoose.models.EmailVerification || mongoose.model<IEmailVerification>('EmailVerification', EmailVerificationSchema);
