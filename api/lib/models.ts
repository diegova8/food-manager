import mongoose, { Schema, Document } from 'mongoose';

// User Model
export interface IUser extends Document {
  username: string;
  password: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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

// Prevent model recompilation in development
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Config = mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema);
