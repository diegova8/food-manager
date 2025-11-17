import { useState, useMemo } from 'react';
import MenuCeviches from '../components/MenuCeviches';
import type { CevicheCost } from '../types';
import { getCevichesList, calculateCevicheCost, calculateMezclaJugoCostPerLiter } from '../utils';

// Precios por defecto (los mismos que en Admin)
const defaultPrices = {
  pescado: 7,
  camaron: 10.5,
  pulpo: 17,
  piangua: 70,
  olores: 2,
  jugoLimon: 1.5,
  jugoNaranja: 1.1,
  sal: 0.84,
  azucar: 0.74,
  envase: 160
};

const defaultMarkup = 2.5;

function MenuPage() {
  // Cargar precios personalizados desde localStorage (si existen)
  const [customPrices] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('customPrices');
    return saved ? JSON.parse(saved) : {};
  });

  const cevicheCosts = useMemo<CevicheCost[]>(() => {
    const ceviches = getCevichesList();
    const mezclaJugoCostPerLiter = calculateMezclaJugoCostPerLiter(defaultPrices);

    return ceviches.map(ceviche => {
      const costoProd = calculateCevicheCost(ceviche, defaultPrices, mezclaJugoCostPerLiter);
      const precioVenta = costoProd * defaultMarkup;

      return {
        ceviche,
        costoProd,
        precioVenta
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <MenuCeviches cevicheCosts={cevicheCosts} customPrices={customPrices} />
      </div>
    </div>
  );
}

export default MenuPage;
