import { useState, useEffect } from 'react';
import MenuCeviches from '../components/MenuCeviches';
import Header from '../components/Header';
import { api } from '../services/api';

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

function MenuPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos desde la API
  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.getProducts();
        setProducts(response.data.products);
        setCategories(response.data.categories);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error al cargar el menú. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6">
            <svg className="animate-spin h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-slate-600 font-medium text-lg">Cargando menú...</p>
          <p className="text-slate-400 text-sm mt-1">Preparando los mejores ceviches</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <MenuCeviches products={products} categories={categories} />
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
