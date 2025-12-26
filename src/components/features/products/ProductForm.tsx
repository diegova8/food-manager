import { useState, useEffect, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import toast from 'react-hot-toast';
import { Modal, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';
import { IngredientSelectorModal, type RawMaterial } from './IngredientSelectorModal';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: { _id: string; name: string; slug: string };
  pricingType: 'ingredient-based' | 'fixed';
  ingredients?: Array<{ rawMaterialId: string; quantity: number }>;
  fixedPrice?: number;
  servings?: number;
  comboDescription?: string;
  costoProd?: number;
  precioSugerido?: number;
  precioVenta?: number;
  imageUrl?: string;
  isActive: boolean;
  isAvailable: boolean;
  displayOrder: number;
  tags?: string[];
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
  categories: Category[];
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  pricingType: 'ingredient-based' | 'fixed';
  ingredients: Array<{ rawMaterialId: string; quantity: number }>;
  fixedPrice: number;
  servings: number;
  comboDescription: string;
  imageUrl: string;
  isActive: boolean;
  isAvailable: boolean;
  displayOrder: number;
  precioVenta: number | null; // Custom price (null = use suggested)
}

const initialFormData: FormData = {
  name: '',
  slug: '',
  description: '',
  category: '',
  pricingType: 'ingredient-based',
  ingredients: [],
  fixedPrice: 0,
  servings: 0,
  comboDescription: '',
  imageUrl: '',
  isActive: true,
  isAvailable: true,
  displayOrder: 0,
  precioVenta: null,
};

const DEFAULT_MARKUP = 2.5;

const UNIT_LABELS: Record<string, string> = {
  g: 'g',
  ml: 'ml',
  unit: 'uds',
};

const DEFAULT_QUANTITIES: Record<string, number> = {
  g: 100,
  ml: 100,
  unit: 1,
};

export function ProductForm({ isOpen, onClose, onSuccess, product, categories }: ProductFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Raw materials state
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);

  const isEditing = !!product;

  // Fetch raw materials when modal opens
  useEffect(() => {
    if (isOpen && rawMaterials.length === 0) {
      fetchRawMaterials();
    }
  }, [isOpen]);

  const fetchRawMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const response = await api.getRawMaterials(false);
      setRawMaterials(response.data.rawMaterials);
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      toast.error('Error al cargar ingredientes');
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    if (product) {
      // If product has a custom price different from suggested, use it
      const hasCustomPrice = product.precioVenta !== undefined &&
        product.precioSugerido !== undefined &&
        product.precioVenta !== product.precioSugerido;

      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        category: product.category._id,
        pricingType: product.pricingType,
        ingredients: product.ingredients || [],
        fixedPrice: product.fixedPrice || 0,
        servings: product.servings || 0,
        comboDescription: product.comboDescription || '',
        imageUrl: product.imageUrl || '',
        isActive: product.isActive,
        isAvailable: product.isAvailable,
        displayOrder: product.displayOrder,
        precioVenta: hasCustomPrice ? product.precioVenta! : null,
      });
      setImagePreview(product.imageUrl || null);
    } else {
      setFormData(initialFormData);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : generateSlug(name),
    }));
  };

  // Handle ingredient selection from modal
  const handleIngredientsSelected = (selectedIds: string[]) => {
    setFormData(prev => {
      // Keep existing quantities for ingredients that are still selected
      const existingMap = new Map(
        prev.ingredients.map(i => [i.rawMaterialId, i.quantity])
      );

      // Build new ingredients array
      const newIngredients = selectedIds.map(id => {
        if (existingMap.has(id)) {
          return { rawMaterialId: id, quantity: existingMap.get(id)! };
        }
        // New ingredient - set default quantity based on unit type
        const material = rawMaterials.find(m => m._id === id);
        const defaultQty = material ? DEFAULT_QUANTITIES[material.unit] : 100;
        return { rawMaterialId: id, quantity: defaultQty };
      });

      return { ...prev, ingredients: newIngredients };
    });
  };

  const handleIngredientQuantityChange = (rawMaterialId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(i =>
        i.rawMaterialId === rawMaterialId ? { ...i, quantity } : i
      ),
    }));
  };

  const handleRemoveIngredient = (rawMaterialId: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i.rawMaterialId !== rawMaterialId),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imagenes (PNG, JPG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageUploading(true);

    try {
      const timestamp = Date.now();
      const ext = file.name.substring(file.name.lastIndexOf('.'));
      const filename = `product-${timestamp}${ext}`;

      const blob = await upload(filename, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/client-token',
      });

      setFormData(prev => ({ ...prev, imageUrl: blob.url }));
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir la imagen');
      setImagePreview(formData.imageUrl || null);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('El slug es requerido');
      return;
    }

    if (!formData.category) {
      toast.error('La categoria es requerida');
      return;
    }

    if (formData.pricingType === 'ingredient-based' && formData.ingredients.length === 0) {
      toast.error('Debe seleccionar al menos un ingrediente');
      return;
    }

    if (formData.pricingType === 'fixed' && formData.fixedPrice <= 0) {
      toast.error('El precio fijo debe ser mayor a 0');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        category: formData.category,
        pricingType: formData.pricingType,
        ...(formData.pricingType === 'ingredient-based' && {
          ingredients: formData.ingredients,
          // Include custom price if set, otherwise backend will use suggested price
          precioVenta: formData.precioVenta !== null ? formData.precioVenta : undefined,
        }),
        ...(formData.pricingType === 'fixed' && {
          fixedPrice: formData.fixedPrice,
          servings: formData.servings || undefined,
          comboDescription: formData.comboDescription || undefined,
        }),
        imageUrl: formData.imageUrl || undefined,
        isActive: formData.isActive,
        isAvailable: formData.isAvailable,
        displayOrder: formData.displayOrder,
      };

      if (isEditing && product) {
        await api.updateProduct(product._id, payload);
        toast.success('Producto actualizado');
      } else {
        await api.createProduct(payload);
        toast.success('Producto creado');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  // Get material info by ID
  const getMaterialById = (id: string): RawMaterial | undefined => {
    return rawMaterials.find(m => m._id === id || m.slug === id);
  };

  // Calculate estimated cost and suggested price
  const calculatePrices = (): { costoProd: number; precioSugerido: number } => {
    if (formData.pricingType !== 'ingredient-based') {
      return { costoProd: 0, precioSugerido: 0 };
    }

    let costoProd = 0;
    for (const ingredient of formData.ingredients) {
      const material = getMaterialById(ingredient.rawMaterialId);
      if (material) {
        costoProd += (material.price * ingredient.quantity);
      }
    }

    const precioSugerido = Math.round(costoProd * DEFAULT_MARKUP);
    return { costoProd: Math.round(costoProd), precioSugerido };
  };

  const { costoProd: estimatedCost, precioSugerido } = calculatePrices();

  // Final price to display (custom or suggested)
  const finalPrice = formData.precioVenta !== null ? formData.precioVenta : precioSugerido;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        size="full"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            {/* LEFT COLUMN - Basic Info & Image */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Informacion Basica</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ej: Ceviche de Camaron"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  placeholder="ceviche-camaron"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Seleccionar</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Precio *
                  </label>
                  <select
                    value={formData.pricingType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      pricingType: e.target.value as 'ingredient-based' | 'fixed'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="ingredient-based">Ingredientes</option>
                    <option value="fixed">Precio fijo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripcion
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Descripcion opcional"
                />
              </div>

              {/* Image & Settings */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className={`w-20 h-20 object-cover rounded-lg border-2 border-gray-200 ${imageUploading ? 'opacity-50' : ''}`}
                        />
                        {imageUploading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-6 h-6 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          </div>
                        )}
                        {!imageUploading && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            x
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={imageUploading}
                        className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all flex items-center justify-center"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Settings */}
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Configuracion</label>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Orden</label>
                        <input
                          type="number"
                          value={formData.displayOrder}
                          onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          min={0}
                        />
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">Activo</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isAvailable}
                          onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">Disponible</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Pricing */}
            <div className="space-y-4">
              {/* Ingredient-based pricing */}
              {formData.pricingType === 'ingredient-based' && (
                <>
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-medium text-gray-700">Ingredientes</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIngredientModalOpen(true)}
                      disabled={loadingMaterials}
                    >
                      {loadingMaterials ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Agregar
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Selected ingredients list */}
                  {formData.ingredients.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                      <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <p className="text-gray-500 text-sm">Sin ingredientes</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {formData.ingredients.map(ingredient => {
                        const material = getMaterialById(ingredient.rawMaterialId);
                        if (!material) return null;

                        const ingredientCost = material.price * ingredient.quantity;

                        return (
                          <div
                            key={ingredient.rawMaterialId}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group"
                          >
                            <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {material.imageUrl ? (
                                <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
                              ) : material.icon ? (
                                <span className="text-sm">{material.icon}</span>
                              ) : (
                                <span className="text-gray-400 text-xs">N/A</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900 block truncate">{material.name}</span>
                            </div>

                            <input
                              type="number"
                              value={ingredient.quantity}
                              onChange={(e) => handleIngredientQuantityChange(ingredient.rawMaterialId, parseFloat(e.target.value) || 0)}
                              onKeyDown={(e) => {
                                // Custom step behavior: arrow keys move by 10 for g/ml, 1 for units
                                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  const stepAmount = material.unit === 'unit' ? 1 : 10;
                                  const delta = e.key === 'ArrowUp' ? stepAmount : -stepAmount;
                                  const newValue = Math.max(0, ingredient.quantity + delta);
                                  handleIngredientQuantityChange(ingredient.rawMaterialId, newValue);
                                }
                              }}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 text-right"
                              min={0}
                              step="any"
                            />
                            <span className="text-xs text-gray-500 w-6">{UNIT_LABELS[material.unit]}</span>

                            <span className="text-xs font-medium text-gray-600 w-16 text-right">
                              ₡{ingredientCost.toLocaleString()}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(ingredient.rawMaterialId)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {formData.ingredients.length > 0 && (
                    <div className="pt-3 border-t border-gray-200 space-y-3">
                      {/* Cost Summary */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Costo:</span>
                          <span className="font-medium text-gray-900">₡{estimatedCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Sugerido (x{DEFAULT_MARKUP}):</span>
                          <span className="font-bold text-orange-600">₡{precioSugerido.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Custom Price Input */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={formData.precioVenta !== null}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                precioVenta: e.target.checked ? precioSugerido : null
                              }))}
                              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Precio personalizado</span>
                          </label>
                          {formData.precioVenta !== null && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">₡</span>
                              <input
                                type="number"
                                value={formData.precioVenta}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  precioVenta: parseInt(e.target.value) || 0
                                }))}
                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                min={0}
                                step={500}
                              />
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-sm text-gray-600">Precio final:</span>
                          <span className="text-lg font-bold text-green-600">₡{finalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Fixed pricing */}
              {formData.pricingType === 'fixed' && (
                <>
                  <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Precio Fijo (Combo)</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio (₡) *</label>
                      <input
                        type="number"
                        value={formData.fixedPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, fixedPrice: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        min={0}
                        step={500}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Porciones</label>
                      <input
                        type="number"
                        value={formData.servings}
                        onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        min={0}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion del Combo</label>
                    <textarea
                      value={formData.comboDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, comboDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ej: Incluye 5 ceviches de pescado, 5 de camaron..."
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <ModalFooter className="mt-6">
            <Button variant="ghost" onClick={onClose} disabled={saving || imageUploading}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving} disabled={imageUploading}>
              {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Ingredient Selector Modal */}
      <IngredientSelectorModal
        isOpen={ingredientModalOpen}
        onClose={() => setIngredientModalOpen(false)}
        onConfirm={handleIngredientsSelected}
        rawMaterials={rawMaterials}
        alreadySelected={formData.ingredients.map(i => i.rawMaterialId)}
      />
    </>
  );
}

export default ProductForm;
