import { useState } from 'react';
import type { CevicheCost } from '../../../types';
import { formatCurrency, categorizeByIngredientCount } from '../../../utils';
import { cn } from '../../../utils/cn';

interface CevicheCatalogCardProps {
  cevicheCosts: CevicheCost[];
  customPrices: { [key: string]: number };
  onPriceChange: (cevicheId: string, value: number) => void;
}

type CategoryFilter = 'all' | 1 | 2 | 3 | 4;

const ingredientLabels: Record<string, { emoji: string; colorClass: string }> = {
  pescado: { emoji: '🐟', colorClass: 'bg-blue-100 text-blue-700' },
  camaron: { emoji: '🦐', colorClass: 'bg-pink-100 text-pink-700' },
  pulpo: { emoji: '🐙', colorClass: 'bg-purple-100 text-purple-700' },
  piangua: { emoji: '🐚', colorClass: 'bg-amber-100 text-amber-700' },
};

export function CevicheCatalogCard({ cevicheCosts, customPrices, onPriceChange }: CevicheCatalogCardProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categorized = categorizeByIngredientCount(cevicheCosts);

  const getFilteredCeviches = () => {
    let filtered = cevicheCosts;

    if (categoryFilter !== 'all') {
      switch (categoryFilter) {
        case 1: filtered = categorized.single; break;
        case 2: filtered = categorized.double; break;
        case 3: filtered = categorized.triple; break;
        case 4: filtered = categorized.quadruple; break;
      }
    }

    if (searchTerm) {
      filtered = filtered.filter((c) =>
        c.ceviche.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredCeviches = getFilteredCeviches();

  const categoryButtons: { value: CategoryFilter; label: string; count: number }[] = [
    { value: 'all', label: 'Todos', count: cevicheCosts.length },
    { value: 1, label: '1 Ingrediente', count: categorized.single.length },
    { value: 2, label: '2 Ingredientes', count: categorized.double.length },
    { value: 3, label: '3 Ingredientes', count: categorized.triple.length },
    { value: 4, label: '4 Ingredientes', count: categorized.quadruple.length },
  ];

  const renderIngredientPills = (ceviche: CevicheCost['ceviche']) => {
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(ceviche.ingredients).map(([key, value]) => {
          if (value && value > 0) {
            const ingredient = ingredientLabels[key];
            return (
              <span
                key={key}
                className={cn('px-2 py-0.5 rounded-full text-xs font-medium', ingredient.colorClass)}
              >
                {ingredient.emoji} {key === 'piangua' ? `${value}u` : `${value}g`}
              </span>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Catálogo de Ceviches</h3>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{cevicheCosts.length}</span> combinaciones disponibles
            </p>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar ceviche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categoryButtons.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                categoryFilter === cat.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {cat.label}
              <span className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                categoryFilter === cat.value
                  ? 'bg-orange-400 text-white'
                  : 'bg-slate-200 text-slate-500'
              )}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Ceviche List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ceviche
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sugerido
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Precio Venta
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Margen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCeviches.map((c) => {
                const finalPrice = customPrices[c.ceviche.id] || c.precioVenta;
                const profit = finalPrice - c.costoProd;
                const margin = (profit / finalPrice) * 100;

                return (
                  <tr key={c.ceviche.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 mb-1">{c.ceviche.name}</div>
                      {renderIngredientPills(c.ceviche)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-slate-600">{formatCurrency(c.costoProd)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-slate-500">{formatCurrency(c.precioVenta)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₡</span>
                        <input
                          type="number"
                          step="50"
                          value={customPrices[c.ceviche.id] || ''}
                          onChange={(e) => onPriceChange(c.ceviche.id, parseFloat(e.target.value) || 0)}
                          placeholder={c.precioVenta.toFixed(0)}
                          className="w-28 pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg text-right font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                        margin >= 50 ? 'bg-green-100 text-green-700' :
                        margin >= 30 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {margin.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCeviches.length === 0 && (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500">No se encontraron ceviches</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CevicheCatalogCard;
