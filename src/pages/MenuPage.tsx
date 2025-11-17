import { useState, useMemo } from 'react';
import MenuCeviches from '../components/MenuCeviches';
import type { CevicheCost } from '../types';
import { getCevichesList, calculateCevicheCost, calculateMezclaJugoCostPerLiter } from '../utils';
import defaultConfig from '../config/defaultPrices.json';

function MenuPage() {
  // Cargar precios desde localStorage o usar valores por defecto
  const prices = useMemo(() => {
    const saved = localStorage.getItem('rawMaterialPrices');
    return saved ? JSON.parse(saved) : defaultConfig.rawMaterials;
  }, []);

  const markup = useMemo(() => {
    const saved = localStorage.getItem('markup');
    return saved ? parseFloat(saved) : defaultConfig.markup;
  }, []);

  const [customPrices] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('customPrices');
    return saved ? JSON.parse(saved) : defaultConfig.customPrices;
  });

  const cevicheCosts = useMemo<CevicheCost[]>(() => {
    const ceviches = getCevichesList();
    const mezclaJugoCostPerLiter = calculateMezclaJugoCostPerLiter(prices);

    return ceviches.map(ceviche => {
      const costoProd = calculateCevicheCost(ceviche, prices, mezclaJugoCostPerLiter);
      const precioVenta = costoProd * markup;

      return {
        ceviche,
        costoProd,
        precioVenta
      };
    });
  }, [prices, markup]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <MenuCeviches cevicheCosts={cevicheCosts} customPrices={customPrices} />
      </div>
    </div>
  );
}

export default MenuPage;
