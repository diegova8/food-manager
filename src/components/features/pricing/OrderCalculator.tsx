import { useState, useMemo } from 'react';
import type { CevicheCost } from '../../../types';
import { formatCurrency } from '../../../utils';
import { cn } from '../../../utils/cn';

interface OrderCalculatorProps {
  cevicheCosts: CevicheCost[];
  customPrices: { [key: string]: number };
}

const getCevicheEmojis = (cevicheId: string): string => {
  const emojis: string[] = [];
  if (cevicheId.includes('pescado')) emojis.push('🐟');
  if (cevicheId.includes('camaron')) emojis.push('🦐');
  if (cevicheId.includes('pulpo')) emojis.push('🐙');
  if (cevicheId.includes('piangua')) emojis.push('🐚');
  return emojis.join('');
};

export function OrderCalculator({ cevicheCosts, customPrices }: OrderCalculatorProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (cevicheId: string, value: number) => {
    setQuantities({ ...quantities, [cevicheId]: value });
  };

  const orderSummary = useMemo(() => {
    let totalCost = 0;
    let totalRevenue = 0;
    const rawMaterials = {
      pescado: 0,
      camaron: 0,
      pulpo: 0,
      piangua: 0,
      olores: 0,
      mezclaJugo: 0,
      envases: 0
    };

    Object.entries(quantities).forEach(([cevicheId, qty]) => {
      if (qty > 0) {
        const cevicheCost = cevicheCosts.find(c => c.ceviche.id === cevicheId);
        if (cevicheCost) {
          const finalPrice = customPrices[cevicheId] || cevicheCost.precioVenta;
          totalCost += cevicheCost.costoProd * qty;
          totalRevenue += finalPrice * qty;

          const { ingredients, olores, mezclaJugo } = cevicheCost.ceviche;
          if (ingredients.pescado) rawMaterials.pescado += ingredients.pescado * qty;
          if (ingredients.camaron) rawMaterials.camaron += ingredients.camaron * qty;
          if (ingredients.pulpo) rawMaterials.pulpo += ingredients.pulpo * qty;
          if (ingredients.piangua) rawMaterials.piangua += ingredients.piangua * qty;
          rawMaterials.olores += olores * qty;
          rawMaterials.mezclaJugo += mezclaJugo * qty;
          rawMaterials.envases += qty;
        }
      }
    });

    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      totalCost,
      totalRevenue,
      profit,
      margin,
      itemCount: Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
      rawMaterials
    };
  }, [quantities, cevicheCosts, customPrices]);

  const resetOrder = () => {
    setQuantities({});
  };

  const orderItems = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([cevicheId, qty]) => {
      const cevicheCost = cevicheCosts.find(c => c.ceviche.id === cevicheId);
      if (!cevicheCost) return null;
      const finalPrice = customPrices[cevicheId] || cevicheCost.precioVenta;
      return {
        id: cevicheId,
        name: cevicheCost.ceviche.name,
        quantity: qty,
        unitPrice: finalPrice,
        subtotal: finalPrice * qty,
      };
    })
    .filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Ceviche Grid */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Selecciona Ceviches</h3>
              <p className="text-sm text-slate-500">Ingresa las cantidades para cada tipo</p>
            </div>
            <button
              onClick={resetOrder}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors"
            >
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto">
            {cevicheCosts.map((c) => {
              const qty = quantities[c.ceviche.id] || 0;
              const isSelected = qty > 0;

              return (
                <div
                  key={c.ceviche.id}
                  className={cn(
                    'relative p-3 rounded-xl border-2 transition-all',
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  )}
                >
                  <div className="text-center mb-2">
                    <span className="text-2xl">{getCevicheEmojis(c.ceviche.id)}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={qty || ''}
                    onChange={(e) => handleQuantityChange(c.ceviche.id, parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {qty}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Resumen del Pedido</h3>

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-600 font-medium">Total de Ceviches</p>
            <p className="text-3xl font-bold text-blue-700">{orderSummary.itemCount}</p>
          </div>

          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-sm text-orange-600 font-medium">Costo de Producción</p>
            <p className="text-2xl font-bold text-orange-700">{formatCurrency(orderSummary.totalCost)}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-sm text-purple-600 font-medium">Ingresos por Venta</p>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(orderSummary.totalRevenue)}</p>
          </div>

          <div className="bg-green-100 rounded-xl p-4 border-2 border-green-200">
            <p className="text-sm text-green-600 font-medium">Ganancia Neta</p>
            <p className="text-3xl font-bold text-green-700">{formatCurrency(orderSummary.profit)}</p>
            <p className="text-sm text-green-600 mt-1">
              Margen: <span className="font-bold">{orderSummary.margin.toFixed(1)}%</span>
            </p>
          </div>
        </div>

        {/* Raw Materials */}
        {orderSummary.itemCount > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Materia Prima</h3>
            <div className="space-y-2">
              {orderSummary.rawMaterials.pescado > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">🐟 Pescado</span>
                  <span className="font-semibold text-blue-600">{orderSummary.rawMaterials.pescado.toFixed(0)}g</span>
                </div>
              )}
              {orderSummary.rawMaterials.camaron > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">🦐 Camarón</span>
                  <span className="font-semibold text-pink-600">{orderSummary.rawMaterials.camaron.toFixed(0)}g</span>
                </div>
              )}
              {orderSummary.rawMaterials.pulpo > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">🐙 Pulpo</span>
                  <span className="font-semibold text-purple-600">{orderSummary.rawMaterials.pulpo.toFixed(0)}g</span>
                </div>
              )}
              {orderSummary.rawMaterials.piangua > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">🐚 Piangua</span>
                  <span className="font-semibold text-amber-600">{Math.ceil(orderSummary.rawMaterials.piangua)}u</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">🌿 Olores</span>
                <span className="font-semibold text-green-600">{orderSummary.rawMaterials.olores.toFixed(0)}g</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">🧃 Mezcla Jugo</span>
                <span className="font-semibold text-orange-600">{orderSummary.rawMaterials.mezclaJugo.toFixed(0)}ml</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">📦 Envases</span>
                <span className="font-semibold text-slate-600">{orderSummary.rawMaterials.envases}u</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        {orderItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Desglose</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {orderItems.map((item) => item && (
                <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <div>
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="text-slate-400 ml-2">×{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-slate-700">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderCalculator;
