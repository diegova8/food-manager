import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils';

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

function RestaurantMenuPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
            <svg className="animate-spin h-10 w-10 text-orange-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-slate-700 font-medium text-lg">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-700 font-medium text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Group products by category
  const productsByCategory = new Map<string, Product[]>();
  const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  sortedCategories.forEach(cat => {
    productsByCategory.set(cat._id, []);
  });

  products
    .filter(p => p.isAvailable)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .forEach(product => {
      const categoryId = product.category._id;
      const existing = productsByCategory.get(categoryId) || [];
      productsByCategory.set(categoryId, [...existing, product]);
    });

  const whatsappNumber = '60008080';
  const whatsappMessage = encodeURIComponent('Hola! Me gustaría hacer un pedido.');
  const whatsappLink = `https://wa.me/506${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-12 shadow-lg print:py-6">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 print:text-4xl">
            Menú
          </h1>
          <div className="w-24 h-1 bg-white mx-auto mb-4"></div>
          <p className="text-xl md:text-2xl font-light opacity-90 print:text-lg">
            Ceviches Porteños Tradicionales
          </p>
        </div>
      </div>

      {/* WhatsApp Contact Banner */}
      <div className="bg-green-600 text-white py-6 print:hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-lg mb-3">
            ¿Deseas hacer un pedido?
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-green-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-green-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>6000-8080</span>
          </a>
        </div>
      </div>

      {/* Print-only contact info */}
      <div className="hidden print:block bg-green-100 border-2 border-green-600 py-4 mt-6">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-green-800 text-lg font-bold mb-2">
            Para hacer pedidos, contáctanos por WhatsApp:
          </p>
          <p className="text-green-900 text-3xl font-bold">
            6000-8080
          </p>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 print:py-6">
        {sortedCategories.map(category => {
          const categoryProducts = productsByCategory.get(category._id) || [];
          if (categoryProducts.length === 0) return null;

          // Special rendering for ceviches category
          if (category.slug === 'ceviches') {
            const { single, double, triple, quadruple } = groupCevichesByIngredients(categoryProducts);

            return (
              <div key={category._id}>
                {single.length > 0 && (
                  <div className="mb-12 print:mb-8 print:break-inside-avoid">
                    <div className="mb-6 print:mb-4">
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 print:text-2xl">
                        Ceviches de 1 sabor
                      </h2>
                      <div className="w-20 h-1 bg-orange-500"></div>
                    </div>
                    <div className="space-y-4 print:space-y-2">
                      {single.map(product => (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow print:shadow-none print:border print:border-slate-200 print:p-4"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2 print:text-lg">
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-slate-600 text-sm md:text-base print:text-sm">
                                  {product.description}
                                </p>
                              )}
                              {product.comboDescription && (
                                <p className="text-slate-600 text-sm md:text-base italic mt-1 print:text-sm">
                                  {product.comboDescription}
                                </p>
                              )}
                              {product.servings && (
                                <p className="text-orange-600 text-sm font-medium mt-1">
                                  Para {product.servings} personas
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-2xl md:text-3xl font-bold text-orange-600 print:text-xl">
                                {formatCurrency(product.precioVenta)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {double.length > 0 && (
                  <div className="mb-12 print:mb-8 print:break-inside-avoid">
                    <div className="mb-6 print:mb-4">
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 print:text-2xl">
                        Ceviches de 2 sabores
                      </h2>
                      <div className="w-20 h-1 bg-orange-500"></div>
                    </div>
                    <div className="space-y-4 print:space-y-2">
                      {double.map(product => (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow print:shadow-none print:border print:border-slate-200 print:p-4"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2 print:text-lg">
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-slate-600 text-sm md:text-base print:text-sm">
                                  {product.description}
                                </p>
                              )}
                              {product.comboDescription && (
                                <p className="text-slate-600 text-sm md:text-base italic mt-1 print:text-sm">
                                  {product.comboDescription}
                                </p>
                              )}
                              {product.servings && (
                                <p className="text-orange-600 text-sm font-medium mt-1">
                                  Para {product.servings} personas
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-2xl md:text-3xl font-bold text-orange-600 print:text-xl">
                                {formatCurrency(product.precioVenta)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {triple.length > 0 && (
                  <div className="mb-12 print:mb-8 print:break-inside-avoid">
                    <div className="mb-6 print:mb-4">
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 print:text-2xl">
                        Ceviches de 3 sabores
                      </h2>
                      <div className="w-20 h-1 bg-orange-500"></div>
                    </div>
                    <div className="space-y-4 print:space-y-2">
                      {triple.map(product => (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow print:shadow-none print:border print:border-slate-200 print:p-4"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2 print:text-lg">
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-slate-600 text-sm md:text-base print:text-sm">
                                  {product.description}
                                </p>
                              )}
                              {product.comboDescription && (
                                <p className="text-slate-600 text-sm md:text-base italic mt-1 print:text-sm">
                                  {product.comboDescription}
                                </p>
                              )}
                              {product.servings && (
                                <p className="text-orange-600 text-sm font-medium mt-1">
                                  Para {product.servings} personas
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-2xl md:text-3xl font-bold text-orange-600 print:text-xl">
                                {formatCurrency(product.precioVenta)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {quadruple.length > 0 && (
                  <div className="mb-12 print:mb-8 print:break-inside-avoid">
                    <div className="mb-6 print:mb-4">
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 print:text-2xl">
                        Ceviche Mixto Full
                      </h2>
                      <div className="w-20 h-1 bg-orange-500"></div>
                    </div>
                    <div className="space-y-4 print:space-y-2">
                      {quadruple.map(product => (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow print:shadow-none print:border print:border-slate-200 print:p-4"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2 print:text-lg">
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-slate-600 text-sm md:text-base print:text-sm">
                                  {product.description}
                                </p>
                              )}
                              {product.comboDescription && (
                                <p className="text-slate-600 text-sm md:text-base italic mt-1 print:text-sm">
                                  {product.comboDescription}
                                </p>
                              )}
                              {product.servings && (
                                <p className="text-orange-600 text-sm font-medium mt-1">
                                  Para {product.servings} personas
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-2xl md:text-3xl font-bold text-orange-600 print:text-xl">
                                {formatCurrency(product.precioVenta)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Regular category rendering (combos, etc.)
          return (
            <div key={category._id} className="mb-12 print:mb-8 print:break-inside-avoid">
              <div className="mb-6 print:mb-4">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 print:text-2xl">
                  {category.name}
                </h2>
                <div className="w-20 h-1 bg-orange-500"></div>
              </div>
              <div className="space-y-4 print:space-y-2">
                {categoryProducts.map(product => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow print:shadow-none print:border print:border-slate-200 print:p-4"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2 print:text-lg">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-slate-600 text-sm md:text-base print:text-sm">
                            {product.description}
                          </p>
                        )}
                        {product.comboDescription && (
                          <p className="text-slate-600 text-sm md:text-base italic mt-1 print:text-sm">
                            {product.comboDescription}
                          </p>
                        )}
                        {product.servings && (
                          <p className="text-orange-600 text-sm font-medium mt-1">
                            Para {product.servings} personas
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl md:text-3xl font-bold text-orange-600 print:text-xl">
                          {formatCurrency(product.precioVenta)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t-2 border-orange-200 text-center print:mt-8 print:pt-4">
          <p className="text-slate-600 text-sm mb-2">
            Precios en colones costarricenses (₡)
          </p>
          <p className="text-slate-500 text-xs">
            Los precios están sujetos a cambios sin previo aviso
          </p>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 hover:shadow-xl transition-all transform hover:scale-110 print:hidden z-50"
        aria-label="Hacer pedido por WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}

export default RestaurantMenuPage;
