import { useState, useMemo, useEffect } from 'react';
import MenuCeviches from '../components/MenuCeviches';
import type { CevicheCost, RawMaterialPrices } from '../types';
import { getCevichesList, calculateCevicheCost, calculateMezclaJugoCostPerLiter } from '../utils';
import { api } from '../services/api';
import defaultConfig from '../config/defaultPrices.json';

function MenuPage() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<RawMaterialPrices>(defaultConfig.rawMaterials);
  const [markup, setMarkup] = useState<number>(defaultConfig.markup);
  const [customPrices, setCustomPrices] = useState<{ [key: string]: number }>(defaultConfig.customPrices);

  // Cargar configuración desde la API
  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await api.getConfig();
        setPrices(config.rawMaterials);
        setMarkup(config.markup);
        setCustomPrices(config.customPrices);
      } catch (error) {
        console.error('Error loading config:', error);
        // Usar valores por defecto si falla
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <MenuCeviches cevicheCosts={cevicheCosts} customPrices={customPrices} />
      </div>
    </div>
  );
}

export default MenuPage;
