import type { RawMaterialPrices, Ceviche } from './types';

export const formatCurrency = (amount: number): string => {
  return `₡${amount.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Parse a date string from the API (ISO format) and return a Date object
 * that displays correctly in the local timezone without shifting days.
 * This is needed because MongoDB stores dates in UTC, which can cause
 * dates to appear one day earlier when displayed.
 */
export const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date();

  // If it's an ISO string with time component, extract just the date part
  // and create a date at noon local time to avoid timezone issues
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);

  // Create date at noon local time to avoid any timezone shifting
  return new Date(year, month - 1, day, 12, 0, 0);
};

/**
 * Format a date string from the API for display
 */
export const formatDateDisplay = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string => {
  const date = parseDate(dateString);
  return date.toLocaleDateString('es-CR', options);
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

  ceviches.push({
    id: 'pescado',
    name: 'Pescado',
    ingredients: { pescado: 300 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'camaron',
    name: 'Camarón',
    ingredients: { camaron: 280 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'pulpo',
    name: 'Pulpo',
    ingredients: { pulpo: 280 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'piangua',
    name: 'Piangua',
    ingredients: { piangua: 50 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'pescado-camaron',
    name: 'Pescado-Camarón',
    ingredients: { pescado: 150, camaron: 150 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'pescado-pulpo',
    name: 'Pescado-Pulpo',
    ingredients: { pescado: 150, pulpo: 150 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'pescado-piangua',
    name: 'Pescado-Piangua',
    ingredients: { pescado: 150, piangua: 25 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'camaron-pulpo',
    name: 'Camarón-Pulpo',
    ingredients: { camaron: 150, pulpo: 150 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'camaron-piangua',
    name: 'Camarón-Piangua',
    ingredients: { camaron: 150, piangua: 25 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'pulpo-piangua',
    name: 'Pulpo-Piangua',
    ingredients: { pulpo: 150, piangua: 25 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'pescado-camaron-pulpo',
    name: 'Pescado-Camarón-Pulpo',
    ingredients: { pescado: 100, camaron: 100, pulpo: 100 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'pescado-camaron-piangua',
    name: 'Pescado-Camarón-Piangua',
    ingredients: { pescado: 100, camaron: 100, piangua: 16.67 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'pescado-pulpo-piangua',
    name: 'Pescado-Pulpo-Piangua',
    ingredients: { pescado: 100, pulpo: 100, piangua: 16.67 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'camaron-pulpo-piangua',
    name: 'Camarón-Pulpo-Piangua',
    ingredients: { camaron: 100, pulpo: 100, piangua: 16.67 },
    olores: 80,
    mezclaJugo: 250
  });

  ceviches.push({
    id: 'pescado-camaron-pulpo-piangua',
    name: 'Pescado-Camarón-Pulpo-Piangua',
    ingredients: { pescado: 100, camaron: 100, pulpo: 90, piangua: 12.5 },
    olores: 80,
    mezclaJugo: 250
  });

  return ceviches;
};

/**
 * Count the number of ingredients in a ceviche
 */
export const countCevicheIngredients = (ceviche: Ceviche): number => {
  return Object.values(ceviche.ingredients).filter(v => v !== undefined && v > 0).length;
};

/**
 * Filter ceviches by number of ingredients
 */
export const filterCevichesByIngredientCount = <T extends { ceviche: Ceviche }>(
  cevicheCosts: T[],
  count: number
): T[] => {
  return cevicheCosts.filter(c => countCevicheIngredients(c.ceviche) === count);
};

/**
 * Categorize ceviches by ingredient count
 * Returns an object with arrays for 1, 2, 3, and 4+ ingredients
 */
export const categorizeByIngredientCount = <T extends { ceviche: Ceviche }>(
  cevicheCosts: T[]
) => {
  return {
    single: filterCevichesByIngredientCount(cevicheCosts, 1),
    double: filterCevichesByIngredientCount(cevicheCosts, 2),
    triple: filterCevichesByIngredientCount(cevicheCosts, 3),
    quadruple: filterCevichesByIngredientCount(cevicheCosts, 4)
  };
};
