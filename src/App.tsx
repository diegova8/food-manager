import { useState, useMemo, useEffect } from 'react';
import MatrizCostos from './components/MatrizCostos';
import CatalogoCeviches from './components/CatalogoCeviches';
import CalculadoraPedidos from './components/CalculadoraPedidos';
import MenuCeviches from './components/MenuCeviches';
import type { RawMaterialPrices, CevicheCost } from './types';
import { getCevichesList, calculateCevicheCost, calculateMezclaJugoCostPerLiter } from './utils';

function App() {
  const [prices, setPrices] = useState<RawMaterialPrices>({
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
  });

  const [markup, setMarkup] = useState<number>(2.5);

  // Cargar precios personalizados desde localStorage
  const [customPrices, setCustomPrices] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('customPrices');
    return saved ? JSON.parse(saved) : {};
  });

  // Guardar precios personalizados en localStorage cuando cambien
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
        </header>

        <div className="space-y-8">
          <MenuCeviches cevicheCosts={cevicheCosts} customPrices={customPrices} />

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

export default App;
