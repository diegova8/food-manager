export interface RawMaterialPrices {
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
}

export interface CevicheIngredients {
  pescado?: number;
  camaron?: number;
  pulpo?: number;
  piangua?: number;
}

export interface Ceviche {
  id: string;
  name: string;
  ingredients: CevicheIngredients;
  olores: number;
  mezclaJugo: number; // en mL
}

export interface CevicheCost {
  ceviche: Ceviche;
  costoProd: number;
  precioVenta: number;
}

export interface OrderItem {
  cevicheId: string;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';

export interface PersonalInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface Order {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  guestInfo?: PersonalInfo;
  items: Array<{
    cevicheType: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryMethod: 'pickup' | 'uber-flash';
  paymentProof: string;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
