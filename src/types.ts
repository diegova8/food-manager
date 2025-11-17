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
