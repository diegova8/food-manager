import React from 'react';
import type { RawMaterialPrices } from '../types';
import { formatCurrency, calculateMezclaJugoCostPerLiter } from '../utils';

interface MatrizCostosProps {
  prices: RawMaterialPrices;
  setPrices: React.Dispatch<React.SetStateAction<RawMaterialPrices>>;
  markup: number;
  setMarkup: React.Dispatch<React.SetStateAction<number>>;
}

const MatrizCostos: React.FC<MatrizCostosProps> = ({ prices, setPrices, markup, setMarkup }) => {
  const mezclaJugoCostPerLiter = calculateMezclaJugoCostPerLiter(prices);

  const handlePriceChange = (key: keyof RawMaterialPrices, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPrices({ ...prices, [key]: numValue });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">1. Matriz de Costos</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Materia Prima</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Precio</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Unidad</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">Pescado</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={prices.pescado}
                  onChange={(e) => handlePriceChange('pescado', e.target.value)}
                  className="w-full px-2 py-1 border border-yellow-300 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">colones/g</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">Camarón</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={prices.camaron}
                  onChange={(e) => handlePriceChange('camaron', e.target.value)}
                  className="w-full px-2 py-1 border border-yellow-300 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">colones/g</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">Pulpo</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={prices.pulpo}
                  onChange={(e) => handlePriceChange('pulpo', e.target.value)}
                  className="w-full px-2 py-1 border border-yellow-300 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">colones/g</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">Piangua</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={prices.piangua}
                  onChange={(e) => handlePriceChange('piangua', e.target.value)}
                  className="w-full px-2 py-1 border border-yellow-300 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">colones/unidad</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">Olores</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={prices.olores}
                  onChange={(e) => handlePriceChange('olores', e.target.value)}
                  className="w-full px-2 py-1 border border-yellow-300 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">colones/g</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">Jugo Limón</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={prices.jugoLimon}
                  onChange={(e) => handlePriceChange('jugoLimon', e.target.value)}
                  className="w-full px-2 py-1 border border-yellow-300 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">colones/mL</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">Jugo Naranja</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={prices.jugoNaranja}
                  onChange={(e) => handlePriceChange('jugoNaranja', e.target.value)}
                  className="w-full px-2 py-1 border border-yellow-300 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">colones/mL</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">Sal</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={prices.sal}
                  onChange={(e) => handlePriceChange('sal', e.target.value)}
                  className="w-full px-2 py-1 border border-yellow-300 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">colones/g</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">Azúcar</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={prices.azucar}
                  onChange={(e) => handlePriceChange('azucar', e.target.value)}
                  className="w-full px-2 py-1 border border-yellow-300 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">colones/g</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">Envase</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={prices.envase}
                  onChange={(e) => handlePriceChange('envase', e.target.value)}
                  className="w-full px-2 py-1 border border-yellow-300 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">colones/unidad</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">Cálculo de Mezcla de Jugo (por litro)</h3>
        <p className="text-sm text-gray-700 mb-2">
          500mL jugo limón + 500mL jugo naranja + 33g sal + 33g azúcar
        </p>
        <p className="text-xl font-bold text-blue-600">
          Costo por litro: {formatCurrency(mezclaJugoCostPerLiter)}
        </p>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Markup (multiplicador de precio)
        </label>
        <input
          type="number"
          step="0.1"
          value={markup}
          onChange={(e) => setMarkup(parseFloat(e.target.value) || 1)}
          className="w-full md:w-48 px-3 py-2 border border-yellow-300 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <p className="text-sm text-gray-500 mt-1">
          Precio de venta = Costo × {markup}
        </p>
      </div>
    </div>
  );
};

export default MatrizCostos;
