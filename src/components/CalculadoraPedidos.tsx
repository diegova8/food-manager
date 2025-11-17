import React, { useState, useMemo } from 'react';
import type { CevicheCost } from '../types';
import { formatCurrency } from '../utils';

interface CalculadoraPedidosProps {
  cevicheCosts: CevicheCost[];
  customPrices: { [key: string]: number };
}

const CalculadoraPedidos: React.FC<CalculadoraPedidosProps> = ({ cevicheCosts, customPrices }) => {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (cevicheId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantities({ ...quantities, [cevicheId]: numValue });
  };

  const getCevicheEmojis = (cevicheId: string): string => {
    const emojis: string[] = [];
    if (cevicheId.includes('pescado')) emojis.push('🐟');
    if (cevicheId.includes('camaron')) emojis.push('🦐');
    if (cevicheId.includes('pulpo')) emojis.push('🐙');
    if (cevicheId.includes('piangua')) emojis.push('🐚');
    return emojis.join('');
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

          // Acumular materia prima
          const { ingredients, olores, mezclaJugo } = cevicheCost.ceviche;
          if (ingredients.pescado) rawMaterials.pescado += ingredients.pescado * qty;
          if (ingredients.camaron) rawMaterials.camaron += ingredients.camaron * qty;
          if (ingredients.pulpo) rawMaterials.pulpo += ingredients.pulpo * qty;
          if (ingredients.piangua) rawMaterials.piangua += ingredients.piangua * qty;
          rawMaterials.olores += olores * qty;
          rawMaterials.mezclaJugo += mezclaJugo * qty;
          rawMaterials.envases += qty; // 1 envase por ceviche
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">3. Calculadora de Pedidos</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de entrada */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Cantidades por tipo de ceviche</h3>
          <div className="max-h-[600px] overflow-y-auto pr-2">
            <div className="grid grid-cols-3 gap-3">
              {cevicheCosts.map((c) => (
                <div key={c.ceviche.id} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="number"
                    min="0"
                    value={quantities[c.ceviche.id] || ''}
                    onChange={(e) => handleQuantityChange(c.ceviche.id, e.target.value)}
                    placeholder="0"
                    className="w-full px-2 py-2 mb-2 border border-yellow-300 rounded bg-yellow-50 text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold text-lg"
                  />
                  <div className="text-2xl">{getCevicheEmojis(c.ceviche.id)}</div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={resetOrder}
            className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Limpiar pedido
          </button>
        </div>

        {/* Resumen del pedido */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Resumen del Pedido</h3>

          <div className="space-y-4">
            {/* Total de items */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Total de ceviches</p>
              <p className="text-2xl font-bold text-blue-600">{orderSummary.itemCount}</p>
            </div>

            {/* Costo de producción */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600">Costo total de producción</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(orderSummary.totalCost)}
              </p>
            </div>

            {/* Ingresos esperados */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600">Ingresos esperados por venta</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(orderSummary.totalRevenue)}
              </p>
            </div>

            {/* Ganancia neta */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Ganancia neta</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(orderSummary.profit)}
              </p>
            </div>

            {/* Margen de ganancia */}
            <div className="p-4 bg-green-100 rounded-lg border border-green-300">
              <p className="text-sm text-gray-600">Margen de ganancia</p>
              <p className="text-2xl font-bold text-green-700">
                {orderSummary.margin.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Desglose de materia prima */}
          {orderSummary.itemCount > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3 text-gray-700">Materia Prima Requerida</h4>
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {orderSummary.rawMaterials.pescado > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Pescado:</span>
                      <span className="font-semibold text-blue-700">{orderSummary.rawMaterials.pescado.toFixed(1)}g</span>
                    </div>
                  )}
                  {orderSummary.rawMaterials.camaron > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Camarón:</span>
                      <span className="font-semibold text-pink-700">{orderSummary.rawMaterials.camaron.toFixed(1)}g</span>
                    </div>
                  )}
                  {orderSummary.rawMaterials.pulpo > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Pulpo:</span>
                      <span className="font-semibold text-purple-700">{orderSummary.rawMaterials.pulpo.toFixed(1)}g</span>
                    </div>
                  )}
                  {orderSummary.rawMaterials.piangua > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Piangua:</span>
                      <span className="font-semibold text-amber-700">{Math.ceil(orderSummary.rawMaterials.piangua)}u</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-700">Olores:</span>
                    <span className="font-semibold text-green-700">{orderSummary.rawMaterials.olores.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Mezcla:</span>
                    <span className="font-semibold text-orange-700">{orderSummary.rawMaterials.mezclaJugo.toFixed(0)}ml</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-700">Envases:</span>
                    <span className="font-semibold text-gray-700">{orderSummary.rawMaterials.envases}u</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desglose del pedido */}
          {orderSummary.itemCount > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3 text-gray-700">Desglose del pedido</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(quantities).map(([cevicheId, qty]) => {
                  if (qty > 0) {
                    const cevicheCost = cevicheCosts.find(c => c.ceviche.id === cevicheId);
                    if (cevicheCost) {
                      const finalPrice = customPrices[cevicheId] || cevicheCost.precioVenta;
                      return (
                        <div key={cevicheId} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{cevicheCost.ceviche.name}</span>
                            <span className="text-gray-600">x{qty}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(finalPrice * qty)}</span>
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculadoraPedidos;
