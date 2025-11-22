import { useState, useMemo, useEffect } from 'react';
import MenuCeviches from '../components/MenuCeviches';
import Header from '../components/Header';
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6">
            <svg className="animate-spin h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-slate-600 font-medium text-lg">Cargando menú...</p>
          <p className="text-slate-400 text-sm mt-1">Preparando los mejores ceviches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <MenuCeviches cevicheCosts={cevicheCosts} customPrices={customPrices} />
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
