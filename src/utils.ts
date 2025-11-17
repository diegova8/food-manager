import type { RawMaterialPrices, Ceviche, CevicheCost } from './types';

export const formatCurrency = (amount: number): string => {
  return `₡${amount.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const calculateMezclaJugoCostPerLiter = (prices: RawMaterialPrices): number => {
  // 500mL jugo limón + 500mL jugo naranja + 33g sal + 33g azúcar
  const costoJugoLimon = 500 * prices.jugoLimon;
  const costoJugoNaranja = 500 * prices.jugoNaranja;
  const costoSal = 33 * prices.sal;
  const costoAzucar = 33 * prices.azucar;

  return costoJugoLimon + costoJugoNaranja + costoSal + costoAzucar;
};

export const calculateCevicheCost = (
  ceviche: Ceviche,
  prices: RawMaterialPrices,
  mezclaJugoCostPerLiter: number
): number => {
  let cost = 0;

  // Costo de ingredientes principales
  if (ceviche.ingredients.pescado) {
    cost += ceviche.ingredients.pescado * prices.pescado;
  }
  if (ceviche.ingredients.camaron) {
    cost += ceviche.ingredients.camaron * prices.camaron;
  }
  if (ceviche.ingredients.pulpo) {
    cost += ceviche.ingredients.pulpo * prices.pulpo;
  }
  if (ceviche.ingredients.piangua) {
    cost += ceviche.ingredients.piangua * prices.piangua;
  }

  // Costo de olores
  cost += ceviche.olores * prices.olores;

  // Costo de mezcla de jugo (convertir mL a L)
  cost += (ceviche.mezclaJugo / 1000) * mezclaJugoCostPerLiter;

  // Costo de envase
  cost += prices.envase;

  return cost;
};

export const getCevichesList = (): Ceviche[] => {
  const ceviches: Ceviche[] = [];

  // 1 ingrediente (300g o 50 unidades para piangua)
  ceviches.push({
    id: 'pescado',
    name: 'Pescado',
    ingredients: { pescado: 300 },
    olores: 100,
    mezclaJugo: 300
  });

  ceviches.push({
    id: 'camaron',
    name: 'Camarón',
    ingredients: { camaron: 280 },
    olores: 100,
    mezclaJugo: 300
  });

  ceviches.push({
    id: 'pulpo',
    name: 'Pulpo',
    ingredients: { pulpo: 280 },
    olores: 100,
    mezclaJugo: 300
  });

  ceviches.push({
    id: 'piangua',
    name: 'Piangua',
    ingredients: { piangua: 50 }, // 50 unidades
    olores: 100,
    mezclaJugo: 300
  });

  // 2 ingredientes (150g/150g o 25 unidades para piangua)
  ceviches.push({
    id: 'pescado-camaron',
    name: 'Pescado-Camarón',
    ingredients: { pescado: 150, camaron: 150 },
    olores: 100,
    mezclaJugo: 300
  });

  ceviches.push({
    id: 'pescado-pulpo',
    name: 'Pescado-Pulpo',
    ingredients: { pescado: 150, pulpo: 150 },
    olores: 100,
    mezclaJugo: 300
  });

  ceviches.push({
    id: 'pescado-piangua',
    name: 'Pescado-Piangua',
    ingredients: { pescado: 150, piangua: 25 },
    olores: 100,
    mezclaJugo: 300
  });

  ceviches.push({
    id: 'camaron-pulpo',
    name: 'Camarón-Pulpo',
    ingredients: { camaron: 150, pulpo: 150 },
    olores: 100,
    mezclaJugo: 300
  });

  ceviches.push({
    id: 'camaron-piangua',
    name: 'Camarón-Piangua',
    ingredients: { camaron: 150, piangua: 25 },
    olores: 100,
    mezclaJugo: 300
  });

  ceviches.push({
    id: 'pulpo-piangua',
    name: 'Pulpo-Piangua',
    ingredients: { pulpo: 150, piangua: 25 },
    olores: 100,
    mezclaJugo: 300
  });

  // 3 ingredientes (100g cada uno o 16.67 unidades para piangua)
  ceviches.push({
    id: 'pescado-camaron-pulpo',
    name: 'Pescado-Camarón-Pulpo',
    ingredients: { pescado: 100, camaron: 100, pulpo: 100 },
    olores: 100,
    mezclaJugo: 300
  });

  ceviches.push({
    id: 'pescado-camaron-piangua',
    name: 'Pescado-Camarón-Piangua',
    ingredients: { pescado: 100, camaron: 100, piangua: 16.67 },
    olores: 100,
    mezclaJugo: 300
  });

  ceviches.push({
    id: 'pescado-pulpo-piangua',
    name: 'Pescado-Pulpo-Piangua',
    ingredients: { pescado: 100, pulpo: 100, piangua: 16.67 },
    olores: 100,
    mezclaJugo: 300
  });

  ceviches.push({
    id: 'camaron-pulpo-piangua',
    name: 'Camarón-Pulpo-Piangua',
    ingredients: { camaron: 100, pulpo: 100, piangua: 16.67 },
    olores: 100,
    mezclaJugo: 300
  });

  // 4 ingredientes (75g cada uno o 12.5 unidades para piangua)
  ceviches.push({
    id: 'pescado-camaron-pulpo-piangua',
    name: 'Pescado-Camarón-Pulpo-Piangua',
    ingredients: { pescado: 75, camaron: 75, pulpo: 75, piangua: 12.5 },
    olores: 100,
    mezclaJugo: 300
  });

  return ceviches;
};
