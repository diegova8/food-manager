/**
 * PayPal Sandbox Test Card Data
 *
 * IMPORTANT: This data should ONLY be used in development/sandbox environments.
 * These are official PayPal sandbox test cards for different scenarios.
 */

export type TestScenario = 'approved' | 'declined' | 'insufficient_funds' | 'expired' | 'invalid_cvv';

export interface TestCard {
  id: string;
  name: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  scenario: TestScenario;
  description: string;
  emoji: string;
}

export const PAYPAL_TEST_CARDS: TestCard[] = [
  {
    id: 'visa-approved',
    name: 'Visa - Aprobada',
    cardNumber: '4032039705230457',
    expiry: '12/2028',
    cvv: '123',
    cardholderName: 'John Doe',
    billingAddress: {
      addressLine1: '123 Test Street',
      city: 'San Jose',
      state: 'San Jose',
      postalCode: '10101',
      country: 'CR'
    },
    scenario: 'approved',
    description: 'Transacción exitosa',
    emoji: '✅'
  },
  {
    id: 'visa-approved-alt',
    name: 'Visa - Aprobada (Alt)',
    cardNumber: '4111111111111111',
    expiry: '01/2029',
    cvv: '456',
    cardholderName: 'Jane Smith',
    billingAddress: {
      addressLine1: '456 Main Avenue',
      city: 'San Jose',
      state: 'San Jose',
      postalCode: '10102',
      country: 'CR'
    },
    scenario: 'approved',
    description: 'Transacción exitosa (alternativa)',
    emoji: '✅'
  },
  {
    id: 'mastercard-approved',
    name: 'Mastercard - Aprobada',
    cardNumber: '5425233430109903',
    expiry: '03/2027',
    cvv: '789',
    cardholderName: 'Maria Garcia',
    billingAddress: {
      addressLine1: '789 Oak Boulevard',
      city: 'San Jose',
      state: 'San Jose',
      postalCode: '10103',
      country: 'CR'
    },
    scenario: 'approved',
    description: 'Transacción exitosa',
    emoji: '✅'
  },
  {
    id: 'mastercard-approved-alt',
    name: 'Mastercard - Aprobada (Alt)',
    cardNumber: '5555555555554444',
    expiry: '05/2028',
    cvv: '321',
    cardholderName: 'Carlos Rodriguez',
    billingAddress: {
      addressLine1: '321 Pine Street',
      city: 'Heredia',
      state: 'Heredia',
      postalCode: '40101',
      country: 'CR'
    },
    scenario: 'approved',
    description: 'Transacción exitosa (alternativa)',
    emoji: '✅'
  },
  {
    id: 'amex-approved',
    name: 'American Express - Aprobada',
    cardNumber: '378282246310005',
    expiry: '06/2027',
    cvv: '1234',
    cardholderName: 'Ana Martinez',
    billingAddress: {
      addressLine1: '555 Maple Drive',
      city: 'Cartago',
      state: 'Cartago',
      postalCode: '30101',
      country: 'CR'
    },
    scenario: 'approved',
    description: 'Transacción exitosa',
    emoji: '✅'
  },
  {
    id: 'discover-approved',
    name: 'Discover - Aprobada',
    cardNumber: '6011111111111117',
    expiry: '09/2028',
    cvv: '654',
    cardholderName: 'Pedro Jimenez',
    billingAddress: {
      addressLine1: '777 Cedar Lane',
      city: 'Alajuela',
      state: 'Alajuela',
      postalCode: '20101',
      country: 'CR'
    },
    scenario: 'approved',
    description: 'Transacción exitosa',
    emoji: '✅'
  },
  {
    id: 'visa-declined',
    name: 'Visa - Rechazada',
    cardNumber: '4000000000000002',
    expiry: '12/2027',
    cvv: '111',
    cardholderName: 'Test Declined',
    billingAddress: {
      addressLine1: '999 Decline Street',
      city: 'San Jose',
      state: 'San Jose',
      postalCode: '10199',
      country: 'CR'
    },
    scenario: 'declined',
    description: 'Tarjeta rechazada por el banco',
    emoji: '❌'
  },
  {
    id: 'visa-insufficient',
    name: 'Visa - Fondos Insuficientes',
    cardNumber: '4000000000009995',
    expiry: '11/2027',
    cvv: '222',
    cardholderName: 'Test Insufficient',
    billingAddress: {
      addressLine1: '888 NoFunds Avenue',
      city: 'San Jose',
      state: 'San Jose',
      postalCode: '10188',
      country: 'CR'
    },
    scenario: 'insufficient_funds',
    description: 'Fondos insuficientes en la cuenta',
    emoji: '💳'
  },
  {
    id: 'visa-expired',
    name: 'Visa - Expirada',
    cardNumber: '4000000000000069',
    expiry: '01/2020',
    cvv: '333',
    cardholderName: 'Test Expired',
    billingAddress: {
      addressLine1: '666 Expired Road',
      city: 'San Jose',
      state: 'San Jose',
      postalCode: '10177',
      country: 'CR'
    },
    scenario: 'expired',
    description: 'Tarjeta expirada',
    emoji: '📅'
  },
  {
    id: 'visa-invalid-cvv',
    name: 'Visa - CVV Inválido',
    cardNumber: '4000000000000127',
    expiry: '08/2027',
    cvv: '999',
    cardholderName: 'Test Invalid CVV',
    billingAddress: {
      addressLine1: '444 CVV Error Lane',
      city: 'San Jose',
      state: 'San Jose',
      postalCode: '10166',
      country: 'CR'
    },
    scenario: 'invalid_cvv',
    description: 'Código CVV inválido',
    emoji: '🔒'
  }
];

/**
 * Get test cards filtered by scenario
 */
export function getCardsByScenario(scenario: TestScenario): TestCard[] {
  return PAYPAL_TEST_CARDS.filter(card => card.scenario === scenario);
}

/**
 * Get a test card by ID
 */
export function getCardById(id: string): TestCard | undefined {
  return PAYPAL_TEST_CARDS.find(card => card.id === id);
}

/**
 * Format card number for display (with spaces)
 */
export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
