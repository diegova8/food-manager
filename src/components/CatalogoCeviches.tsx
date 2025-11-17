import React from 'react';
import type { RawMaterialPrices, CevicheCost } from '../types';
import { formatCurrency } from '../utils';

interface CatalogoCevichesProps {
  cevicheCosts: CevicheCost[];
  customPrices: { [key: string]: number };
  setCustomPrices: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
}

const CatalogoCeviches: React.FC<CatalogoCevichesProps> = ({ cevicheCosts, customPrices, setCustomPrices }) => {
  const handlePriceChange = (cevicheId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomPrices({ ...customPrices, [cevicheId]: numValue });
  };
  // Agrupar ceviches por número de ingredientes
  const singleIngredient = cevicheCosts.filter(c => {
    const count = Object.values(c.ceviche.ingredients).filter(v => v !== undefined).length;
    return count === 1;
  });

  const twoIngredients = cevicheCosts.filter(c => {
    const count = Object.values(c.ceviche.ingredients).filter(v => v !== undefined).length;
    return count === 2;
  });

  const threeIngredients = cevicheCosts.filter(c => {
    const count = Object.values(c.ceviche.ingredients).filter(v => v !== undefined).length;
    return count === 3;
  });

  const fourIngredients = cevicheCosts.filter(c => {
    const count = Object.values(c.ceviche.ingredients).filter(v => v !== undefined).length;
    return count === 4;
  });

  const renderIngredientPills = (ceviche: CevicheCost['ceviche']) => {
    const ingredientLabels: { [key: string]: { emoji: string; color: string } } = {
      pescado: { emoji: '🐟', color: 'bg-blue-100 text-blue-700' },
      camaron: { emoji: '🦐', color: 'bg-pink-100 text-pink-700' },
      pulpo: { emoji: '🐙', color: 'bg-purple-100 text-purple-700' },
      piangua: { emoji: '🐚', color: 'bg-amber-100 text-amber-700' }
    };

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {/* Ingredientes principales */}
        {Object.entries(ceviche.ingredients).map(([key, value]) => {
          if (value && value > 0) {
            const ingredient = ingredientLabels[key];
            return (
              <span
                key={key}
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${ingredient.color}`}
              >
                {ingredient.emoji} {key === 'piangua' ? `${value}u` : `${value}g`}
              </span>
            );
          }
          return null;
        })}

        {/* Olores */}
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          🌿 {ceviche.olores}g
        </span>

        {/* Mezcla de jugo */}
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          🧃 {ceviche.mezclaJugo}ml
        </span>

        {/* Envase */}
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          📦 1u
        </span>
      </div>
    );
  };

  const renderCevicheTable = (ceviches: CevicheCost[], title: string) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-blue-700">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Ceviche</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Costo Producción</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Precio Sugerido</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Precio de Venta</th>
            </tr>
          </thead>
          <tbody>
            {ceviches.map((c) => (
              <tr key={c.ceviche.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  <div className="font-medium">{c.ceviche.name}</div>
                  {renderIngredientPills(c.ceviche)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {formatCurrency(c.costoProd)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-gray-600">
                  {formatCurrency(c.precioVenta)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={customPrices[c.ceviche.id] || ''}
                    onChange={(e) => handlePriceChange(c.ceviche.id, e.target.value)}
                    placeholder={c.precioVenta.toFixed(2)}
                    className="w-full px-2 py-1 border border-yellow-300 rounded bg-yellow-50 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">2. Catálogo de Ceviches</h2>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Total de combinaciones:</span> {cevicheCosts.length}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Los precios se actualizan automáticamente según los valores en la Matriz de Costos
        </p>
      </div>

      {renderCevicheTable(singleIngredient, `1 Ingrediente (${singleIngredient.length})`)}
      {renderCevicheTable(twoIngredients, `2 Ingredientes (${twoIngredients.length})`)}
      {renderCevicheTable(threeIngredients, `3 Ingredientes (${threeIngredients.length})`)}
      {renderCevicheTable(fourIngredients, `4 Ingredientes (${fourIngredients.length})`)}
    </div>
  );
};

export default CatalogoCeviches;
