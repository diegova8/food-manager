import { useState, useMemo, useEffect } from 'react';
import MatrizCostos from '../components/MatrizCostos';
import CatalogoCeviches from '../components/CatalogoCeviches';
import CalculadoraPedidos from '../components/CalculadoraPedidos';
import type { RawMaterialPrices, CevicheCost } from '../types';
import { getCevichesList, calculateCevicheCost, calculateMezclaJugoCostPerLiter } from '../utils';
import defaultConfig from '../config/defaultPrices.json';

function AdminPage() {
  const [prices, setPrices] = useState<RawMaterialPrices>(() => {
    const saved = localStorage.getItem('rawMaterialPrices');
    return saved ? JSON.parse(saved) : defaultConfig.rawMaterials;
  });

  const [markup, setMarkup] = useState<number>(() => {
    const saved = localStorage.getItem('markup');
    return saved ? parseFloat(saved) : defaultConfig.markup;
  });

  // Cargar precios personalizados desde localStorage
  const [customPrices, setCustomPrices] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('customPrices');
    return saved ? JSON.parse(saved) : defaultConfig.customPrices;
  });

  // Guardar todos los precios en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('rawMaterialPrices', JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    localStorage.setItem('markup', markup.toString());
  }, [markup]);

  useEffect(() => {
    localStorage.setItem('customPrices', JSON.stringify(customPrices));
  }, [customPrices]);

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

  const copyMenuLink = () => {
    const menuUrl = `${window.location.origin}/menu`;
    navigator.clipboard.writeText(menuUrl);
    alert('¡Link del menú copiado al portapapeles!');
  };

  const exportConfiguration = () => {
    const config = {
      rawMaterials: prices,
      markup: markup,
      customPrices: customPrices
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'defaultPrices.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetToDefaults = () => {
    if (confirm('¿Estás seguro de que quieres resetear todos los precios a los valores por defecto?')) {
      setPrices(defaultConfig.rawMaterials);
      setMarkup(defaultConfig.markup);
      setCustomPrices(defaultConfig.customPrices);
      localStorage.clear();
      alert('Precios reseteados a valores por defecto');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Gestión de Producción y Venta de Ceviches
          </h1>
          <p className="text-gray-600">
            Sistema integral para calcular costos, precios y ganancias
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={copyMenuLink}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              📋 Copiar link del menú público
            </button>
            <button
              onClick={exportConfiguration}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              💾 Exportar configuración
            </button>
            <button
              onClick={resetToDefaults}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
            >
              🔄 Resetear a valores por defecto
            </button>
          </div>
        </header>

        <div className="space-y-8">
          <MatrizCostos
            prices={prices}
            setPrices={setPrices}
            markup={markup}
            setMarkup={setMarkup}
          />

          <CatalogoCeviches
            cevicheCosts={cevicheCosts}
            customPrices={customPrices}
            setCustomPrices={setCustomPrices}
          />

          <CalculadoraPedidos cevicheCosts={cevicheCosts} customPrices={customPrices} />
        </div>

        <footer className="mt-8 text-center text-sm text-gray-600">
          <p>Sistema de Gestión de Ceviches - Todos los precios en colones (₡)</p>
        </footer>
      </div>
    </div>
  );
}

export default AdminPage;
