import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CevicheCost } from '../types';
import { formatCurrency, categorizeByIngredientCount } from '../utils';
import { useCart } from '../context/CartContext';
import { MenuCard } from './MenuCard';

// Import local ceviche images
import camaronImg from '../assets/ceviches/camaron.png';
import pulpoImg from '../assets/ceviches/pulpo.png';
import camaronPulpoImg from '../assets/ceviches/camaron-pulpo.png';
import pulpoPianguaImg from '../assets/ceviches/pulpo-piangua.png';

interface MenuCevichesProps {
  cevicheCosts: CevicheCost[];
  customPrices: { [key: string]: number };
}

const MenuCeviches: React.FC<MenuCevichesProps> = ({ cevicheCosts, customPrices }) => {
  const navigate = useNavigate();
  const { addItem, removeItem, getTotalItems, getTotalPrice, getItemQuantity } = useCart();

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

  const getPlaceholderImage = (cevicheId: string): string => {
    const imageMap: Record<string, string> = {
      'pescado': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400&h=400&fit=crop',
      'camaron': camaronImg,
      'pulpo': pulpoImg,
      'piangua': 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=400&fit=crop',
      'pescado-camaron': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400&h=400&fit=crop',
      'pescado-pulpo': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400&h=400&fit=crop',
      'pescado-piangua': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400&h=400&fit=crop',
      'camaron-pulpo': camaronPulpoImg,
      'camaron-piangua': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop',
      'pulpo-piangua': pulpoPianguaImg,
      'pescado-camaron-pulpo': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400&h=400&fit=crop',
      'pescado-camaron-piangua': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400&h=400&fit=crop',
      'pescado-pulpo-piangua': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400&h=400&fit=crop',
      'camaron-pulpo-piangua': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop',
      'pescado-camaron-pulpo-piangua': 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400&h=400&fit=crop',
    };
    return imageMap[cevicheId] || 'https://images.unsplash.com/photo-1559737558-2f2c99e9b3e7?w=400&h=400&fit=crop';
  };

  const calculateDefaultRating = (ceviche: CevicheCost): number => {
    const ingredients = ceviche.ceviche.ingredients;
    const ingredientCount = Object.values(ingredients).filter(v => v && v > 0).length;

    if (ingredientCount >= 4) return 5;
    if (ingredientCount === 3) return 5;
    if (ingredientCount === 2) return 4;
    return 4;
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    const ceviche = cevicheCosts.find(c => c.ceviche.id === id);
    if (!ceviche) return;

    const finalPrice = getFinalPrice(ceviche);

    if (quantity === 0) {
      removeItem(id);
    } else {
      const currentQuantity = getItemQuantity(id);
      if (quantity > currentQuantity) {
        addItem(id, ceviche.ceviche.name, finalPrice);
      } else {
        removeItem(id);
      }
    }
  };

  // Agrupar ceviches por número de ingredientes
  const { single: singleIngredient, double: twoIngredients, triple: threeIngredients, quadruple: fourIngredients } = categorizeByIngredientCount(cevicheCosts);

  const renderMenuSection = (ceviches: CevicheCost[], title: string) => (
    <div className="mb-12">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-orange-300">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {ceviches.map((c) => {
          const finalPrice = getFinalPrice(c);
          const image = c.image || getPlaceholderImage(c.ceviche.id);
          const rating = c.rating || calculateDefaultRating(c);

          return (
            <MenuCard
              key={c.ceviche.id}
              id={c.ceviche.id}
              name={c.ceviche.name}
              image={image}
              rating={rating}
              subtitle="Ceviche Porteño Tradicional"
              price={finalPrice}
              quantity={getItemQuantity(c.ceviche.id)}
              onQuantityChange={handleQuantityChange}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMenuSection(singleIngredient, 'Ceviches de 1 sabor')}
        {renderMenuSection(twoIngredients, 'Ceviches de 2 sabores')}
        {renderMenuSection(threeIngredients, 'Ceviches de 3 sabores')}
        {renderMenuSection(fourIngredients, 'Ceviche Mixto Full')}

        <div className="mt-8 text-center text-sm text-slate-600">
          <p>Precios en colones costarricenses (₡)</p>
          <p className="mt-2 text-xs">
            Máximo 100 ceviches por pedido online. Para pedidos mayores, contáctanos directamente.
          </p>
        </div>
      </div>

      {/* Cart Summary Fixed Footer */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 shadow-lg p-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-600 text-sm block">Total de ceviches</span>
                <span className="text-slate-900 font-semibold text-lg">
                  {getTotalItems()} {getTotalItems() === 1 ? 'ceviche' : 'ceviches'}
                </span>
              </div>
              <div>
                <span className="text-slate-600 text-sm block">Total a pagar</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Realizar Pedido
            </button>
          </div>
          {getTotalItems() >= 90 && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              ⚠️ Estás cerca del límite de 100 ceviches
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuCeviches;
