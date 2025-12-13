import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { SearchInput } from '../../components/shared/SearchInput';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ProductForm } from '../../components/features/products';
import { api } from '../../services/api';
import { cn } from '../../utils/cn';

interface Category {
  _id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: { _id: string; name: string; slug: string };
  pricingType: 'ingredient-based' | 'fixed';
  ingredients?: Array<{ rawMaterialId: string; quantity: number }>;
  olores?: number;
  mezclaJugo?: number;
  fixedPrice?: number;
  servings?: number;
  comboDescription?: string;
  imageUrl?: string;
  isActive: boolean;
  isAvailable: boolean;
  displayOrder: number;
  tags?: string[];
  costoProd: number;
  precioVenta: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 20;

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pricingTypeFilter, setPricingTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Product form
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getProductsAdmin({
        search: search || undefined,
        category: categoryFilter || undefined,
        pricingType: pricingTypeFilter || undefined,
        isActive: activeFilter === '' ? undefined : activeFilter === 'true',
        page: pagination.page,
        limit: ITEMS_PER_PAGE
      });

      if (response.success) {
        setProducts(response.data.products);
        setCategories(response.data.categories);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, pricingTypeFilter, activeFilter, pagination.page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [search, categoryFilter, pricingTypeFilter, activeFilter]);

  const handleMigrate = async () => {
    if (!confirm('Esto creará las categorías por defecto y migrará los 15 ceviches a la base de datos. ¿Continuar?')) {
      return;
    }

    setMigrating(true);
    try {
      const response = await api.migrateProducts();
      if (response.success) {
        toast.success(`Migración completada: ${response.data.results.productsCreated} productos creados`);
        loadProducts();
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Error durante la migración');
    } finally {
      setMigrating(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await api.updateProduct(product._id, { isActive: !product.isActive });
      toast.success(product.isActive ? 'Producto desactivado' : 'Producto activado');
      loadProducts();
    } catch (error) {
      console.error('Error toggling product:', error);
      toast.error('Error al actualizar el producto');
    }
  };

  const handleToggleAvailable = async (product: Product) => {
    try {
      await api.updateProduct(product._id, { isAvailable: !product.isAvailable });
      toast.success(product.isAvailable ? 'Producto marcado como no disponible' : 'Producto marcado como disponible');
      loadProducts();
    } catch (error) {
      console.error('Error toggling product availability:', error);
      toast.error('Error al actualizar el producto');
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await api.deleteProduct(productToDelete._id);
      toast.success('Producto eliminado');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el producto');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading && products.length === 0) {
    return (
      <div>
        <PageHeader title="Productos" description="Gestiona los productos del menú" />
        <LoadingState variant="skeleton" rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Gestiona los productos del menú"
        actions={
          <div className="flex gap-2">
            {products.length === 0 && (
              <button
                onClick={handleMigrate}
                disabled={migrating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {migrating ? 'Migrando...' : 'Migrar Ceviches'}
              </button>
            )}
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormOpen(true);
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Producto
            </button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar productos..."
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>

              <select
                value={pricingTypeFilter}
                onChange={(e) => setPricingTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todos los tipos</option>
                <option value="ingredient-based">Por ingredientes</option>
                <option value="fixed">Precio fijo</option>
              </select>

              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <EmptyState
              title="Sin productos"
              message={search || categoryFilter ? 'No se encontraron productos con los filtros seleccionados' : 'No hay productos registrados. Usa el botón "Migrar Ceviches" para comenzar.'}
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Costo
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {products.map((product) => (
                      <tr
                        key={product._id}
                        className={cn(
                          'transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50',
                          !product.isActive && 'opacity-60'
                        )}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full">
                            {product.category.name}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            product.pricingType === 'ingredient-based'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          )}>
                            {product.pricingType === 'ingredient-based' ? 'Ingredientes' : 'Fijo'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-gray-600 dark:text-slate-300">
                          {product.pricingType === 'ingredient-based' ? formatPrice(product.costoProd) : '-'}
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-gray-900 dark:text-white">
                          {formatPrice(product.precioVenta)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <span className={cn(
                              'w-2 h-2 rounded-full',
                              product.isActive ? 'bg-green-500' : 'bg-gray-400'
                            )} />
                            {!product.isAvailable && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                                Agotado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleAvailable(product)}
                              className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                              title={product.isAvailable ? 'Marcar como agotado' : 'Marcar como disponible'}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleActive(product)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title={product.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {product.isActive ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setFormOpen(true);
                              }}
                              className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Mostrando {((pagination.page - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)} de {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />

      {/* Product Form Modal */}
      <ProductForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={loadProducts}
        product={editingProduct}
        categories={categories}
      />
    </div>
  );
}

export default ProductsPage;
