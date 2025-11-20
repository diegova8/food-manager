import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CevicheCost } from '../types';
import { formatCurrency, categorizeByIngredientCount } from '../utils';
import { useCart } from '../context/CartContext';
import CevicheCounter from './CevicheCounter';

interface MenuCevichesProps {
  cevicheCosts: CevicheCost[];
  customPrices: { [key: string]: number };
}

const MenuCeviches: React.FC<MenuCevichesProps> = ({ cevicheCosts, customPrices }) => {
  const navigate = useNavigate();
  const { getTotalItems, getTotalPrice } = useCart();

  const getFinalPrice = (ceviche: CevicheCost): number => {
    return customPrices[ceviche.ceviche.id] || ceviche.precioVenta;
  };

  const handleCheckout = () => {
    if (getTotalItems() === 0) {
      alert('Tu carrito está vacío. Agrega algunos ceviches para continuar.');
      return;
    }
    // TODO: Navigate to checkout page
    navigate('/checkout');
  };
  const getCevicheEmojis = (cevicheId: string): string => {
    const emojis: string[] = [];
    if (cevicheId.includes('pescado')) emojis.push('🐟');
    if (cevicheId.includes('camaron')) emojis.push('🦐');
    if (cevicheId.includes('pulpo')) emojis.push('🐙');
    if (cevicheId.includes('piangua')) emojis.push('🐚');
    return emojis.join('');
  };

  // Agrupar ceviches por número de ingredientes
  const { single: singleIngredient, double: twoIngredients, triple: threeIngredients, quadruple: fourIngredients } = categorizeByIngredientCount(cevicheCosts);

  const renderMenuSection = (ceviches: CevicheCost[], title: string) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4 text-blue-800 border-b-2 border-blue-300 pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ceviches.map((c) => {
          const finalPrice = getFinalPrice(c);
          return (
            <div
              key={c.ceviche.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">{getCevicheEmojis(c.ceviche.id)}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-lg">{c.ceviche.name}</div>
                  <div className="text-xl font-bold text-green-600 mt-1">
                    {formatCurrency(finalPrice)}
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <CevicheCounter
                  id={c.ceviche.id}
                  name={c.ceviche.name}
                  price={finalPrice}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-lg p-8">

      {renderMenuSection(singleIngredient, 'Ceviches de 1 sabor')}
      {renderMenuSection(twoIngredients, 'Ceviches de 2 sabores')}
      {renderMenuSection(threeIngredients, 'Ceviches de 3 sabores')}
      {renderMenuSection(fourIngredients, 'Ceviche Mixto Full')}

      {/* Cart Summary and Checkout Button */}
      {getTotalItems() > 0 && (
        <div className="mt-8 sticky bottom-4 bg-white rounded-lg shadow-2xl border-2 border-blue-400 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600">Total de ceviches</div>
              <div className="text-2xl font-bold text-blue-600">
                {getTotalItems()} {getTotalItems() === 1 ? 'ceviche' : 'ceviches'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total a pagar</div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(getTotalPrice())}
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Realizar Pedido 🛒
          </button>
          {getTotalItems() >= 90 && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              ⚠️ Estás cerca del límite de 100 ceviches
            </p>
          )}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Precios en colones costarricenses (₡)</p>
        <p className="mt-2 text-xs">
          Máximo 100 ceviches por pedido online. Para pedidos mayores, contáctanos directamente.
        </p>
      </div>
    </div>
  );
};

export default MenuCeviches;
