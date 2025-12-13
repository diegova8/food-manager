import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils';
import { useCart } from '../context/CartContext';
import { MenuCard } from './MenuCard';

// Import local ceviche images
import camaronImg from '../assets/ceviches/camaron.png';
import pulpoImg from '../assets/ceviches/pulpo.png';
import camaronPulpoImg from '../assets/ceviches/camaron-pulpo.png';
import pulpoPianguaImg from '../assets/ceviches/pulpo-piangua.png';
import pescadoImg from '../assets/ceviches/pescado.png';
import cevichePlaceholder from '../assets/logo.png';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: { _id: string; name: string; slug: string };
  pricingType: 'ingredient-based' | 'fixed';
  ingredients?: Array<{ rawMaterialId: string; quantity: number }>;
  imageUrl?: string;
  isActive: boolean;
  isAvailable: boolean;
  displayOrder: number;
  tags?: string[];
  costoProd: number;
  precioVenta: number;
  servings?: number;
  comboDescription?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
}

interface MenuCevichesProps {
  products: Product[];
  categories: Category[];
}

const MenuCeviches: React.FC<MenuCevichesProps> = ({ products, categories }) => {
  const navigate = useNavigate();
  const { addItem, removeItem, getTotalItems, getTotalPrice, getItemQuantity } = useCart();

  const handleCheckout = () => {
    if (getTotalItems() === 0) {
      alert('Tu carrito está vacío. Agrega algunos productos para continuar.');
      return;
    }
    navigate('/checkout');
  };

  const getPlaceholderImage = (slug: string): string => {
    const imageMap: Record<string, string> = {
      'pescado': pescadoImg,
      'camaron': camaronImg,
      'pulpo': pulpoImg,
      'piangua': cevichePlaceholder,
      'pescado-camaron': cevichePlaceholder,
      'pescado-pulpo': cevichePlaceholder,
      'pescado-piangua': cevichePlaceholder,
      'camaron-pulpo': camaronPulpoImg,
      'camaron-piangua': cevichePlaceholder,
      'pulpo-piangua': pulpoPianguaImg,
      'pescado-camaron-pulpo': cevichePlaceholder,
      'pescado-camaron-piangua': cevichePlaceholder,
      'pescado-pulpo-piangua': cevichePlaceholder,
      'camaron-pulpo-piangua': cevichePlaceholder,
      'pescado-camaron-pulpo-piangua': cevichePlaceholder,
    };
    return imageMap[slug] || cevichePlaceholder;
  };

  const calculateRating = (product: Product): number => {
    if (product.pricingType === 'fixed') return 5; // Combos get 5 stars
    const ingredientCount = product.ingredients?.length || 1;
    if (ingredientCount >= 4) return 5;
    if (ingredientCount === 3) return 5;
    if (ingredientCount === 2) return 4;
    return 4;
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    const product = products.find(p => p.slug === id);
    if (!product) return;

    if (quantity === 0) {
      removeItem(id);
    } else {
      const currentQuantity = getItemQuantity(id);
      if (quantity > currentQuantity) {
        addItem(id, product.name, product.precioVenta);
      } else {
        removeItem(id);
      }
    }
  };

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, Product[]>();

    // Sort categories by displayOrder
    const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

    // Initialize with empty arrays for each category
    sortedCategories.forEach(cat => {
      grouped.set(cat._id, []);
    });

    // Group products - filter only available ones
    products
      .filter(p => p.isAvailable)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .forEach(product => {
        const categoryId = product.category._id;
        const existing = grouped.get(categoryId) || [];
        grouped.set(categoryId, [...existing, product]);
      });

    return grouped;
  }, [products, categories]);

  // For ceviches category, group by ingredient count
  const groupCevichesByIngredients = (ceviches: Product[]) => {
    const groups = {
      single: [] as Product[],
      double: [] as Product[],
      triple: [] as Product[],
      quadruple: [] as Product[],
    };

    ceviches.forEach(product => {
      const count = product.ingredients?.length || 1;
      if (count === 1) groups.single.push(product);
      else if (count === 2) groups.double.push(product);
      else if (count === 3) groups.triple.push(product);
      else groups.quadruple.push(product);
    });

    return groups;
  };

  const renderProductCard = (product: Product) => {
    const image = product.imageUrl || getPlaceholderImage(product.slug);
    const rating = calculateRating(product);
    const subtitle = product.pricingType === 'fixed'
      ? (product.servings ? `Para ${product.servings} personas` : 'Combo Especial')
      : 'Ceviche Porteño Tradicional';

    return (
      <MenuCard
        key={product.slug}
        id={product.slug}
        name={product.name}
        image={image}
        rating={rating}
        subtitle={subtitle}
        price={product.precioVenta}
        quantity={getItemQuantity(product.slug)}
        totalItems={getTotalItems()}
        onQuantityChange={handleQuantityChange}
      />
    );
  };

  const renderCevichesCategory = (ceviches: Product[]) => {
    const { single, double, triple, quadruple } = groupCevichesByIngredients(ceviches);

    return (
      <>
        {single.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-orange-300">
              Ceviches de 1 sabor
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {single.map(renderProductCard)}
            </div>
          </div>
        )}
        {double.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-orange-300">
              Ceviches de 2 sabores
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {double.map(renderProductCard)}
            </div>
          </div>
        )}
        {triple.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-orange-300">
              Ceviches de 3 sabores
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {triple.map(renderProductCard)}
            </div>
          </div>
        )}
        {quadruple.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-orange-300">
              Ceviche Mixto Full
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {quadruple.map(renderProductCard)}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderCombosCategory = (combos: Product[], categoryName: string) => {
    if (combos.length === 0) return null;

    return (
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-orange-300">
          {categoryName}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {combos.map(renderProductCard)}
        </div>
      </div>
    );
  };

  // Sort categories by displayOrder
  const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {sortedCategories.map(category => {
          const categoryProducts = productsByCategory.get(category._id) || [];
          if (categoryProducts.length === 0) return null;

          // Special rendering for ceviches category (group by ingredient count)
          if (category.slug === 'ceviches') {
            return <React.Fragment key={category._id}>{renderCevichesCategory(categoryProducts)}</React.Fragment>;
          }

          // Regular category rendering (combos, etc.)
          return (
            <React.Fragment key={category._id}>
              {renderCombosCategory(categoryProducts, category.name)}
            </React.Fragment>
          );
        })}

        <div className="mt-8 text-center text-sm text-slate-600">
          <p>Precios en colones costarricenses (₡)</p>
          <p className="mt-2 text-xs">
            Máximo 100 productos por pedido online. Para pedidos mayores, contáctanos directamente.
          </p>
        </div>
      </div>

      {/* Cart Summary Fixed Footer */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 shadow-lg p-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-600 text-sm block">Total de productos</span>
                <span className="text-slate-900 font-semibold text-lg">
                  {getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'}
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
              ⚠️ Estás cerca del límite de 100 productos
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuCeviches;
