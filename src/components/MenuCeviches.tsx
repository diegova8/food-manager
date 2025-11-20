import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CevicheCost } from '../types';
import { formatCurrency, categorizeByIngredientCount } from '../utils';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png';

interface MenuCevichesProps {
  cevicheCosts: CevicheCost[];
  customPrices: { [key: string]: number };
}

const MenuCeviches: React.FC<MenuCevichesProps> = ({ cevicheCosts, customPrices }) => {
  const navigate = useNavigate();
  const { getTotalItems, getTotalPrice, addItem } = useCart();

  const getFinalPrice = (ceviche: CevicheCost): number => {
    return customPrices[ceviche.ceviche.id] || ceviche.precioVenta;
  };

  const handleCheckout = () => {
    if (getTotalItems() === 0) {
      alert('Tu carrito está vacío. Agrega algunos ceviches para continuar.');
      return;
    }
    navigate('/checkout');
  };

  const handleOrderNow = (ceviche: CevicheCost) => {
    const finalPrice = getFinalPrice(ceviche);
    addItem(ceviche.ceviche.id, ceviche.ceviche.name, finalPrice);
  };

  // Agrupar ceviches por número de ingredientes
  const { single: singleIngredient, double: twoIngredients, triple: threeIngredients, quadruple: fourIngredients } = categorizeByIngredientCount(cevicheCosts);

  const renderStars = () => (
    <div className="flex justify-center gap-1 mb-2">
      {[1, 2, 3, 4].map((star) => (
        <svg key={star} className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
      <svg className="w-4 h-4 fill-gray-300" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    </div>
  );

  const renderMenuSection = (ceviches: CevicheCost[], title: string) => (
    <div className="mb-12">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {ceviches.map((c) => {
          const finalPrice = getFinalPrice(c);
          return (
            <div
              key={c.ceviche.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col items-center"
            >
              {/* Circular Image with Dashed Border */}
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-pink-300 p-2">
                  <img
                    src={logo}
                    alt={c.ceviche.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Product Name */}
              <h4 className="text-lg font-bold text-gray-800 text-center mb-2">
                {c.ceviche.name}
              </h4>

              {/* Star Rating */}
              {renderStars()}

              {/* Subtitle */}
              <p className="text-sm text-gray-500 mb-3">
                Ceviche Fresco del Día
              </p>

              {/* Price */}
              <div className="text-2xl font-bold text-pink-600 mb-4">
                {formatCurrency(finalPrice)}
              </div>

              {/* Order Now Button */}
              <button
                onClick={() => handleOrderNow(c)}
                className="w-full bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                AGREGAR
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header with Logo */}
      <div className="text-center mb-12">
        <img src={logo} alt="Ceviche de mi Tata" className="mx-auto h-32 mb-4" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Nuestro Menú</h1>
        <p className="text-gray-600">Los mejores ceviches de la costa</p>
      </div>

      {/* Menu Sections */}
      {renderMenuSection(singleIngredient, 'Ceviches de 1 sabor')}
      {renderMenuSection(twoIngredients, 'Ceviches de 2 sabores')}
      {renderMenuSection(threeIngredients, 'Ceviches de 3 sabores')}
      {renderMenuSection(fourIngredients, 'Ceviche Mixto Full')}

      {/* Floating Cart Summary */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-pink-500 shadow-2xl p-4 z-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-gray-500">Ceviches</div>
                  <div className="text-xl font-bold text-gray-800">
                    {getTotalItems()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-2xl font-bold text-pink-600">
                    {formatCurrency(getTotalPrice())}
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="bg-pink-600 hover:bg-pink-700 text-white py-3 px-8 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                IR AL CHECKOUT
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            {getTotalItems() >= 90 && (
              <p className="text-xs text-amber-600 mt-2 text-center">
                ⚠️ Estás cerca del límite de 100 ceviches
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-16 mb-8 text-center text-sm text-gray-500">
        <p>Precios en colones costarricenses (₡)</p>
        <p className="mt-2 text-xs">
          Máximo 100 ceviches por pedido online. Para pedidos mayores, contáctanos directamente.
        </p>
      </div>
    </div>
  );
};

export default MenuCeviches;
